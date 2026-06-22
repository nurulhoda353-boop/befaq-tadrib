
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
