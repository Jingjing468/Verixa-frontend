import { pool } from "../config/database.js";

export type EmailType = "certificate_issued" | "certificate_resent" | "revocation_notice";
export type EmailStatus = "sent" | "failed";

export type EmailLogRecord = {
  id: string;
  certificate_id: string;
  recipient_email: string;
  email_type: EmailType;
  status: EmailStatus;
  error_message: string | null;
  sent_at: Date | null;
  created_at: Date;
};

export const createEmailLog = async (input: {
  certificateId: string;
  recipientEmail: string;
  emailType: EmailType;
  status: EmailStatus;
  errorMessage: string | null;
  sentAt: Date | null;
}): Promise<EmailLogRecord> => {
  const result = await pool.query<EmailLogRecord>(
    `
      INSERT INTO email_logs (
        certificate_id,
        recipient_email,
        email_type,
        status,
        error_message,
        sent_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        certificate_id,
        recipient_email,
        email_type,
        status,
        error_message,
        sent_at,
        created_at
    `,
    [
      input.certificateId,
      input.recipientEmail,
      input.emailType,
      input.status,
      input.errorMessage,
      input.sentAt,
    ]
  );

  const log = result.rows[0];

  if (!log) {
    throw new Error("Email log creation failed");
  }

  return log;
};

export const findEmailLogsByCertificateAndOrganization = async (
  certificateId: string,
  organizationId: string
): Promise<EmailLogRecord[] | null> => {
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

  const result = await pool.query<EmailLogRecord>(
    `
      SELECT
        id,
        certificate_id,
        recipient_email,
        email_type,
        status,
        error_message,
        sent_at,
        created_at
      FROM email_logs
      WHERE certificate_id = $1
      ORDER BY created_at DESC
    `,
    [certificateId]
  );

  return result.rows;
};
