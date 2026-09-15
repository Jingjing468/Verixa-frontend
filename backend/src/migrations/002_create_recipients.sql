CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recipients_email_per_organization_unique UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_recipients_organization_id ON recipients(organization_id);
CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);
CREATE INDEX IF NOT EXISTS idx_recipients_full_name ON recipients(full_name);
CREATE INDEX IF NOT EXISTS idx_recipients_created_at ON recipients(created_at);

DROP TRIGGER IF EXISTS set_recipients_updated_at ON recipients;
CREATE TRIGGER set_recipients_updated_at
BEFORE UPDATE ON recipients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
