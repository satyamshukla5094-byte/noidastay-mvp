-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES legal_agreements(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  wifi_rating INTEGER CHECK (wifi_rating >= 1 AND wifi_rating <= 5),
  behavior_rating INTEGER CHECK (behavior_rating >= 1 AND behavior_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  owner_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT verified_resident_only CHECK (
    is_verified = true OR booking_id IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS
CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
USING (is_flagged = false);

CREATE POLICY "Verified residents can insert reviews"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM legal_agreements 
    WHERE id = booking_id 
    AND student_id = auth.uid()
    AND (status = 'active' OR status = 'completed' OR status = 'signed')
  )
);

CREATE POLICY "Owners can respond to reviews on their properties"
ON reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = reviews.property_id 
    AND properties.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = reviews.property_id 
    AND properties.owner_id = auth.uid()
  )
);

-- Admin Policy
CREATE POLICY "Admins have full access to reviews"
ON reviews FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
