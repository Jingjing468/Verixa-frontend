ALTER TABLE blockchain_records
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';

ALTER TABLE blockchain_records
DROP CONSTRAINT IF EXISTS blockchain_records_status_check;

ALTER TABLE blockchain_records
ADD CONSTRAINT blockchain_records_status_check
CHECK (status IN ('confirmed', 'failed'));
