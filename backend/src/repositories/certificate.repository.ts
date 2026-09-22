import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { pool } from "../config/database.js";
import type { CertificateStatus } from "../types/certificate.js";
import type { CertificateHashData } from "../utils/certificate-hash.js";
import type { CertificateDesign } from "../services/certificate-artifact.service.js";

type DatabaseClient = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<T>>;
};

export type CertificateRecord = {
  id: string;
  certificate_id: string;
  recipient_id: string | null;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  issue_date: string;
  expiry_date: string | null;
  computed_status: CertificateStatus;
  created_at: Date;
  updated_at: Date;
};

export type CertificateDetailRecord = CertificateRecord & {
  design: CertificateDesign;
  organization_id: string;
  organization_name: string;
  organization_email: string;
  issuer_id: string;
  issuer_full_name: string;
  issuer_email: string;
  issuer_role: string;
  revocation_reason: string | null;
  revocation_note: string | null;
  revoked_at: Date | null;
  revoked_by_id: string | null;
  revoked_by_full_name: string | null;
};

export type RecipientSnapshotRecord = {
  id: string;
  full_name: string;
  email: string;
};

export type CertificateStatusRecord = {
  id: string;
  certificate_id: string;
  status: CertificateStatus;
};

export type RevocationRecord = {
  id: string;
  reason: string;
  note: string | null;
  revoked_at: Date;
  revoked_by_id: string;
  revoked_by_full_name: string;
};

export type CertificateHashRecord = {
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  expiry_date: string | null;
};

export type CertificatePdfRecord = {
  design: CertificateDesign;
  id: string;
  certificate_id: string;
  recipient_name: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  expiry_date: string | null;
  pdf_url: string | null;
};

export type CertificateEmailRecord = {
  design: CertificateDesign;
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  expiry_date: string | null;
  status: CertificateStatus;
  pdf_url: string | null;
};

export type CertificateListFilters = {
  status: CertificateStatus | null;
  search: string | null;
  limit: number;
  offset: number;
};

const certificateStatusSql = `
  CASE
    WHEN c.status = 'revoked' THEN 'revoked'
    WHEN c.expiry_date IS NOT NULL AND c.expiry_date < CURRENT_DATE THEN 'expired'
    ELSE 'valid'
  END
`;

const insertedCertificateStatusSql = `
  CASE
    WHEN status = 'revoked' THEN 'revoked'
    WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 'expired'
    ELSE 'valid'
  END
`;

const certificateSummaryColumnsSql = `
  c.id,
  c.certificate_id,
  c.recipient_id,
  c.recipient_name,
  c.recipient_email,
  c.course_name,
  c.issue_date::text AS issue_date,
  c.expiry_date::text AS expiry_date,
  ${certificateStatusSql} AS computed_status,
  c.created_at,
  c.updated_at
`;

const insertedCertificateSummaryColumnsSql = `
  id,
  certificate_id,
  recipient_id,
  recipient_name,
  recipient_email,
  course_name,
  issue_date::text AS issue_date,
  expiry_date::text AS expiry_date,
  ${insertedCertificateStatusSql} AS computed_status,
  created_at,
  updated_at
`;

export const findRecipientSnapshotByOrganization = async (
  client: DatabaseClient,
  recipientId: string,
  organizationId: string
): Promise<RecipientSnapshotRecord | null> => {
  const result = await client.query<RecipientSnapshotRecord>(
    `
      SELECT id, full_name, email
      FROM recipients
      WHERE id = $1 AND organization_id = $2
      LIMIT 1
    `,
    [recipientId, organizationId]
  );

  return result.rows[0] ?? null;
};

export const createCertificate = async (
  client: PoolClient,
  organizationId: string,
  issuedBy: string,
  recipient: RecipientSnapshotRecord,
  courseName: string,
  issueDate: string,
  expiryDate: string | null
): Promise<CertificateRecord> => {
  const result = await client.query<CertificateRecord>(
    `
      INSERT INTO certificates (
        certificate_id,
        organization_id,
        issued_by,
        recipient_id,
        recipient_name,
        recipient_email,
        course_name,
        issue_date,
        expiry_date,
        status
      )
      VALUES (
        CONCAT(
          'CERT-',
          EXTRACT(YEAR FROM $6::date)::int,
          '-',
          LPAD(nextval('certificate_public_id_seq')::text, 7, '0')
        ),
        $1,
        $2,
        $3,
        $4,
        $5,
        $7,
        $6,
        $8,
        'valid'
      )
      RETURNING ${insertedCertificateSummaryColumnsSql}
    `,
    [
      organizationId,
      issuedBy,
      recipient.id,
      recipient.full_name,
      recipient.email,
      issueDate,
      courseName,
      expiryDate,
    ]
  );

  const certificate = result.rows[0];

  if (!certificate) {
    throw new Error("Certificate creation failed");
  }

  return certificate;
};

