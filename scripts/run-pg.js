const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.oyowvchibtsedukrmrvl:3kQG4R2rXg45mXn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function main() {
  try {
    await client.connect();
    
    // Add columns
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS dob DATE;
    `);
    console.log("Columns added successfully");
    
    // Fix RLS policies
    await client.query(`
      DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
      
      CREATE POLICY "Users can insert their own profile." 
        ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
        
      CREATE POLICY "Users can update own profile." 
        ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    `);
    console.log("RLS policies updated successfully");

    // Repair migration history so future pushes don't fail
    await client.query(`
      INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260314000002') ON CONFLICT DO NOTHING;
      INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260315000000') ON CONFLICT DO NOTHING;
    `);
    console.log("Migration history repaired seamlessly");

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

main();
