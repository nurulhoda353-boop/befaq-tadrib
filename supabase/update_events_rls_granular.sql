-- 1. Update RLS for `events` table
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

CREATE POLICY "Users with create permission can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.create')
  )
);

CREATE POLICY "Users with manage permission can update events"
ON public.events FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage' OR permissions ? 'events.manage_no_delete')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage' OR permissions ? 'events.manage_no_delete')
  )
);

CREATE POLICY "Users with manage permission can delete events"
ON public.events FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage')
  )
);

-- 2. Update RLS for `event_registrations` table
DROP POLICY IF EXISTS "Admins and Event Managers can view registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins and Event Managers can update registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Only admins can delete registrations" ON public.event_registrations;

CREATE POLICY "Authorized users can view registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage' OR permissions ? 'events.manage_no_delete')
  )
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
);

CREATE POLICY "Authorized users can update registrations"
ON public.event_registrations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage' OR permissions ? 'events.manage_no_delete')
  )
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage' OR permissions ? 'events.manage_no_delete')
  )
  OR 
  EXISTS (SELECT 1 FROM public.event_managers WHERE event_id = event_registrations.event_id AND user_id = auth.uid())
);

CREATE POLICY "Authorized users can delete registrations"
ON public.event_registrations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR permissions ? 'events.full' OR permissions ? 'events.manage')
  )
);
