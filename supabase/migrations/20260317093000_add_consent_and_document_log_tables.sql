-- Consent logs for DPDP compliance
CREATE TABLE consent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  consent_type TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document access audit logs for admin audit requirements
CREATE TABLE document_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  document_path TEXT NOT NULL,
  action TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);
