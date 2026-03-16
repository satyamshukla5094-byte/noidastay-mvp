-- Create room_audit_condition enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_audit_condition') THEN
        CREATE TYPE room_audit_condition AS ENUM ('Working', 'Damaged', 'Missing', 'Dirty');
    END IF;
END$$;

-- Create room_audits table
CREATE TABLE IF NOT EXISTS room_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL, -- Link to legal_agreements or a specific booking
  item_name TEXT NOT NULL,
  condition room_audit_condition DEFAULT 'Working',
  photo_url TEXT,
  verified_by_student BOOLEAN DEFAULT false,
  audit_type TEXT DEFAULT 'move_in', -- 'move_in' or 'move_out'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add move-in/out fields to legal_agreements (acting as bookings)
ALTER TABLE legal_agreements 
ADD COLUMN IF NOT EXISTS move_in_date DATE,
ADD COLUMN IF NOT EXISTS move_out_date DATE,
ADD COLUMN IF NOT EXISTS is_disputed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS handover_confirmed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE room_audits ENABLE ROW LEVEL SECURITY;

-- Room Audits RLS
CREATE POLICY "Users can view audits for their bookings"
ON room_audits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM legal_agreements 
    WHERE legal_agreements.id = room_audits.booking_id 
    AND (legal_agreements.student_id = auth.uid() OR legal_agreements.owner_id = auth.uid())
  )
);

CREATE POLICY "Students can create audits during move-in"
ON room_audits FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM legal_agreements 
    WHERE legal_agreements.id = room_audits.booking_id 
    AND legal_agreements.student_id = auth.uid()
  )
);

CREATE POLICY "Service role full access room audits"
ON room_audits FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