export const countCertificatesByOrganization = async (
  organizationId: string,
  filters: Pick<CertificateListFilters, "status" | "search">
): Promise<number> => {
  const values: unknown[] = [organizationId];
  const clauses = ["c.organization_id = $1"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    clauses.push(
      `(c.certificate_id ILIKE $${values.length} OR c.recipient_name ILIKE $${values.length} OR c.recipient_email ILIKE $${values.length} OR c.course_name ILIKE $${values.length})`
    );
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`${certificateStatusSql} = $${values.length}`);
  }

  const result = await pool.query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM certificates c
      WHERE ${clauses.join(" AND ")}
    `,
    values
  );

  return Number(result.rows[0]?.total ?? 0);
};

export const findCertificatesByOrganization = async (
  organizationId: string,
  filters: CertificateListFilters
): Promise<CertificateRecord[]> => {
  const values: unknown[] = [organizationId];
  const clauses = ["c.organization_id = $1"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    clauses.push(
      `(c.certificate_id ILIKE $${values.length} OR c.recipient_name ILIKE $${values.length} OR c.recipient_email ILIKE $${values.length} OR c.course_name ILIKE $${values.length})`
    );
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`${certificateStatusSql} = $${values.length}`);
  }

  values.push(filters.limit);
  const limitParam = values.length;
  values.push(filters.offset);
  const offsetParam = values.length;

  const result = await pool.query<CertificateRecord>(
    `
      SELECT ${certificateSummaryColumnsSql}
      FROM certificates c
      WHERE ${clauses.join(" AND ")}
      ORDER BY c.created_at DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `,
    values
  );

  return result.rows;
};

export const findCertificateDetailByIdAndOrganization = async (
  id: string,
  organizationId: string
): Promise<CertificateDetailRecord | null> => {
  const result = await pool.query<CertificateDetailRecord>(
    `
      SELECT
        ${certificateSummaryColumnsSql},
        c.design,
        o.id AS organization_id,
        o.name AS organization_name,
        o.email AS organization_email,
        u.id AS issuer_id,
        u.full_name AS issuer_full_name,
        u.email AS issuer_email,
        u.role AS issuer_role,
        rev.reason AS revocation_reason,
        rev.note AS revocation_note,
        rev.revoked_at,
        rev.revoked_by_id,
        rev.revoked_by_full_name
      FROM certificates c
      INNER JOIN organizations o ON o.id = c.organization_id
      INNER JOIN users u ON u.id = c.issued_by
      LEFT JOIN LATERAL (
        SELECT
          rl.reason,
          rl.note,
          rl.revoked_at,
          rb.id AS revoked_by_id,
          rb.full_name AS revoked_by_full_name
        FROM revocation_logs rl
        INNER JOIN users rb ON rb.id = rl.revoked_by
        WHERE rl.certificate_id = c.id
        ORDER BY rl.revoked_at DESC
        LIMIT 1
      ) rev ON TRUE
      WHERE c.id = $1 AND c.organization_id = $2
      LIMIT 1
    `,
    [id, organizationId]
  );

  return result.rows[0] ?? null;
};

export const findCertificateStatusForUpdate = async (
  client: PoolClient,
  id: string,
  organizationId: string
): Promise<CertificateStatusRecord | null> => {
  const result = await client.query<CertificateStatusRecord>(
    `
      SELECT id, certificate_id, status
      FROM certificates
      WHERE id = $1 AND organization_id = $2
      FOR UPDATE
    `,
    [id, organizationId]
  );

  return result.rows[0] ?? null;
};

export const updateCertificateByIdAndOrganization = async (
  client: PoolClient,
  id: string,
  organizationId: string,
  recipient: RecipientSnapshotRecord,
  courseName: string,
  issueDate: string,
  expiryDate: string | null
): Promise<CertificateRecord | null> => {
  const result = await client.query<CertificateRecord>(
    `
      UPDATE certificates c
      SET
        recipient_id = $3,
        recipient_name = $4,
        recipient_email = $5,
        course_name = $6,
        issue_date = $7,
        expiry_date = $8,
        updated_at = NOW()
      WHERE c.id = $1 AND c.organization_id = $2
      RETURNING ${certificateSummaryColumnsSql}
    `,
    [
      id,
      organizationId,
      recipient.id,
      recipient.full_name,
      recipient.email,
      courseName,
      issueDate,
      expiryDate,
    ]
  );

  return result.rows[0] ?? null;
};

export const findCertificateHashDataById = async (
  client: DatabaseClient,
  id: string
): Promise<CertificateHashData | null> => {
  const result = await client.query<CertificateHashRecord>(
    `
      SELECT
        c.certificate_id,
        c.recipient_name,
        c.recipient_email,
        c.course_name,
        o.name AS organization_name,
        c.issue_date::text AS issue_date,
        c.expiry_date::text AS expiry_date
      FROM certificates c
      INNER JOIN organizations o ON o.id = c.organization_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [id]
  );

  const record = result.rows[0];

  if (!record) {
    return null;
  }

  return {
    certificateId: record.certificate_id,
    recipientName: record.recipient_name,
    recipientEmail: record.recipient_email,
    courseName: record.course_name,
    organizationName: record.organization_name,
    issueDate: record.issue_date,
    expiryDate: record.expiry_date,
  };
};

