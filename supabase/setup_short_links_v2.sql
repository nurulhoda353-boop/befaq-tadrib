-- Add expires_at and is_active columns to short_links table

ALTER TABLE public.short_links 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update the types if they already existed with a different type (just to be safe)
-- DO $$ 
-- BEGIN
--   -- Nothing specific to update for types right now, but good practice
-- END $$;
