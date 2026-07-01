-- Add confirmation SMS template column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS confirmation_sms_template text;

-- Add comment
COMMENT ON COLUMN public.events.confirmation_sms_template IS 'Custom SMS template for event confirmation. Supports {name}, {event}, {id} variables.';