export const updateCertificateHash = async (
  client: PoolClient,
  id: string,
  certificateHash: string
): Promise<void> => {
  await client.query(
    `
      UPDATE certificates
      SET certificate_hash = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [id, certificateHash]
  );
};

export const findCertificatePdfDataByIdAndOrganization = async (
  id: string,
  organizationId: string
): Promise<CertificatePdfRecord | null> => {
  const result = await pool.query<CertificatePdfRecord>(
    `
      SELECT
        c.id,
        c.certificate_id,
        c.recipient_name,
        c.course_name,
        o.name AS organization_name,
        c.issue_date::text AS issue_date,
        c.expiry_date::text AS expiry_date,
        c.pdf_url,
        c.design
      FROM certificates c
      INNER JOIN organizations o ON o.id = c.organization_id
      WHERE c.id = $1 AND c.organization_id = $2
      LIMIT 1
    `,
    [id, organizationId]
  );

  return result.rows[0] ?? null;
};

export const updateCertificatePdfUrl = async (
  id: string,
  organizationId: string,
  pdfUrl: string
): Promise<void> => {
  await pool.query(
    `
      UPDATE certificates
      SET pdf_url = $3, updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
    `,
    [id, organizationId, pdfUrl]
  );
};

export const findCertificateEmailDataByIdAndOrganization = async (
  id: string,
  organizationId: string
): Promise<CertificateEmailRecord | null> => {
  const result = await pool.query<CertificateEmailRecord>(
    `
      SELECT
        c.id,
        c.certificate_id,
        c.recipient_name,
        c.recipient_email,
        c.course_name,
        o.name AS organization_name,
        c.issue_date::text AS issue_date,
        c.expiry_date::text AS expiry_date,
        ${certificateStatusSql} AS status,
        c.pdf_url,
        c.design
      FROM certificates c
      INNER JOIN organizations o ON o.id = c.organization_id
      WHERE c.id = $1 AND c.organization_id = $2
      LIMIT 1
    `,
    [id, organizationId]
  );

  return result.rows[0] ?? null;
};

export const createRevocationLog = async (
  client: PoolClient,
  certificateId: string,
  revokedBy: string,
  reason: string,
  note: string | null
): Promise<RevocationRecord> => {
  const result = await client.query<RevocationRecord>(
    `
      WITH inserted AS (
        INSERT INTO revocation_logs (certificate_id, revoked_by, reason, note)
        VALUES ($1, $2, $3, $4)
        RETURNING id, reason, note, revoked_at, revoked_by
      )
      SELECT
        inserted.id,
        inserted.reason,
        inserted.note,
        inserted.revoked_at,
        u.id AS revoked_by_id,
        u.full_name AS revoked_by_full_name
      FROM inserted
      INNER JOIN users u ON u.id = inserted.revoked_by
    `,
    [certificateId, revokedBy, reason, note]
  );

  const revocation = result.rows[0];

  if (!revocation) {
    throw new Error("Revocation log creation failed");
  }

  return revocation;
};

export const markCertificateRevoked = async (
  client: PoolClient,
  id: string,
  organizationId: string
): Promise<CertificateRecord> => {
  const result = await client.query<CertificateRecord>(
    `
      UPDATE certificates
      SET status = 'revoked', updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
      RETURNING ${insertedCertificateSummaryColumnsSql}
    `,
    [id, organizationId]
  );

  const certificate = result.rows[0];

  if (!certificate) {
    throw new Error("Certificate revocation failed");
  }

  return certificate;
};

export const findRevocationsByCertificateAndOrganization = async (
  certificateId: string,
  organizationId: string
): Promise<RevocationRecord[] | null> => {
  const certificateResult = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM certificates
      WHERE id = $1 AND organization_id = $2
      LIMIT 1
    `,
    [certificateId, organizationId]
  );

  if (!certificateResult.rows[0]) {
    return null;
  }

  const result = await pool.query<RevocationRecord>(
    `
      SELECT
        rl.id,
        rl.reason,
        rl.note,
        rl.revoked_at,
        u.id AS revoked_by_id,
        u.full_name AS revoked_by_full_name
      FROM revocation_logs rl
      INNER JOIN users u ON u.id = rl.revoked_by
      WHERE rl.certificate_id = $1
      ORDER BY rl.revoked_at DESC
    `,
    [certificateId]
  );

  return result.rows;
};
