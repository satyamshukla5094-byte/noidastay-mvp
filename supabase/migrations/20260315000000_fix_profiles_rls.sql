DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
