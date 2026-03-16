-- The favorites table was created with property_id as UUID referencing properties(id).
-- Since the frontend uses mock string IDs ("1","2","3","4"), we need to allow text-based property_id.
-- Drop and recreate favorites with TEXT property_id for mock data compatibility.

DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own favorites."
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites."
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites."
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Also fix reviews to use TEXT property_id for mock data compatibility
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone."
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews."
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews."
  ON reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews."
  ON reviews FOR DELETE USING (auth.uid() = user_id);
