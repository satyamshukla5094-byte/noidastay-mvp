const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.oyowvchibtsedukrmrvl:3kQG4R2rXg45mXn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function main() {
  try {
    await client.connect();
    
    const sql = fs.readFileSync('supabase/migrations/20260315035000_add_favorites_reviews.sql', 'utf8');
    await client.query(sql);
    console.log("Migration applied successfully");
    
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

main();
