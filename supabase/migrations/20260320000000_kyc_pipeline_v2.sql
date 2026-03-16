-- Create kyc_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');
    END IF;
END$$;

-- Add KYC fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'none',
ADD COLUMN IF NOT EXISTS masked_id TEXT,
ADD COLUMN IF NOT EXISTS legal_full_name TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT;

-- Create kyc-documents bucket in storage if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'kyc-documents', 'kyc-documents', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'kyc-documents'
);

-- RLS for kyc-documents
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'kyc-documents' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service role has full access to kyc-documents"
ON storage.objects FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
