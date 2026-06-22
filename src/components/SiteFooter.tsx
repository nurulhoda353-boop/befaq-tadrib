import { Link } from "@tanstack/react-router";
import { siteInfo as staticSiteInfo } from "@/lib/data";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const { data: globalSettings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").limit(1).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const siteInfo = globalSettings
    ? {
        nameBn: globalSettings.site_name_bn || staticSiteInfo.nameBn,
        shortName: globalSettings.short_name || staticSiteInfo.shortName,
        phone: globalSettings.phone || staticSiteInfo.phone,
        email: globalSettings.email || staticSiteInfo.email,
        address: globalSettings.address || staticSiteInfo.address,
        facebook: globalSettings.facebook_url || staticSiteInfo.facebook,
      }
    : staticSiteInfo;

  return (
    <footer className="mt-24 bg-hero-luxe text-primary-foreground/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-background/95 p-1">
              <img src={logo} alt="বেফাক প্রশিক্ষণ শাখা" className="h-full w-full object-contain" />
            </div>




            <div>
              <div className="text-lg font-bold">বেফাক প্রশিক্ষণ শাখা</div>
              <div className="text-xs opacity-75">{siteInfo.nameBn}</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed opacity-80">
            দেশের কওমী শিক্ষাব্যবস্থার গুণগত মান উন্নয়নে নিবেদিত একটি জাতীয় প্রশিক্ষণ প্ল্যাটফর্ম।
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-sm opacity-85">
            <li><Link to="/trainings" className="hover:text-gold">প্রশিক্ষণ তালিকা</Link></li>
            <li><Link to="/admission" target="_blank" rel="noopener noreferrer" className="hover:text-gold">অনলাইন আবেদন</Link></li>
            <li><Link to="/results" className="hover:text-gold">রেজাল্ট</Link></li>
            <li><Link to="/notices" className="hover:text-gold">নোটিশ</Link></li>
            <li><Link to="/about" className="hover:text-gold">আমাদের সম্পর্কে</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">যোগাযোগ</h4>
          <ul className="space-y-3 text-sm opacity-85">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{siteInfo.address}</span></li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" /><span>{siteInfo.phone}</span></li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" /><span>{siteInfo.email}</span></li>
            <li><a href={siteInfo.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-gold"><Facebook size={16} /> ফেসবুক পেজ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs opacity-70 sm:px-6">
          © ২০২৫ বেফাক প্রশিক্ষণ শাখা — সর্বস্বত্ব সংরক্ষিত
        </div>
      </div>
    </footer>
  );
}
