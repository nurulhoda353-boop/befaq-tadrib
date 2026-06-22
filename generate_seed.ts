import { notices, events, siteInfo } from "./src/lib/data";
import fs from "fs";

// Helper to escape single quotes
const esc = (str: string | undefined | null) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';

// Ensure table creation for global_settings
let sql = `
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
  ${esc(siteInfo.nameBn)}, 
  ${esc(siteInfo.shortName)}, 
  ${esc(siteInfo.tagline)}, 
  ${esc(siteInfo.address)}, 
  ${esc(siteInfo.facebook)}, 
  ${esc(siteInfo.email)}, 
  ${esc(siteInfo.phone)}
WHERE NOT EXISTS (SELECT 1 FROM public.global_settings);

-- 2. Insert Notices
`;

for (const n of notices) {
  let cat = 'general';
  if (n.category === 'ভর্তি') cat = 'admission';
  if (n.category === 'জরুরি') cat = 'urgent';

  sql += `
INSERT INTO public.notices (title, body, category, status, pinned, published_at)
VALUES (${esc(n.title)}, ${esc(n.body)}, ${esc(cat)}, 'published', false, now());
`;
}

sql += "\n-- 3. Insert Events\n";
for (const e of events) {
  sql += `
INSERT INTO public.events (title, location, description, status)
VALUES (${esc(e.title)}, ${esc(e.venue)}, ${esc(e.type)}, 'upcoming');
`;
}

fs.writeFileSync("./supabase/seed_all_data.sql", sql);
console.log("seed_all_data.sql generated for Notices and Events!");
