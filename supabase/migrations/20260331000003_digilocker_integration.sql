-- Add DigiLocker verification fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_digilocker_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS digilocker_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS digilocker_request_id TEXT,
ADD COLUMN IF NOT EXISTS digilocker_xml_hash TEXT;

-- Add index for DigiLocker verified users
CREATE INDEX IF NOT EXISTS idx_profiles_digilocker_verified ON profiles(is_digilocker_verified) WHERE is_digilocker_verified = true;

-- Add kyc_method tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_method TEXT DEFAULT 'upload' CHECK (kyc_method IN ('upload', 'digilocker', 'manual_review'));

-- Update audit_logs to track DigiLocker verification
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS kyc_method TEXT,
ADD COLUMN IF NOT EXISTS provider_response JSONB;
