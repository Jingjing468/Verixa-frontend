CREATE SEQUENCE IF NOT EXISTS certificate_public_id_seq AS BIGINT START WITH 1 INCREMENT BY 1;

ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES recipients(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_certificates_recipient_id ON certificates(recipient_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON certificates(issue_date);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);
