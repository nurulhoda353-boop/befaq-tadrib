-- Create short_links table
CREATE TABLE IF NOT EXISTS public.short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read short_links (needed for redirection)
DROP POLICY IF EXISTS "Anyone can read short_links" ON public.short_links;
CREATE POLICY "Anyone can read short_links" 
ON public.short_links FOR SELECT 
USING (true);

-- Only admins can manage short_links
DROP POLICY IF EXISTS "Admins can manage short_links" ON public.short_links;
CREATE POLICY "Admins can manage short_links"
ON public.short_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role::text = 'admin'
  )
);
