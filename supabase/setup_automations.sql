-- 1. Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create integration_settings table
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id INT PRIMARY KEY DEFAULT 1,
  resend_api_key TEXT,
  wa_access_token TEXT,
  wa_phone_number_id TEXT,
  sms_gateway_url TEXT,
  sms_api_key TEXT,
  sms_sender_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1) -- Ensure only one row exists
);

-- RLS for integration_settings
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write integration settings
DROP POLICY IF EXISTS "Admins can manage integration settings" ON public.integration_settings;
CREATE POLICY "Admins can manage integration settings"
ON public.integration_settings FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Insert default row
INSERT INTO public.integration_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION public.handle_registration_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, net
AS $$
DECLARE
  settings RECORD;
  user_phone TEXT;
  user_email TEXT;
  user_name TEXT;
  event_name TEXT;
  event_schema JSONB;
  phone_label TEXT;
  email_label TEXT;
  msg_body TEXT;
  req_id BIGINT;
BEGIN
  -- Only trigger when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    
    -- Fetch settings
    SELECT * INTO settings FROM public.integration_settings WHERE id = 1;

    -- Fetch Event Name and Schema
    SELECT title, form_schema INTO event_name, event_schema FROM public.events WHERE id = NEW.event_id;

    -- Find the label used for phone in the schema
    SELECT obj->>'label' INTO phone_label
    FROM jsonb_array_elements(event_schema) AS obj
    WHERE obj->>'type' = 'phone'
    LIMIT 1;

    -- Extract phone using the dynamic label, or fallback to common names
    IF phone_label IS NOT NULL THEN
      user_phone := NEW.form_data->>phone_label;
    ELSE
      user_phone := COALESCE(NEW.form_data->>'phone', NEW.form_data->>'Phone', NEW.form_data->>'মোবাইল', NEW.form_data->>'মোবাইল নাম্বার', NEW.form_data->>'Mobile');
    END IF;

    -- Find the label used for email in the schema
    SELECT obj->>'label' INTO email_label
    FROM jsonb_array_elements(event_schema) AS obj
    WHERE obj->>'type' = 'email'
    LIMIT 1;

    -- Extract email
    IF email_label IS NOT NULL THEN
      user_email := NEW.form_data->>email_label;
    ELSE
      user_email := COALESCE(NEW.form_data->>'email', NEW.form_data->>'Email', NEW.form_data->>'ইমেইল');
    END IF;

    -- Extract name (using common fallbacks since name type might just be shorttext)
    user_name := COALESCE(NEW.form_data->>'name', NEW.form_data->>'Name', NEW.form_data->>'নাম', NEW.form_data->>'name_bn', NEW.form_data->>'নাম (বাংলা)', NEW.form_data->>'নাম (ইংরেজি)', 'প্রার্থী');

    -- Compose Message
    msg_body := 'আপনার রেজিস্ট্রেশন সফল হয়েছে! ইভেন্ট: ' || event_name || '। আপনার আইডি: ' || NEW.registration_id;

    -- 1. Send Email via Resend
    IF user_email IS NOT NULL AND user_email != '' AND settings.resend_api_key IS NOT NULL AND settings.resend_api_key != '' THEN
      SELECT net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || settings.resend_api_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'from', 'Befaq Tadrib <onboarding@resend.dev>',
          'to', jsonb_build_array(user_email),
          'subject', 'Registration Confirmed - ' || NEW.registration_id,
          'html', '<div style="font-family: sans-serif; padding: 20px;"><h2>রেজিস্ট্রেশন কনফার্মড!</h2><p>প্রিয় ' || user_name || ',</p><p>' || msg_body || '</p></div>'
        )
      ) INTO req_id;
    END IF;

    -- 2. Send WhatsApp via Meta API
    IF user_phone IS NOT NULL AND user_phone != '' AND settings.wa_access_token IS NOT NULL AND settings.wa_phone_number_id IS NOT NULL AND settings.wa_phone_number_id != '' THEN
      -- Basic formatting for BD numbers (+880...)
      IF length(user_phone) = 11 THEN
        user_phone := '88' || user_phone;
      END IF;

      SELECT net.http_post(
        url := 'https://graph.facebook.com/v20.0/' || settings.wa_phone_number_id || '/messages',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || settings.wa_access_token,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'messaging_product', 'whatsapp',
          'to', user_phone,
          'type', 'template',
          'template', jsonb_build_object(
            'name', 'hello_world',
            'language', jsonb_build_object('code', 'en_US')
          )
        )
      ) INTO req_id;
    END IF;

    -- 3. Send Local SMS via Custom Gateway (Placeholder structure)
    IF user_phone IS NOT NULL AND user_phone != '' AND settings.sms_gateway_url IS NOT NULL AND settings.sms_gateway_url != '' THEN
      SELECT net.http_post(
        url := settings.sms_gateway_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-api-key', settings.sms_api_key
        ),
        body := jsonb_build_object(
          'recipients', jsonb_build_array(user_phone),
          'message', msg_body
        )
      ) INTO req_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_registration_confirmed ON public.event_registrations;
CREATE TRIGGER on_registration_confirmed
AFTER UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_registration_status_change();
