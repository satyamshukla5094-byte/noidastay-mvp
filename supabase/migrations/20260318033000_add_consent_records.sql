-- Consent records table for DPDP compliance
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Granted', 'Withdrawn')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_timestamp ON consent_records(user_id, timestamp DESC);
