import { pool } from "../config/database.js";
import type { CertificateStatus } from "../types/certificate.js";

export type PublicCertificateVerificationRecord = {
  database_id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  organization_name: string;
  issue_date: string;
  expiry_date: string | null;
  certificate_hash: string | null;
  computed_status: CertificateStatus;
  revocation_reason: string | null;
  revoked_at: Date | null;
  blockchain_network: string | null;
  blockchain_transaction_hash: string | null;
  blockchain_contract_address: string | null;
};

export const findPublicCertificateByCertificateId = async (
  certificateId: string
): Promise<PublicCertificateVerificationRecord | null> => {
  const result = await pool.query<PublicCertificateVerificationRecord>(
    `
      SELECT
        c.id AS database_id,
        c.certificate_id,
        c.recipient_name,
        c.recipient_email,
        c.course_name,
        o.name AS organization_name,
        c.issue_date::text AS issue_date,
        c.expiry_date::text AS expiry_date,
        c.certificate_hash,
        CASE
          WHEN c.status = 'revoked' THEN 'revoked'
          WHEN c.expiry_date IS NOT NULL AND c.expiry_date < CURRENT_DATE THEN 'expired'
          ELSE 'valid'
        END AS computed_status,
        rev.reason AS revocation_reason,
        rev.revoked_at,
        br.network AS blockchain_network,
        br.transaction_hash AS blockchain_transaction_hash,
        br.contract_address AS blockchain_contract_address
      FROM certificates c
      INNER JOIN organizations o ON o.id = c.organization_id
      LEFT JOIN blockchain_records br ON br.certificate_id = c.id
      LEFT JOIN LATERAL (
        SELECT rl.reason, rl.revoked_at
        FROM revocation_logs rl
        WHERE rl.certificate_id = c.id
        ORDER BY rl.revoked_at DESC
        LIMIT 1
      ) rev ON TRUE
      WHERE c.certificate_id = $1
      LIMIT 1
    `,
    [certificateId]
  );

  return result.rows[0] ?? null;
};
