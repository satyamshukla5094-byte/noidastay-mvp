const { Client } = require('pg');

async function main() {
  const connectionString = process.env.CONNECTION_STRING || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_CONN || "";
  if (!connectionString) {
    console.error('Set CONNECTION_STRING or SUPABASE_DATABASE_URL environment variable');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const checks = [
    { name: 'consent_records table', sql: "SELECT to_regclass('public.consent_records')" },
    { name: 'audit_logs table', sql: "SELECT to_regclass('public.audit_logs')" },
    { name: 'vault_access_logs table', sql: "SELECT to_regclass('public.vault_access_logs')" },
    { name: 'pg_net extension', sql: "SELECT extname FROM pg_extension WHERE extname = 'pg_net'" },
    { name: 'audit_logs trigger', sql: "SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_audit_logs_webhook'" },
  ];

  let allGood = true;
  for (const check of checks) {
    try {
      const res = await client.query(check.sql);
      const value = res.rows[0] ? Object.values(res.rows[0])[0] : null;
      if (!value) {
        console.error(`✖ Missing: ${check.name}`);
        allGood = false;
      } else {
        console.log(`✔ Found: ${check.name}`);
      }
    } catch (err) {
      console.error(`✖ Error checking ${check.name}:`, err.message || err);
      allGood = false;
    }
  }

  await client.end();

  if (!allGood) {
    console.error('\nMigration check failed: some objects are missing. Apply migrations and retry.');
    process.exit(1);
  }

  console.log('\nAll security migration objects appear to be present.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Checker failed:', err.message || err);
  process.exit(1);
});
