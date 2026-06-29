-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure user_roles has permissions column
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Force Supabase PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- 1. Create user_invites table
CREATE TABLE IF NOT EXISTS public.user_invites (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '[]'::jsonb,
  event_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for invites (admins only)
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage invites" ON public.user_invites;
CREATE POLICY "Admins can manage invites" ON public.user_invites FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 2. Trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invite_rec RECORD;
  event_id_text TEXT;
BEGIN
  -- Check if there's an invite
  SELECT * INTO invite_rec FROM public.user_invites WHERE email = NEW.email;
  
  IF FOUND THEN
    -- Give them the invited role
    INSERT INTO public.user_roles (user_id, role, permissions)
    VALUES (NEW.id, invite_rec.role::public.app_role, invite_rec.permissions)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;
    
    -- Assign event managers if any
    IF invite_rec.event_ids IS NOT NULL AND jsonb_array_length(invite_rec.event_ids) > 0 THEN
      FOR event_id_text IN SELECT jsonb_array_elements_text(invite_rec.event_ids)
      LOOP
        INSERT INTO public.event_managers (event_id, user_id) 
        VALUES (event_id_text::uuid, NEW.id) 
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
    
    -- Delete the invite
    DELETE FROM public.user_invites WHERE email = NEW.email;
  ELSE
    -- Default behavior (give viewer role if no invite)
    INSERT INTO public.user_roles (user_id, role, permissions)
    VALUES (NEW.id, 'viewer', '[]')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RPC for immediate user creation (with password)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  target_email TEXT,
  target_password TEXT,
  target_role TEXT,
  target_permissions JSONB DEFAULT '[]'::jsonb,
  target_events JSONB DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Security Check
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only admins can create users';
  END IF;

  -- Create the invite first so the trigger will process it
  INSERT INTO public.user_invites (email, role, permissions, event_ids)
  VALUES (target_email, target_role, target_permissions, target_events)
  ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role, 
    permissions = EXCLUDED.permissions, 
    event_ids = EXCLUDED.event_ids;

  new_user_id := gen_random_uuid();
  
  -- Insert directly into auth.users (this fires the trigger we just created)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', target_email, 
    crypt(target_password, gen_salt('bf')), now(), 
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', ''
  );
END;
$$;

-- 4. Update existing update_user_role RPC to handle events
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID, 
  new_role TEXT, 
  new_permissions JSONB DEFAULT '[]'::jsonb,
  new_events JSONB DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  event_id_text TEXT;
BEGIN
  -- Security Check
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only admins can change roles and permissions';
  END IF;

  -- Update role and permissions
  INSERT INTO public.user_roles (user_id, role, permissions)
  VALUES (target_user_id, new_role::public.app_role, new_permissions)
  ON CONFLICT (user_id) DO UPDATE 
  SET role = new_role::public.app_role, 
      permissions = new_permissions;

  -- Update event managers (delete all for this user, then insert new ones)
  DELETE FROM public.event_managers WHERE user_id = target_user_id;
  
  IF new_events IS NOT NULL AND jsonb_array_length(new_events) > 0 THEN
    FOR event_id_text IN SELECT jsonb_array_elements_text(new_events)
    LOOP
      INSERT INTO public.event_managers (event_id, user_id) 
      VALUES (event_id_text::uuid, target_user_id);
    END LOOP;
  END IF;
END;
$$;

-- 5. Update get_all_users RPC to also return assigned event_ids
DROP FUNCTION IF EXISTS public.get_all_users();
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  role TEXT,
  permissions JSONB,
  events JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Security Check: Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur_check WHERE ur_check.user_id = auth.uid() AND ur_check.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only admins can view all users';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email::text,
    au.created_at,
    COALESCE(ur.role::text, 'viewer'),
    COALESCE(ur.permissions, '[]'::jsonb),
    COALESCE(
      (SELECT jsonb_agg(em.event_id) FROM public.event_managers em WHERE em.user_id = au.id),
      '[]'::jsonb
    )
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- 6. RPC Function to delete a user (Only accessible by admins)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  -- Security Check: Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only admins can delete users';
  END IF;

  -- Delete from auth.users (this will cascade delete from public.user_roles)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

