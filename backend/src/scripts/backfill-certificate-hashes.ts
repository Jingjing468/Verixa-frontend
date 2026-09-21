import { pool } from "../config/database.js";
import {
  generateCertificateHash,
  type CertificateHashData,
} from "../utils/certificate-hash.js";

type CertificateHashBackfillRecord = {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  expiry_date: string | null;
};

const toHashData = (
  record: CertificateHashBackfillRecord
): CertificateHashData => ({
  certificateId: record.certificate_id,
  recipientName: record.recipient_name,
  recipientEmail: record.recipient_email,
  courseName: record.course_name,
  organizationName: record.organization_name,
  issueDate: record.issue_date,
  expiryDate: record.expiry_date,
});

const backfillCertificateHashes = async (): Promise<void> => {
  try {
    const result = await pool.query<CertificateHashBackfillRecord>(
      `
        SELECT
          c.id,
          c.certificate_id,
          c.recipient_name,
          c.recipient_email,
          c.course_name,
          o.name AS organization_name,
          c.issue_date::text AS issue_date,
          c.expiry_date::text AS expiry_date
        FROM certificates c
        INNER JOIN organizations o ON o.id = c.organization_id
        WHERE c.certificate_hash IS NULL
        ORDER BY c.created_at ASC
      `
    );

    for (const certificate of result.rows) {
      await pool.query(
        `
          UPDATE certificates
          SET certificate_hash = $2
          WHERE id = $1
        `,
        [certificate.id, generateCertificateHash(toHashData(certificate))]
      );
    }

    console.log(`Backfilled ${result.rowCount} certificate hashes`);
  } catch (error: unknown) {
    console.error(
      "Certificate hash backfill failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void backfillCertificateHashes();
