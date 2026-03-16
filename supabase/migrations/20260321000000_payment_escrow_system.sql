-- Create transaction_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'escrow_held', 'released', 'refunded');
    END IF;
END$$;

-- Create transaction_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('brokerage_fee', 'security_deposit');
    END IF;
END$$;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL, -- Link to a future bookings table or legal_agreements
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status transaction_status DEFAULT 'pending',
  type transaction_type NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add wallet_balance to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;

-- Enable RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to transactions"
ON transactions FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
