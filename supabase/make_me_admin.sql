INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'nurulhoda353@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
