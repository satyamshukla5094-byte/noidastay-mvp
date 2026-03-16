import { createClient } from '@supabase/supabase-js';

// Supabase project details — replace or set via environment if preferred
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ejpwcqnzcmljkkzbjxjl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcHdjcW56Y21samtremJqeGpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ0MTg5OSwiZXhwIjoyMDg5MDE3ODk5fQ.fV6-gY1BmYScswv4LtTXReHF4lrqhq07lu4jHsWsfDk';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const PROPERTIES = [
  { name: 'Clanbridge Living', locality: 'Knowledge Park I', type: 'Girls', price: 18500, description: 'Premium fully furnished rooms with 4-course meals and international standards.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'], features: ['Gym', 'Biometric', 'Housekeeping', 'Laundry'] },
  { name: 'The Castle Hostel', locality: 'Knowledge Park III', type: 'Boys', price: 11000, description: 'Student-centric living with high-speed WiFi and library near major colleges.', images: ['https://images.unsplash.com/photo-1555854811-82242201be15'], features: ['WiFi', 'Library', 'Mess', 'AC'] },
  { name: 'VLIV Residence', locality: 'Pari Chowk', type: 'Girls', price: 32700, description: 'Ultra-luxury women-only residence with mental wellness support and organic meals.', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'], features: ['Gym', 'Yoga', 'Cafe', 'Premium Security'] },
  { name: 'Adelaide House', locality: 'Knowledge Park II', type: 'Coed', price: 15200, description: 'Managed by Stanza Living. Modern rooms with smart app-based management.', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'], features: ['App Control', 'Biometric', 'WiFi'] },
  { name: 'The Chrome Boys Hostel', locality: 'Knowledge Park III', type: 'Boys', price: 12000, description: 'High-energy hostel with dedicated gaming zones and student community.', images: ['https://images.unsplash.com/photo-1560185127-6a430581ef9c'], features: ['Gaming Zone', 'Power Backup', 'Gym'] },
  { name: 'Athens House', locality: 'Knowledge Park II', type: 'Boys', price: 12900, description: 'Professional stay with rooftop cafe and study-friendly environment.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'], features: ['Cafe', 'Laundry', 'Study Area'] },
  { name: 'Manya Boys Luxury', locality: 'Pari Chowk', type: 'Boys', price: 5500, description: 'Budget-friendly luxury with all basic amenities near the metro.', images: ['https://images.unsplash.com/photo-1512918766671-56f0b173327d'], features: ['WiFi', 'CCTV', 'Mess'] },
  { name: 'Alice Girls Hostel', locality: 'Pari Chowk', type: 'Girls', price: 9999, description: 'Safe haven for girls with separate dining and high security.', images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed'], features: ['Security', 'Cleanliness', 'Veg Food'] },
  { name: 'Nalanda Living', locality: 'Knowledge Park III', type: 'Coed', price: 14000, description: 'Known for hygienic food and hospital proximity.', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb'], features: ['Lift', 'Emergency Support', 'Canteen'] },
  { name: "Destiny's Home", locality: 'Ansal Golf Links', type: 'Coed', price: 10500, description: 'Spacious rooms with large windows and garden view.', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'], features: ['Garden', 'Parking', 'WiFi'] },
  { name: 'Varsika Girls PG', locality: 'Gamma 1', type: 'Girls', price: 8000, description: 'Homely environment with study desk in every room.', images: ['https://images.unsplash.com/photo-1536376074432-8d2a3ff44531'], features: ['WiFi', 'Mess', 'Housekeeping'] },
  { name: 'Tanwar Boys PG', locality: 'Pari Chowk', type: 'Boys', price: 7000, description: 'Prime location, just a walk away from metro and market.', images: ['https://images.unsplash.com/photo-1555854811-82242201be15'], features: ['WiFi', 'AC', 'Laundry'] },
  { name: 'Rijeka House', locality: 'Knowledge Park II', type: 'Boys', price: 15999, description: 'Modern living for working professionals and serious students.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'], features: ['Biometric', 'Gym', 'Private Washroom'] },
  { name: 'Chicago House', locality: 'Knowledge Park II', type: 'Girls', price: 15400, description: 'Stylish interiors and curated social events for residents.', images: ['https://images.unsplash.com/photo-1515378960530-7c0da6231fb1'], features: ['Social Events', 'WiFi', 'Café'] },
  { name: 'Standard PG', locality: 'Beta 1', type: 'Boys', price: 12000, description: 'Standard living with no-nonsense rules and high speed net.', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'], features: ['24/7 Security', 'AC', 'Power Backup'] },
  { name: 'The Corner House', locality: 'Alpha 2', type: 'Boys', price: 9500, description: 'Located in the heart of the market, best for foodies.', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'], features: ['Near Metro', 'Market Access', 'WiFi'] },
  { name: 'Srk Girls PG', locality: 'Gamma 2', type: 'Girls', price: 7500, description: 'Budget-friendly with a focus on hygiene and safety.', images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed'], features: ['Mess', 'WiFi', 'CCTV'] },
  { name: 'RPH Residency', locality: 'Sector P-3', type: 'Boys', price: 9000, description: 'Gated society feel with quiet surroundings.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'], features: ['Security', 'Park View', 'WiFi'] },
  { name: 'Royal Paradise', locality: 'Delta 1', type: 'Coed', price: 8500, description: 'Large property with student community from all nearby colleges.', images: ['https://images.unsplash.com/photo-1555854811-82242201be15'], features: ['Mess', 'Gaming', 'Library'] },
  { name: 'Lohia Hostels', locality: 'Knowledge Park II', type: 'Coed', price: 11000, description: 'Prime spot for students of GNIT and GL Bajaj.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'], features: ['Walkable', 'AC', 'WiFi'] },
  { name: 'Tanwar Boys Hostel', locality: 'Alpha 1', type: 'Boys', price: 6500, description: 'Basic and functional, zero hidden costs.', images: ['https://images.unsplash.com/photo-1512918766671-56f0b173327d'], features: ['WiFi', 'Food', 'Cleaning'] },
  { name: 'The Farm Castle', locality: 'Knowledge Park III', type: 'Coed', price: 12500, description: 'Unique farm-style property with massive open spaces.', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'], features: ['Lawn', 'WiFi', 'Mess'] },
  { name: 'Paris House', locality: 'Knowledge Park II', type: 'Girls', price: 15500, description: 'Elegant design with balcony rooms.', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c'], features: ['Balcony', 'WiFi', 'High Security'] },
  { name: 'Aahna PG', locality: 'Beta 1', type: 'Coed', price: 7500, description: 'Affordable sharing rooms for budget-conscious students.', images: ['https://images.unsplash.com/photo-1560185127-6a430581ef9c'], features: ['Sharing', 'Basic Food', 'WiFi'] },
  { name: 'Sapphire Boys', locality: 'Ansal Golf Link', type: 'Boys', price: 10000, description: 'Modern construction with AC and gym included.', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'], features: ['Gym', 'AC', 'Balcony'] },
  { name: 'Maira Homestay', locality: 'Delta 2', type: 'Coed', price: 8000, description: 'Homely feel with focus on quiet study time.', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb'], features: ['Quiet Zone', 'WiFi', 'Home Food'] },
  { name: 'Shree Ram PG', locality: 'Delta 1', type: 'Coed', price: 8500, description: 'Reliable management and long-term stays.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'], features: ['WiFi', 'CCTV', 'Laundry'] },
  { name: 'Aashi Girls', locality: 'Pari Chowk', type: 'Girls', price: 8200, description: 'Close to hospital and metro, very convenient.', images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed'], features: ['Safe Location', 'WiFi', 'Food'] },
  { name: 'Pooja Housing', locality: 'Beta 2', type: 'Coed', price: 7800, description: 'Offers guest rooms for visiting parents.', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'], features: ['Parent Guest Room', 'WiFi', 'Parking'] },
  { name: 'Ever Green PG', locality: 'Beta 2', type: 'Coed', price: 8100, description: 'Simple living with home-cooked meals thrice a day.', images: ['https://images.unsplash.com/photo-1512918766671-56f0b173327d'], features: ['WiFi', 'Mess', 'Safety'] }
];

function randomOffset() {
  // small random offset to distribute lat/lng around GN
  return (Math.random() - 0.5) * 0.02;
}

async function main() {
  try {
    console.log('Creating seed owner user...');
    const email = `seed-owner-${Date.now()}@noidastay.local`;
    const pw = 'TempPass!1234';
    const createResp = await supabase.auth.admin.createUser({
      email,
      password: pw,
      email_confirm: true
    });

    if (createResp.error) throw createResp.error;
    // supabase-js may return the user under different shapes; try several paths
    const createdUser = createResp.data ?? createResp.user ?? createResp;
    const ownerId = createdUser?.id || createdUser?.user?.id || createdUser?.user_id;
    console.log('createResp:', Object.keys(createResp));
    console.log('Created user id:', ownerId);

    // insert profile
    const { error: profileErr } = await supabase.from('profiles').insert({ id: ownerId, full_name: 'Seed Owner', role: 'owner' });
    if (profileErr) throw profileErr;
    console.log('Profile created for owner.');

    // map PROPERTIES to DB columns
    const propsToInsert = PROPERTIES.map((p, idx) => ({
      owner_id: ownerId,
      title: p.name,
      description: p.description,
      price: p.price,
      lat: 28.47 + randomOffset(),
      lng: 77.51 + randomOffset(),
      sector: p.locality,
      amenities: p.features,
      is_verified: false,
      images: p.images
    }));

    console.log('Inserting properties...');
    const { data: inserted, error: insertErr } = await supabase.from('properties').insert(propsToInsert).select();
    if (insertErr) throw insertErr;
    console.log(`Inserted ${inserted.length} properties.`);
  } catch (err) {
    console.error('Error seeding properties:', err.message || err);
    process.exitCode = 1;
  }
}

main();
