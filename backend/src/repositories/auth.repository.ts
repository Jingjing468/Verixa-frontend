import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { pool } from "../config/database.js";
import type { DatabaseUserRole } from "../types/auth.js";

type DatabaseClient = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<T>>;
};

export type UserRecord = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: DatabaseUserRole;
  is_active: boolean;
};

export type SafeUserRecord = Omit<UserRecord, "password_hash">;

export type OrganizationRecord = {
  id: string;
  name: string;
  email: string;
  logo_url: string | null;
};

export type UserWithOrganizationRecord = SafeUserRecord & {
  organization_name: string;
  organization_email: string;
  organization_logo_url: string | null;
};

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const result = await pool.query<UserRecord>(
    `
      SELECT id, organization_id, full_name, email, password_hash, role, is_active
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserByEmailForRegistration = async (
  client: PoolClient,
  email: string
): Promise<SafeUserRecord | null> => {
  const result = await client.query<SafeUserRecord>(
    `
      SELECT id, organization_id, full_name, email, role, is_active
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const createOrganization = async (
  client: PoolClient,
  name: string,
  email: string
): Promise<OrganizationRecord> => {
  const result = await client.query<OrganizationRecord>(
    `
      INSERT INTO organizations (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email, logo_url
    `,
    [name, email]
  );

  const organization = result.rows[0];

  if (!organization) {
    throw new Error("Organization creation failed");
  }

  return organization;
};

export const createUser = async (
  client: PoolClient,
  organizationId: string,
  fullName: string,
  email: string,
  passwordHash: string,
  role: DatabaseUserRole
): Promise<SafeUserRecord> => {
  const result = await client.query<SafeUserRecord>(
    `
      INSERT INTO users (organization_id, full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, organization_id, full_name, email, role, is_active
    `,
    [organizationId, fullName, email, passwordHash, role]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User creation failed");
  }

  return user;
};

export const findUserWithOrganizationById = async (
  userId: string,
  client: DatabaseClient = pool
): Promise<UserWithOrganizationRecord | null> => {
  const result = await client.query<UserWithOrganizationRecord>(
    `
      SELECT
        u.id,
        u.organization_id,
        u.full_name,
        u.email,
        u.role,
        u.is_active,
        o.name AS organization_name,
        o.email AS organization_email,
        o.logo_url AS organization_logo_url
      FROM users u
      INNER JOIN organizations o ON o.id = u.organization_id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
};
