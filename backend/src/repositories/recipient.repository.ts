import { pool } from "../config/database.js";

export type RecipientRecord = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
};

export const findRecipientsByOrganization = async (
  organizationId: string,
  search: string | null
): Promise<RecipientRecord[]> => {
  const values: unknown[] = [organizationId];
  const searchClause = search
    ? "AND (full_name ILIKE $2 OR email ILIKE $2)"
    : "";

  if (search) {
    values.push(`%${search}%`);
  }

  const result = await pool.query<RecipientRecord>(
    `
      SELECT id, organization_id, full_name, email, phone, created_at, updated_at
      FROM recipients
      WHERE organization_id = $1
      ${searchClause}
      ORDER BY created_at DESC
    `,
    values
  );

  return result.rows;
};

export const findRecipientByIdAndOrganization = async (
  id: string,
  organizationId: string
): Promise<RecipientRecord | null> => {
  const result = await pool.query<RecipientRecord>(
    `
      SELECT id, organization_id, full_name, email, phone, created_at, updated_at
      FROM recipients
      WHERE id = $1 AND organization_id = $2
      LIMIT 1
    `,
    [id, organizationId]
  );

  return result.rows[0] ?? null;
};

export const createRecipient = async (
  organizationId: string,
  fullName: string,
  email: string,
  phone: string | null
): Promise<RecipientRecord> => {
  const result = await pool.query<RecipientRecord>(
    `
      INSERT INTO recipients (organization_id, full_name, email, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, organization_id, full_name, email, phone, created_at, updated_at
    `,
    [organizationId, fullName, email, phone]
  );

  const recipient = result.rows[0];

  if (!recipient) {
    throw new Error("Recipient creation failed");
  }

  return recipient;
};

export const updateRecipientByIdAndOrganization = async (
  id: string,
  organizationId: string,
  fullName: string,
  email: string,
  phone: string | null
): Promise<RecipientRecord | null> => {
  const result = await pool.query<RecipientRecord>(
    `
      UPDATE recipients
      SET full_name = $3, email = $4, phone = $5
      WHERE id = $1 AND organization_id = $2
      RETURNING id, organization_id, full_name, email, phone, created_at, updated_at
    `,
    [id, organizationId, fullName, email, phone]
  );

  return result.rows[0] ?? null;
};

export const deleteRecipientByIdAndOrganization = async (
  id: string,
  organizationId: string
): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM recipients
      WHERE id = $1 AND organization_id = $2
    `,
    [id, organizationId]
  );

  return result.rowCount === 1;
};
