-- Add KYC fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS masked_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permanent_address TEXT;

-- Ensure kyc_status values are consistent
UPDATE profiles SET kyc_status = 'pending' WHERE kyc_status IS NULL;
