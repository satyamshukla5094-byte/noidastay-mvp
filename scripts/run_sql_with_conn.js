const fs = require('fs');
const { Client } = require('pg');

const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
  console.error('Set CONNECTION_STRING env var first');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/create_properties_if_missing.sql', 'utf8');
    console.log('Running create_properties_if_missing.sql...');
    await client.query(sql);
    console.log('SQL executed');
  } catch (err) {
    console.error('Error executing SQL:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
