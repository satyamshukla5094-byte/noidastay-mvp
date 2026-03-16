const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main(){
  try {
    const { data, error, count } = await supabase.from('properties').select('id', { count: 'exact' }).limit(100);
    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }
    console.log('Properties count (fetched rows):', (data || []).length);
    if (Array.isArray(data) && data.length > 0) console.log('First id:', data[0].id);
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

main();
