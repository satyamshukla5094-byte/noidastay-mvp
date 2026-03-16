-- Add is_searching to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_searching BOOLEAN DEFAULT false;

-- Create roommate_profiles table
CREATE TABLE IF NOT EXISTS roommate_profiles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  habits JSONB NOT NULL DEFAULT '{
    "sleep_cycle": "early_bird", 
    "food_pref": "veg", 
    "study_habits": "quiet", 
    "smoking_pref": "non_smoker"
  }'::jsonb,
  major TEXT,
  college TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create match_requests table
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable RLS
ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- Roommate Profiles RLS
CREATE POLICY "KYC verified students can view roommate profiles"
ON roommate_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.kyc_status = 'verified'
  )
);

CREATE POLICY "Users can manage their own roommate profile"
ON roommate_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Match Requests RLS
CREATE POLICY "Users can view their own match requests"
ON match_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Students can send match requests"
ON match_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received match requests"
ON match_requests FOR UPDATE
USING (auth.uid() = receiver_id);
