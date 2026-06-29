-- 1. Create event_managers table
CREATE TABLE IF NOT EXISTS public.event_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- 2. RLS for event_managers
ALTER TABLE public.event_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event_managers"
ON public.event_managers FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own manager access"
ON public.event_managers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Update RLS for event_registrations to allow managers
-- Drop existing admin policy to recreate them cleaner
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.event_registrations;

-- Allow public inserts (already exists, but kept for clarity)
-- Policy "Public can insert registrations" already exists.

-- Select Policy: Admins OR Event Managers
CREATE POLICY "Admins and Event Managers can view registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
);

-- Update Policy: Admins OR Event Managers
CREATE POLICY "Admins and Event Managers can update registrations"
ON public.event_registrations FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
);

-- Delete Policy: ONLY Admins
CREATE POLICY "Only admins can delete registrations"
ON public.event_registrations FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
