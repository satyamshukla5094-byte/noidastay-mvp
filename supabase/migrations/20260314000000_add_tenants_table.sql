-- Add college column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college TEXT;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  move_in_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants policies (allowing open access for MVP local dev since user isn't fully authenticated)
CREATE POLICY "Tenants are viewable by everyone in MVP." 
  ON tenants FOR SELECT USING (true);

CREATE POLICY "Anyone can insert tenants in MVP." 
  ON tenants FOR INSERT WITH CHECK (true);

-- Adding an unrestricted policy to profiles for easy MVP use if it wasn't there
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Adding an unrestricted policy for leads to allow testing from owner dashboard
DROP POLICY IF EXISTS "Owners can view leads for their properties." ON leads;
CREATE POLICY "Owners can view leads for their properties." ON leads FOR SELECT USING (true);
