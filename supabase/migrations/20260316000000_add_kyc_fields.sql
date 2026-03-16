ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT,
  ADD COLUMN IF NOT EXISTS pan_card_url TEXT;

ALTER TABLE profiles
  ALTER COLUMN kyc_status TYPE TEXT USING kyc_status::TEXT;

-- Add check constraint for enum-like values.
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_kyc_status_check CHECK (kyc_status IN ('pending', 'verified', 'rejected'));
