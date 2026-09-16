import { pool } from "../config/database.js";

export type RecipientRecord = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  total_certificates: number;
  valid_certificates: number;
  expired_certificates: number;
  revoked_certificates: number;
  last_issued_at: string | null;
  created_at: Date;
  updated_at: Date;
};

const certificateStatusSql = `
  CASE
    WHEN c.status = 'revoked' THEN 'revoked'
    WHEN c.expiry_date IS NOT NULL AND c.expiry_date < CURRENT_DATE THEN 'expired'
    ELSE 'valid'
  END
`;

const recipientColumnsSql = `
  r.id,
  r.organization_id,
  r.full_name,
  r.email,
  r.phone,
  COUNT(c.id)::int AS total_certificates,
  COUNT(c.id) FILTER (WHERE ${certificateStatusSql} = 'valid')::int AS valid_certificates,
  COUNT(c.id) FILTER (WHERE ${certificateStatusSql} = 'expired')::int AS expired_certificates,
  COUNT(c.id) FILTER (WHERE ${certificateStatusSql} = 'revoked')::int AS revoked_certificates,
  MAX(c.issue_date)::text AS last_issued_at,
  r.created_at,
  r.updated_at
`;

export const findRecipientsByOrganization = async (
  organizationId: string,
  search: string | null
): Promise<RecipientRecord[]> => {
  const values: unknown[] = [organizationId];
  const searchClause = search
    ? "AND (r.full_name ILIKE $2 OR r.email ILIKE $2)"
    : "";

  if (search) {
    values.push(`%${search}%`);
  }

  const result = await pool.query<RecipientRecord>(
    `
      SELECT ${recipientColumnsSql}
      FROM recipients r
      LEFT JOIN certificates c ON c.recipient_id = r.id
      WHERE r.organization_id = $1
      ${searchClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
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
      SELECT ${recipientColumnsSql}
      FROM recipients r
      LEFT JOIN certificates c ON c.recipient_id = r.id
      WHERE r.id = $1 AND r.organization_id = $2
      GROUP BY r.id
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
      RETURNING
        id,
        organization_id,
        full_name,
        email,
        phone,
        0::int AS total_certificates,
        0::int AS valid_certificates,
        0::int AS expired_certificates,
        0::int AS revoked_certificates,
        NULL::text AS last_issued_at,
        created_at,
        updated_at
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
      WITH updated AS (
        UPDATE recipients
        SET full_name = $3, email = $4, phone = $5, updated_at = NOW()
        WHERE id = $1 AND organization_id = $2
        RETURNING id
      )
      SELECT ${recipientColumnsSql}
      FROM recipients r
      INNER JOIN updated ON updated.id = r.id
      LEFT JOIN certificates c ON c.recipient_id = r.id
      GROUP BY r.id
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
