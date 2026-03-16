const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('Verifying project connection and setting up KYC bucket...');
  
  // 1. Ensure the bucket exists using the JS SDK
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('kyc-vault', {
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (bucketError && bucketError.message !== 'Bucket already exists') {
    console.error('Bucket creation failed:', bucketError.message);
  } else {
    console.log('Storage bucket "kyc-vault" is ready.');
  }

  console.log('\n--- MANUAL ACTION REQUIRED ---');
  console.log('The SQL migration for "profiles" table columns must be run via the Supabase Dashboard SQL Editor.');
  console.log('Please copy and execute the following SQL in your Supabase SQL Editor:');
  console.log('--------------------------------------------------');
  const sql = fs.readFileSync('supabase/migrations/20260319000000_core_trust_engine.sql', 'utf8');
  console.log(sql);
  console.log('--------------------------------------------------');
}

main();
