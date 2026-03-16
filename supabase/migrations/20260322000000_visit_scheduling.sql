-- Create visit_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_status') THEN
        CREATE TYPE visit_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
    END IF;
END$$;

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status visit_status DEFAULT 'requested',
  confirmation_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Visits RLS
CREATE POLICY "Users can view their own visits"
ON visits FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Students can create visit requests"
ON visits FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Service role has full access to visits"
ON visits FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
