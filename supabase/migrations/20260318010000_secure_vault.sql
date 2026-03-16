-- Enable encryption extensions
CREATE EXTENSION IF NOT EXISTS pgsodium;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted identity fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_number_enc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_number_enc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_scan_vault_path TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_front_vault_path TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_back_vault_path TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_card_vault_path TEXT;

-- Legal agreements table for encrypted document records
CREATE TABLE IF NOT EXISTS legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  security_deposit_escrowed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault access audit logs
CREATE TABLE IF NOT EXISTS vault_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  action TEXT NOT NULL,
  agreement_id UUID REFERENCES legal_agreements(id) ON DELETE SET NULL,
  ip_address TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure storage RLS for vault bucket
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
    BEGIN
      EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping storage.objects RLS due insufficient privileges';
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
    BEGIN
      EXECUTE 'CREATE POLICY "Vault access policy" ON storage.objects FOR SELECT USING (bucket_id = ''vault-documents'' AND ((metadata->>''user_id'')::uuid = auth.uid() OR auth.role() = ''service_role''))';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Vault access policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping storage.objects policy due insufficient privileges';
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;
