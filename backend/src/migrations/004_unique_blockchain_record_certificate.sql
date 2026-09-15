CREATE UNIQUE INDEX IF NOT EXISTS idx_blockchain_records_certificate_id_unique
ON blockchain_records(certificate_id);
