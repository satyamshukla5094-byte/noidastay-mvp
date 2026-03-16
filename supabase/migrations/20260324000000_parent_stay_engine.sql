-- Create guest_room_availability table
CREATE TABLE IF NOT EXISTS guest_room_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  available_date DATE NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  price_per_night NUMERIC NOT NULL,
  max_occupancy INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, available_date)
);

-- Add booking_type to transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_type') THEN
        CREATE TYPE booking_type AS ENUM ('long_term', 'short_term_parent');
    END IF;
END$$;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS booking_type booking_type DEFAULT 'long_term';

-- Add booking_type to visits
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS booking_type booking_type DEFAULT 'long_term';

-- Update properties to include short-stay flag
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS has_parent_room BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE guest_room_availability ENABLE ROW LEVEL SECURITY;

-- Guest Room RLS
CREATE POLICY "Public guest availability view"
ON guest_room_availability FOR SELECT
USING (true);

CREATE POLICY "Service role full access guest availability"
ON guest_room_availability FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
