-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Favorites RLS
CREATE POLICY "Users can insert their own favorites." 
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites." 
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites." 
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Reviews RLS
CREATE POLICY "Reviews are viewable by everyone." 
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews." 
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews." 
  ON reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews." 
  ON reviews FOR DELETE USING (auth.uid() = user_id);
