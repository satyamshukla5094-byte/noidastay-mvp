const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const defaultConnectionString = process.env.CONNECTION_STRING || process.env.SUPABASE_DATABASE_URL || "postgresql://postgres.oyowvchibtsedukrmrvl:3kQG4R2rXg45mXn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const connectionString = process.env.CONNECTION_STRING || defaultConnectionString;
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Applying migration ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
        console.log(`✔ ${file}`);
      } catch (err) {
        console.error(`✖ Migration ${file} failed:`, err.message || err);
      }
    }
    console.log('All migrations attempted.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
