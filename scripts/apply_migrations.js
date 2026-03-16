const fs = require('fs');
const { Client } = require('pg');

const defaultConnectionString = "postgresql://postgres.oyowvchibtsedukrmrvl:3kQG4R2rXg45mXn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const connectionString = process.env.CONNECTION_STRING || defaultConnectionString;

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/migrations/20260312224251_init_schema.sql', 'utf8');
    console.log('Applying initial schema migration...');
    await client.query(sql);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
