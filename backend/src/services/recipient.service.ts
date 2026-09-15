import {
  createRecipient,
  deleteRecipientByIdAndOrganization,
  findRecipientByIdAndOrganization,
  findRecipientsByOrganization,
  updateRecipientByIdAndOrganization,
  type RecipientRecord,
} from "../repositories/recipient.repository.js";
import type {
  CreateRecipientInput,
  Recipient,
  UpdateRecipientInput,
} from "../types/recipient.js";
import { HttpError } from "../utils/http-error.js";
import { getRequiredString, isRecord, isValidEmail } from "../utils/validation.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const toRecipient = (record: RecipientRecord): Recipient => ({
  id: record.id,
  organizationId: record.organization_id,
  fullName: record.full_name,
  email: record.email,
  phone: record.phone,
  createdAt: record.created_at.toISOString(),
  updatedAt: record.updated_at.toISOString(),
});

const parsePhone = (body: Record<string, unknown>): string | null => {
  const value = body.phone;

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, "phone must be a string");
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const parseRecipientInput = (body: unknown): CreateRecipientInput => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const fullName = getRequiredString(body, "fullName");
  const email = normalizeEmail(getRequiredString(body, "email"));
  const phone = parsePhone(body);

  if (!isValidEmail(email)) {
    throw new HttpError(400, "email must be a valid email address");
  }

  return {
    fullName,
    email,
    phone,
  };
};

const assertValidRecipientId = (id: string): void => {
  if (!uuidPattern.test(id)) {
    throw new HttpError(404, "Recipient not found");
  }
};

const mapDatabaseError = (error: unknown): never => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    throw new HttpError(409, "Recipient email already exists for this organization");
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503"
  ) {
    throw new HttpError(409, "Recipient cannot be deleted because it is referenced by history");
  }

  throw error;
};

export const listRecipients = async (
  organizationId: string,
  rawSearch: unknown
): Promise<{ success: true; recipients: Recipient[] }> => {
  if (rawSearch !== undefined && typeof rawSearch !== "string") {
    throw new HttpError(400, "search must be a string");
  }

  const search = rawSearch?.trim() ? rawSearch.trim() : null;
  const recipients = await findRecipientsByOrganization(organizationId, search);

  return {
    success: true,
    recipients: recipients.map(toRecipient),
  };
};

export const getRecipient = async (
  organizationId: string,
  id: string
): Promise<{ success: true; recipient: Recipient }> => {
  assertValidRecipientId(id);

  const recipient = await findRecipientByIdAndOrganization(id, organizationId);

  if (!recipient) {
    throw new HttpError(404, "Recipient not found");
  }

  return {
    success: true,
    recipient: toRecipient(recipient),
  };
};

export const addRecipient = async (
  organizationId: string,
  body: unknown
): Promise<{ success: true; recipient: Recipient }> => {
  const input = parseRecipientInput(body);

  try {
    const recipient = await createRecipient(
      organizationId,
      input.fullName,
      input.email,
      input.phone
    );

    return {
      success: true,
      recipient: toRecipient(recipient),
    };
  } catch (error: unknown) {
    return mapDatabaseError(error);
  }
};

export const updateRecipient = async (
  organizationId: string,
  id: string,
  body: unknown
): Promise<{ success: true; recipient: Recipient }> => {
  assertValidRecipientId(id);

  const input: UpdateRecipientInput = parseRecipientInput(body);

  try {
    const recipient = await updateRecipientByIdAndOrganization(
      id,
      organizationId,
      input.fullName,
      input.email,
      input.phone
    );

    if (!recipient) {
      throw new HttpError(404, "Recipient not found");
    }

    return {
      success: true,
      recipient: toRecipient(recipient),
    };
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    return mapDatabaseError(error);
  }
};

export const removeRecipient = async (
  organizationId: string,
  id: string
): Promise<{ success: true; message: string }> => {
  assertValidRecipientId(id);

  try {
    const deleted = await deleteRecipientByIdAndOrganization(id, organizationId);

    if (!deleted) {
      throw new HttpError(404, "Recipient not found");
    }

    return {
      success: true,
      message: "Recipient deleted successfully",
    };
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    return mapDatabaseError(error);
  }
};
