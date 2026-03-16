-- Create owner_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'owner_type') THEN
        CREATE TYPE owner_type AS ENUM ('Individual', 'Agency');
    END IF;
END$$;

-- Create property_verification_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_verification_status') THEN
        CREATE TYPE property_verification_status AS ENUM ('pending', 'site_visited', 'verified', 'rejected');
    END IF;
END$$;

-- Update profiles table for owners
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_type owner_type DEFAULT 'Individual',
ADD COLUMN IF NOT EXISTS property_tax_id TEXT,
ADD COLUMN IF NOT EXISTS verification_documents_url TEXT;

-- Create property_verifications table
CREATE TABLE IF NOT EXISTS property_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  status property_verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id), -- Satyam/Admin
  verification_notes TEXT,
  site_visit_requested_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE property_verifications ENABLE ROW LEVEL SECURITY;

-- Property Verifications RLS
CREATE POLICY "Owners can view their own property verifications"
ON property_verifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_verifications.property_id 
    AND properties.owner_id = auth.uid()
  )
);

CREATE POLICY "Service role has full access to property_verifications"
ON property_verifications FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Update properties table to support visibility control
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS visibility_status TEXT DEFAULT 'hidden', -- 'hidden', 'public'
ADD COLUMN IF NOT EXISTS parent_guest_room_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_guest_room_price NUMERIC,
ADD COLUMN IF NOT EXISTS inventory_config JSONB DEFAULT '{}'::jsonb; -- { single: price, double: price, etc }
