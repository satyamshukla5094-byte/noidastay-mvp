-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for anonymous students
  role TEXT, -- 'student' or 'owner' or 'anonymous'
  action_type TEXT NOT NULL, -- e.g., 'search', 'view_property', 'click_whatsapp', 'filter_used'
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g., {"query": "Noida", "property_id": "123"}
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert activity logs (asynchronous frontend tracking)
CREATE POLICY "Anyone can insert activity logs" 
  ON activity_logs FOR INSERT WITH CHECK (true);

-- Allow admins (or anyone for MVP purposes) to view activity logs
CREATE POLICY "Activity logs are viewable by everyone in MVP." 
  ON activity_logs FOR SELECT USING (true);
