-- Create kyc_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END$$;

-- Add KYC fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS masked_id TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_scan_vault_path TEXT;

-- Create kyc-vault bucket in storage if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'kyc-vault', 'kyc-vault', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'kyc-vault'
);

-- RLS for kyc-vault
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'kyc-vault' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'kyc-vault' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service role has full access to kyc-vault"
ON storage.objects FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
