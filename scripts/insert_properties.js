const fs = require('fs');
const { Client } = require('pg');

const connectionString = "postgresql://postgres.oyowvchibtsedukrmrvl:3kQG4R2rXg45mXn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/insert_properties.sql', 'utf8');
    console.log('Executing insert_properties.sql...');
    await client.query(sql);
    console.log('Insert finished successfully');
  } catch (err) {
    console.error('Error executing SQL:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
