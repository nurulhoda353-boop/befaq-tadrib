-- Update sms_settings to support multiple gateways

ALTER TABLE public.sms_settings 
ADD COLUMN IF NOT EXISTS name text DEFAULT 'TextBee Gateway',
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sender_id text;

-- Add comment
COMMENT ON COLUMN public.sms_settings.name IS 'Name of the gateway (e.g. Grameenphone, BulksmsBD)';
COMMENT ON COLUMN public.sms_settings.priority IS 'Lower number = higher priority for fallback';
COMMENT ON COLUMN public.sms_settings.usage_count IS 'Total successful SMS sent via this gateway';
COMMENT ON COLUMN public.sms_settings.sender_id IS 'Sender ID for specific bulk gateways';
