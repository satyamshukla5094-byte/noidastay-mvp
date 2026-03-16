-- Add manual_review_required status to kyc_status enum
ALTER TYPE kyc_status ADD VALUE 'manual_review_required';

-- Add index for fraud protection
CREATE INDEX IF NOT EXISTS idx_profiles_masked_id ON profiles(masked_id) WHERE masked_id IS NOT NULL;

-- Add confidence_score tracking to profiles (optional)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_kyc_confidence numeric(3,2),
ADD COLUMN IF NOT EXISTS kyc_attempts integer DEFAULT 0;

-- Trigger to increment KYC attempts
CREATE OR REPLACE FUNCTION increment_kyc_attempts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET kyc_attempts = kyc_attempts + 1,
      last_kyc_confidence = NEW.confidence_score
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for KYC attempts tracking
DROP TRIGGER IF EXISTS on_kyc_verification ON audit_logs;
CREATE TRIGGER on_kyc_verification
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  WHEN (NEW.action_type = 'KYC_VERIFICATION')
  EXECUTE FUNCTION increment_kyc_attempts();
