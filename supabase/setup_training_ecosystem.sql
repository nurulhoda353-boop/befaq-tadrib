-- 1. Modify the `trainings` table to add necessary columns
ALTER TABLE public.trainings
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'central', -- central, regional, special
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS target_group TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS fee TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS syllabus JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS eligibility JSONB DEFAULT '[]'::jsonb;

-- 2. Create `training_batches` table
CREATE TABLE IF NOT EXISTS public.training_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    total_seats INTEGER DEFAULT 0,
    center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
    fee NUMERIC DEFAULT 0,
    food_fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'upcoming', -- upcoming, running, completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create `training_admissions` table
CREATE TABLE IF NOT EXISTS public.training_admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.training_batches(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    madrasa_name TEXT,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, partial
    application_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Setup Row Level Security (RLS)

-- training_batches
ALTER TABLE public.training_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view batches"
ON public.training_batches FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage batches"
ON public.training_batches FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));


-- training_admissions
ALTER TABLE public.training_admissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert admissions"
ON public.training_admissions FOR INSERT
TO public
WITH CHECK (true);

-- Optional: Allow public to view their own admission if they have the ID (if needed later)
CREATE POLICY "Public can view their own admission"
ON public.training_admissions FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage admissions"
ON public.training_admissions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
