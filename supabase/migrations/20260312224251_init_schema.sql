-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'owner');

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  sector TEXT NOT NULL, -- e.g., 'Knowledge Park', 'Alpha', 'Beta', 'Gamma'
  amenities JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties RLS
CREATE POLICY "Properties are viewable by everyone." 
  ON properties FOR SELECT USING (true);

CREATE POLICY "Owners can insert their own properties." 
  ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties." 
  ON properties FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties." 
  ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Leads RLS
CREATE POLICY "Students can create leads." 
  ON leads FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners can view leads for their properties." 
  ON leads FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = leads.property_id 
      AND properties.owner_id = auth.uid()
    )
  );
