import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need the SERVICE ROLE KEY to bypass RLS for inserting raw mock data,
// but since we might only have the anon key, we'll try with ANON KEY. 
// Note: This requires RLS to allow inserts from anon, or RLS to be disabled.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_PROPERTIES = [
  {
    title: "Premium Boys PG in Knowledge Park",
    price: 8500,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    location: "Knowledge Park III",
  },
  {
    title: "Cozy Girls Apartment",
    price: 10000,
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1de2d1d0e1?auto=format&fit=crop&q=80&w=800",
    location: "Alpha 1",
  },
  {
    title: "Budget Shared Room",
    price: 6000,
    image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800",
    location: "Beta 2",
  },
  {
    title: "Luxury Studio with AC & Food",
    price: 14000,
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    location: "Knowledge Park III",
  }
];

async function seedData() {
  console.log('Seeding mock data to Supabase listings table...');
  
  const { data, error } = await supabase
    .from('listings')
    .insert(MOCK_PROPERTIES)
    .select();

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Successfully inserted mock properties:', data);
  }
}

seedData();
