-- 1. Add new columns to existing `events` table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS time TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS has_registration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reg_prefix TEXT;

-- 2. Create `event_registrations` table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
    serial_no INTEGER,
    registration_id TEXT,
    created_by_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ
);

-- Add unique constraint so registration_id is unique per event
ALTER TABLE public.event_registrations
ADD CONSTRAINT event_registrations_registration_id_key UNIQUE (event_id, registration_id);

-- Add unique constraint so serial_no is unique per event
ALTER TABLE public.event_registrations
ADD CONSTRAINT event_registrations_serial_no_key UNIQUE (event_id, serial_no);

-- 3. Setup Row Level Security (RLS) for event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a registration (public access)
CREATE POLICY "Public can insert registrations"
ON public.event_registrations FOR INSERT
TO public
WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins can manage registrations"
ON public.event_registrations FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Note: We might need a policy for users to view their own registration if we implement user auth later. 
-- For now, public insert and admin full access is sufficient.
