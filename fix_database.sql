-- Fix Common Issues in NoidaStay Database
-- Run after main setup if issues occur

-- 1. Fix missing storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('vault-documents', 'vault-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('kyc-vault', 'kyc-vault', false, 10485760, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 2. Fix missing enum values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;

-- 3. Fix RLS policies that might be missing
CREATE POLICY "Users can view own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Fix missing columns (add if not exist)
DO $$
BEGIN
  -- Add missing columns to profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
END $$;

-- 5. Create sample data for testing
INSERT INTO properties (id, title, price, sector, images, is_verified, lat, lng, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Cozy PG in Knowledge Park 2', 8000, 'Knowledge Park 2', 
   ARRAY['https://images.unsplash.com/photo-1522708329826-6bc8eb832c6b?w=800'], 
   true, 28.4668, 77.4977, NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Modern PG near NIET', 7500, 'Knowledge Park 1', 
   ARRAY['https://images.unsplash.com/photo-1560448374-e0f2f5808b4e?w=800'], 
   true, 28.4639, 77.4908, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Budget Friendly PG', 6000, 'Alpha 1', 
   ARRAY['https://images.unsplash.com/photo-1556025728-7e4b5dd55d0c?w=800'], 
   false, 28.4671, 77.5138, NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Fix audit_logs table if missing
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Success Message
SELECT 'Database fixes applied successfully!' as status;
