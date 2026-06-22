-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- user_roles table (roles stored SEPARATELY from any profile/users table for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Enums
CREATE TYPE public.notice_category AS ENUM ('general', 'urgent', 'admission');
CREATE TYPE public.notice_status AS ENUM ('draft', 'published', 'scheduled');

-- Table
CREATE TABLE public.notices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  category public.notice_category NOT NULL DEFAULT 'general',
  status public.notice_status NOT NULL DEFAULT 'draft',
  pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  attachment_url text,
  attachment_name text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT ON public.notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;

-- RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Public can read only currently-published notices
CREATE POLICY "Public can view published notices"
  ON public.notices FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );

-- Admins can do everything
CREATE POLICY "Admins can view all notices"
  ON public.notices FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert notices"
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notices"
  ON public.notices FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER notices_set_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helpful indexes
CREATE INDEX notices_status_pub_idx ON public.notices (status, published_at DESC);
CREATE INDEX notices_pinned_idx ON public.notices (pinned) WHERE pinned = true;

-- Anyone can read attachments (so signed URLs work for public site visitors)
CREATE POLICY "Public read cms attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-attachments');

-- Only admins can upload
CREATE POLICY "Admins can upload cms attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can update
CREATE POLICY "Admins can update cms attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can delete
CREATE POLICY "Admins can delete cms attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Public read cms attachments" ON storage.objects;

CREATE POLICY "Public read published notice attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'cms-attachments'
  AND EXISTS (
    SELECT 1 FROM public.notices n
    WHERE n.attachment_url LIKE '%' || storage.objects.name || '%'
      AND n.status = 'published'
      AND (n.published_at IS NULL OR n.published_at <= now())
  )
);

CREATE POLICY "Admins read all cms attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cms-attachments'
  AND public.has_role(auth.uid(), 'admin')
);
insert into storage.buckets (id, name, public) values ('cms-attachments', 'cms-attachments', true) ON CONFLICT DO NOTHING;
