-- Create SMS Settings table
CREATE TABLE IF NOT EXISTS public.sms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT DEFAULT 'textbee',
    api_key TEXT,
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create SMS Logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    provider_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert a default row for settings if empty
INSERT INTO public.sms_settings (provider) 
SELECT 'textbee' 
WHERE NOT EXISTS (SELECT 1 FROM public.sms_settings);

-- Enable RLS
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Policies for sms_settings
DROP POLICY IF EXISTS "Admins can manage sms_settings" ON public.sms_settings;
CREATE POLICY "Admins can manage sms_settings"
ON public.sms_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role::text = 'admin'
  )
);

-- Policies for sms_logs
DROP POLICY IF EXISTS "Admins can manage sms_logs" ON public.sms_logs;
CREATE POLICY "Admins can manage sms_logs"
ON public.sms_logs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role::text = 'admin'
  )
);

-- Note: Supabase Edge Functions bypass RLS because they run with the SERVICE_ROLE key.
-- Therefore, regular users and anonymous visitors cannot access sms_settings (keeping API keys safe),
-- but they can trigger the Edge Function which will securely access the settings.
