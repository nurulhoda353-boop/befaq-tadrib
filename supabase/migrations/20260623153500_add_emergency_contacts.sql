-- Add emergency contact columns to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS show_emergency_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact_title TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_description TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone1 TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone2 TEXT;
