-- 1. Add permissions column to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 2. Update get_all_users RPC to return permissions
DROP FUNCTION IF EXISTS public.get_all_users();
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  role TEXT,
  permissions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Security Check: Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only admins can view all users';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email::text,
    au.created_at,
    COALESCE(ur.role::text, 'viewer'),
    COALESCE(ur.permissions, '[]'::jsonb)
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- 3. Update update_user_role RPC to accept permissions
DROP FUNCTION IF EXISTS public.update_user_role(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT, new_permissions JSONB DEFAULT '[]'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Security Check: Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only admins can change roles and permissions';
  END IF;

  INSERT INTO public.user_roles (user_id, role, permissions)
  VALUES (target_user_id, new_role, new_permissions)
  ON CONFLICT (user_id) DO UPDATE 
  SET role = new_role, 
      permissions = new_permissions;
END;
$$;
