-- Create flash_deals table
CREATE TABLE IF NOT EXISTS flash_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  discounted_price NUMERIC NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  deal_type TEXT DEFAULT 'First Month Off', -- e.g., 'Referral Bonus'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add logic to handle real-time session tracking
-- Note: Real-time presence is handled by Supabase Presence, but we can track page views in a table for history/persistence
CREATE TABLE IF NOT EXISTS property_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scarcity: Add remaining_rooms to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS remaining_rooms INTEGER DEFAULT 5;

-- Enable Realtime for urgency tables
ALTER PUBLICATION supabase_realtime ADD TABLE flash_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE property_views;

-- RLS Policies
ALTER TABLE flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flash deals are viewable by everyone" ON flash_deals FOR SELECT USING (true);
CREATE POLICY "Property views are insertable by authenticated users" ON property_views FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins have full access to flash deals" ON flash_deals FOR ALL USING (auth.role() = 'service_role');
