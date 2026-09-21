import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import {
  createOrganization,
  createUser,
  findUserByEmail,
  findUserByEmailForRegistration,
  findUserWithOrganizationById,
  type SafeUserRecord,
  type UserRecord,
  type UserWithOrganizationRecord,
} from "../repositories/auth.repository.js";
import type {
  ApiUserRole,
  AuthenticatedUser,
  DatabaseUserRole,
  JwtUserPayload,
  OrganizationSummary,
} from "../types/auth.js";
import { HttpError } from "../utils/http-error.js";
import { getRequiredString, isRecord, isValidEmail } from "../utils/validation.js";

const passwordSaltRounds = 12;
const minimumPasswordLength = 8;
const firstAdminDatabaseRole: DatabaseUserRole = "organization_admin";

type RegisterInput = {
  organizationName: string;
  organizationEmail: string;
  fullName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
};

type RegisterResult = {
  success: true;
  user: AuthenticatedUser;
  organization: OrganizationSummary;
};

type LoginResult = {
  success: true;
  token: string;
  user: AuthenticatedUser;
};

type MeResult = {
  success: true;
  user: AuthenticatedUser;
  organization: OrganizationSummary;
};

export const mapDatabaseRoleToApiRole = (role: DatabaseUserRole): ApiUserRole => {
  if (role === "organization_admin") {
    return "admin";
  }

  return role;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const parseRegisterInput = (body: unknown): RegisterInput => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const organizationName = getRequiredString(body, "organizationName");
  const organizationEmail = normalizeEmail(getRequiredString(body, "organizationEmail"));
  const fullName = getRequiredString(body, "fullName");
  const email = normalizeEmail(getRequiredString(body, "email"));
  const password = getRequiredString(body, "password");

  if (!isValidEmail(organizationEmail)) {
    throw new HttpError(400, "organizationEmail must be a valid email address");
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, "email must be a valid email address");
  }

  if (password.length < minimumPasswordLength) {
    throw new HttpError(400, `password must be at least ${minimumPasswordLength} characters`);
  }

  return {
    organizationName,
    organizationEmail,
    fullName,
    email,
    password,
  };
};

const parseLoginInput = (body: unknown): LoginInput => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const email = normalizeEmail(getRequiredString(body, "email"));
  const password = getRequiredString(body, "password");

  if (!isValidEmail(email)) {
    throw new HttpError(400, "email must be a valid email address");
  }

  return { email, password };
};

const getJwtConfig = (): { secret: string; expiresIn: jwt.SignOptions["expiresIn"] } => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

  if (!secret) {
    throw new HttpError(500, "JWT_SECRET environment variable is required");
  }

  return {
    secret,
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  };
};

const signAuthToken = (user: AuthenticatedUser): string => {
  const jwtConfig = getJwtConfig();

  return jwt.sign(user satisfies JwtUserPayload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

const toAuthenticatedUser = (user: SafeUserRecord | UserRecord): AuthenticatedUser => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: mapDatabaseRoleToApiRole(user.role),
  organizationId: user.organization_id,
});

const toOrganizationSummary = (
  organization: Pick<OrganizationSummary, "id" | "name" | "email" | "logoUrl">
): OrganizationSummary => organization;

const toOrganizationSummaryFromUser = (
  user: UserWithOrganizationRecord
): OrganizationSummary => ({
  id: user.organization_id,
  name: user.organization_name,
  email: user.organization_email,
  logoUrl: user.organization_logo_url,
});

export const registerOrganization = async (body: unknown): Promise<RegisterResult> => {
  const input = parseRegisterInput(body);
  const passwordHash = await bcrypt.hash(input.password, passwordSaltRounds);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await findUserByEmailForRegistration(client, input.email);

    if (existingUser) {
      throw new HttpError(409, "User email is already registered");
    }

    const organization = await createOrganization(
      client,
      input.organizationName,
      input.organizationEmail
    );

    const user = await createUser(
      client,
      organization.id,
      input.fullName,
      input.email,
      passwordHash,
      firstAdminDatabaseRole
    );

    await client.query("COMMIT");

    return {
      success: true,
      user: toAuthenticatedUser(user),
      organization: toOrganizationSummary({
        id: organization.id,
        name: organization.name,
        email: organization.email,
        logoUrl: organization.logo_url,
      }),
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    if (error instanceof HttpError) {
      throw error;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new HttpError(409, "Email is already registered");
    }

    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (body: unknown): Promise<LoginResult> => {
  const input = parseLoginInput(body);
  const user = await findUserByEmail(input.email);
  const invalidCredentialsError = new HttpError(401, "Invalid email or password");

  if (!user) {
    throw invalidCredentialsError;
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

  if (!passwordMatches) {
    throw invalidCredentialsError;
  }

  if (!user.is_active) {
    throw new HttpError(403, "Account is inactive");
  }

  const authenticatedUser = toAuthenticatedUser(user);

  return {
    success: true,
    token: signAuthToken(authenticatedUser),
    user: authenticatedUser,
  };
};

export const loginWithGoogle = async (body: unknown): Promise<LoginResult> => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const credential = getRequiredString(body, "credential");
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new HttpError(500, "GOOGLE_CLIENT_ID environment variable is required");
  }

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!tokenInfoResponse.ok) {
    throw new HttpError(401, "Invalid Google sign-in token");
  }

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== googleClientId) {
    throw new HttpError(401, "Google sign-in token was issued for a different app");
  }

  if (tokenInfo.email_verified !== true && tokenInfo.email_verified !== "true") {
    throw new HttpError(401, "Google account email is not verified");
  }

  if (!tokenInfo.email || !isValidEmail(tokenInfo.email)) {
    throw new HttpError(401, "Google account did not provide a valid email");
  }

  const user = await findUserByEmail(normalizeEmail(tokenInfo.email));

  if (!user) {
    throw new HttpError(404, "No Verixa account found for this Google email");
  }

  if (!user.is_active) {
    throw new HttpError(403, "Account is inactive");
  }

  const authenticatedUser = toAuthenticatedUser(user);

  return {
    success: true,
    token: signAuthToken(authenticatedUser),
    user: authenticatedUser,
  };
};

export const getCurrentUser = async (userId: string): Promise<MeResult> => {
  const user = await findUserWithOrganizationById(userId);

  if (!user || !user.is_active) {
    throw new HttpError(401, "Invalid or expired token");
  }

  return {
    success: true,
    user: toAuthenticatedUser(user),
    organization: toOrganizationSummaryFromUser(user),
  };
};

export const verifyJwtToken = (token: string): AuthenticatedUser => {
  const jwtConfig = getJwtConfig();
  const decoded = jwt.verify(token, jwtConfig.secret);

  if (!isRecord(decoded)) {
    throw new HttpError(401, "Invalid or expired token");
  }

  const id = typeof decoded.id === "string" ? decoded.id : null;
  const fullName = typeof decoded.fullName === "string" ? decoded.fullName : null;
  const email = typeof decoded.email === "string" ? decoded.email : null;
  const role =
    decoded.role === "admin" || decoded.role === "issuer" || decoded.role === "viewer"
      ? decoded.role
      : null;
  const organizationId =
    typeof decoded.organizationId === "string" ? decoded.organizationId : null;

  if (!id || !fullName || !email || !role || !organizationId) {
    throw new HttpError(401, "Invalid or expired token");
  }

  return {
    id,
    fullName,
    email,
    role,
    organizationId,
  };
};
