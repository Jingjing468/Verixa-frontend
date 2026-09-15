CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('organization_admin', 'issuer', 'viewer'))
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  issued_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'valid',
  certificate_hash TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT certificates_status_check CHECK (status IN ('valid', 'expired', 'revoked')),
  CONSTRAINT certificates_expiry_after_issue_check CHECK (
    expiry_date IS NULL OR expiry_date >= issue_date
  )
);

CREATE TABLE IF NOT EXISTS blockchain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE RESTRICT,
  network TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  contract_address TEXT,
  certificate_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revocation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE RESTRICT,
  revoked_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  note TEXT,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE RESTRICT,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_logs_email_type_check CHECK (
    email_type IN ('certificate_issued', 'certificate_resent', 'revocation_notice')
  ),
  CONSTRAINT email_logs_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_certificates_organization_id ON certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_by ON certificates(issued_by);
CREATE INDEX IF NOT EXISTS idx_certificates_recipient_email ON certificates(recipient_email);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_certificate_id ON blockchain_records(certificate_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_transaction_hash ON blockchain_records(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_revocation_logs_certificate_id ON revocation_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_revocation_logs_revoked_by ON revocation_logs(revoked_by);
CREATE INDEX IF NOT EXISTS idx_email_logs_certificate_id ON email_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_organizations_updated_at ON organizations;
CREATE TRIGGER set_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_certificates_updated_at ON certificates;
CREATE TRIGGER set_certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
