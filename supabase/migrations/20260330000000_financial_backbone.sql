-- Create revenue_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revenue_type') THEN
        CREATE TYPE revenue_type AS ENUM ('commission', 'service_fee', 'penalty');
    END IF;
END$$;

-- Create payout_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
        CREATE TYPE payout_status AS ENUM ('pending', 'processed');
    END IF;
END$$;

-- Create revenue_ledger table
CREATE TABLE IF NOT EXISTS revenue_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  type revenue_type NOT NULL,
  amount_gross NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  amount_net NUMERIC NOT NULL,
  payout_status payout_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bank_details and referral_debt to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS referral_debt NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE revenue_ledger ENABLE ROW LEVEL SECURITY;

-- Revenue Ledger RLS (Admin Only)
CREATE POLICY "Admins have full access to revenue ledger"
ON revenue_ledger FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
