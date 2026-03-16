# NoidaStay Database Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click "SQL Editor" from left sidebar

### Step 2: Run Complete Setup
Copy and paste the entire content from `setup_database.sql` file into the SQL Editor and click "Run".

This will create:
- ✅ All 21 database tables
- ✅ Row Level Security (RLS) policies
- ✅ Storage buckets for documents
- ✅ Performance indexes
- ✅ Sample data for testing

### Step 3: Verify Setup
After running the script, you should see:
```
NoidaStay database setup completed successfully!
```

### Step 4: Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for full features)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
DISCORD_WEBHOOK=your-discord-webhook
```

## 🔧 If Issues Occur

### Fix Common Problems
If you see errors after setup, run `fix_database.sql` in the SQL Editor.

### Manual Table Check
Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Sample Data Check
Verify sample properties:
```sql
SELECT COUNT(*) FROM properties;
```

## 🎯 After Setup

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **You should see:**
   - 3 sample PG listings
   - Working search and filters
   - No more "Loading properties..." message

## 📱 Test Features

- ✅ Browse property listings
- ✅ Search by location/price
- ✅ View property details
- ✅ Test user registration
- ✅ Check mobile responsiveness

## 🆘 Troubleshooting

| Issue | Solution |
|--------|----------|
| "Database table missing" | Run setup_database.sql |
| "Loading properties..." forever | Check environment variables |
| 500 Internal Server Error | Check browser console for errors |
| No images showing | Check Supabase storage buckets |

## 🎉 Success Indicators

- ✅ Homepage loads with 3 sample properties
- ✅ Search filters work instantly
- ✅ No console errors
- ✅ Mobile layout looks good
- ✅ Property detail pages load

Your NoidaStay is now ready for development and testing!
