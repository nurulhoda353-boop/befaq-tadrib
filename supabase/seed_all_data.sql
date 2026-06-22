
-- 1. Create global_settings table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name_bn TEXT NOT NULL DEFAULT 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',
  short_name TEXT NOT NULL DEFAULT 'বেফাক প্রশিক্ষণ শাখা',
  tagline TEXT,
  address TEXT,
  facebook_url TEXT,
  email TEXT,
  phone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.global_settings TO anon;
GRANT SELECT ON public.global_settings TO authenticated;
-- Admins can update
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read global_settings') THEN
    CREATE POLICY "Allow public read global_settings" ON public.global_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admins to update global_settings') THEN
    CREATE POLICY "Allow admins to update global_settings" ON public.global_settings FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Insert global settings if not exists
INSERT INTO public.global_settings (site_name_bn, short_name, tagline, address, facebook_url, email, phone)
SELECT 
  'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ', 
  'বেফাক প্রশিক্ষণ শাখা', 
  'আল্লাহর পথে শেখাও — সেরা শিক্ষক তৈরি করি আমরা', 
  'বেফাক প্রশিক্ষণ সেন্টার, সামাদনগর (ভাঙ্গাপ্রেস), যাত্রাবাড়ী, ঢাকা-১২৩৬', 
  'https://facebook.com/wifaqtadrib.bd', 
  'prosikkhonwifaq@gmail.com', 
  '০১৭৫৭-৩৭০০৩৪'
WHERE NOT EXISTS (SELECT 1 FROM public.global_settings);

-- 2. Insert Notices

INSERT INTO public.notices (title, body, category, status, pinned, published_at)
VALUES ('১৪৪৬ হিজরী শাবান-রমজান কেন্দ্রীয় প্রশিক্ষণের ভর্তি বিজ্ঞপ্তি', 'আগামী শাবান-রমজান মাসে অনুষ্ঠিতব্য কেন্দ্রীয় দরসিয়াত শিক্ষক ও শিক্ষিকা প্রশিক্ষণে ভর্তির আবেদন গ্রহণ শুরু হয়েছে।', 'admission', 'published', false, now());

INSERT INTO public.notices (title, body, category, status, pinned, published_at)
VALUES ('৩৫তম ব্যাচ হুফফাজ শিক্ষক প্রশিক্ষণের রেজাল্ট প্রকাশ', 'কেন্দ্রীয় হুফফাযুল কোরআন শিক্ষক প্রশিক্ষণের ৩৫তম ব্যাচের রেজাল্ট প্রকাশিত হয়েছে। রোল নম্বর দিয়ে যাচাই করুন।', 'general', 'published', false, now());

INSERT INTO public.notices (title, body, category, status, pinned, published_at)
VALUES ('চট্টগ্রাম বিভাগে আঞ্চলিক নূরানী প্রশিক্ষণের সূচি', 'চট্টগ্রাম বিভাগের ১১টি জেলায় আগামী মাসে আঞ্চলিক নূরানী শিক্ষক প্রশিক্ষণ অনুষ্ঠিত হবে।', 'general', 'published', false, now());

INSERT INTO public.notices (title, body, category, status, pinned, published_at)
VALUES ('নতুন আঞ্চলিক কেন্দ্র অনুমোদন — সিলেট', 'সিলেট বিভাগে নতুন ৩টি আঞ্চলিক প্রশিক্ষণ কেন্দ্র অনুমোদন পেয়েছে।', 'general', 'published', false, now());

-- 3. Insert Events

INSERT INTO public.events (title, location, description, status)
VALUES ('৩৬তম ব্যাচ কেন্দ্রীয় হুফফাজ প্রশিক্ষণ উদ্বোধন', 'বেফাক প্রশিক্ষণ সেন্টার, যাত্রাবাড়ী', 'উদ্বোধন', 'upcoming');

INSERT INTO public.events (title, location, description, status)
VALUES ('আঞ্চলিক সমন্বয়কারী কর্মশালা', 'ঢাকা', 'কর্মশালা', 'upcoming');

INSERT INTO public.events (title, location, description, status)
VALUES ('জাতীয় শিক্ষক সেমিনার', 'ঢাকা', 'সেমিনার', 'upcoming');
