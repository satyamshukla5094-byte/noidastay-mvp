DO $do$
BEGIN
  -- Create properties table if missing
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='properties' AND relkind='r') THEN
    CREATE TABLE properties (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      lat NUMERIC NOT NULL,
      lng NUMERIC NOT NULL,
      sector TEXT NOT NULL,
      amenities JSONB DEFAULT '[]'::jsonb,
      is_verified BOOLEAN DEFAULT false,
      images TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  -- Enable RLS (safe to run even if already enabled)
  BEGIN
    EXECUTE 'ALTER TABLE properties ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN undefined_table THEN
    -- table may not exist yet; ignore
    NULL;
  END;

  -- Create policies if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polname = 'Properties are viewable by everyone.') THEN
    EXECUTE $$CREATE POLICY "Properties are viewable by everyone." ON properties FOR SELECT USING (true);$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polname = 'Owners can insert their own properties.') THEN
    EXECUTE $$CREATE POLICY "Owners can insert their own properties." ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polname = 'Owners can update their own properties.') THEN
    EXECUTE $$CREATE POLICY "Owners can update their own properties." ON properties FOR UPDATE USING (auth.uid() = owner_id);$$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polname = 'Owners can delete their own properties.') THEN
    EXECUTE $$CREATE POLICY "Owners can delete their own properties." ON properties FOR DELETE USING (auth.uid() = owner_id);$$;
  END IF;
END;
$do$;