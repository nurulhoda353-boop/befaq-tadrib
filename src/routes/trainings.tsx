import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { trainings as dummyTrainings } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight, BookOpen, Calendar, ChevronRight, Clock,
  MapPin, Sparkles, Target, Users, Tag, Award, GraduationCap,
  PenTool, BookType, Monitor, Languages, Book, PhoneCall
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/trainings")({
  head: () => ({
    meta: [
      { title: "প্রশিক্ষণ তালিকা — বেফাক প্রশিক্ষণ শাখা" },
      {
        name: "description",
        content: "বেফাক প্রশিক্ষণ শাখার সকল সারাবছর চলমান এবং বিশেষ প্রশিক্ষণ তালিকা।",
      },
    ],
  }),
  component: TrainingsPage,
});

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (v: string | number) => String(v).replace(/\d/g, (d) => bnDigits[+d]);

function getTrainingIcon(id: string) {
  switch (id) {
    case "c1": return <BookOpen size={22} />;
    case "c2": return <Award size={22} />;
    case "r1": return <Book size={22} />;
    case "r2": return <BookType size={22} />;
    case "r3": return <PenTool size={22} />;
    case "r4": return <Award size={22} />;
    case "r5": return <BookOpen size={22} />;
    case "s1": return <Book size={18} />;
    case "s2": return <BookType size={18} />;
    case "s3": return <Award size={18} />;
    case "s4": return <BookOpen size={18} />;
    case "s5": return <PenTool size={18} />;
    case "s6": return <Monitor size={18} />;
    case "s7": return <Languages size={18} />;
    default: return <GraduationCap size={22} />;
  }
}

function TrainingsPage() {
  const { data: dbTrainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Use DB trainings if available, otherwise fallback to dummy structure for the UI
  // Note: We map DB fields to the expected UI fields if they differ
  const trainings = dbTrainings.length > 0 ? dbTrainings.map((t: any) => ({
    id: t.id,
    slug: t.slug,
    name: t.title,
    type: t.type,
    category: t.category,
    duration: t.duration,
    targetGroup: t.target_group,
    location: t.location,
    description: t.description,
  })) : dummyTrainings;

  const central = trainings.filter((t: any) => t.type === "central");
  const regional = trainings.filter((t: any) => t.type === "regional");
  const special = trainings.filter((t: any) => t.type === "special");

  const { data: upcomingBatches = [] } = useQuery({
    queryKey: ["upcoming-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_batches")
        .select(`
          *,
          trainings ( id, title, slug )
        `)
        .eq("status", "upcoming")
        .order("start_date", { ascending: true })
        .limit(10);
      if (error) throw error;
      
      return data.map((b: any) => ({
        id: b.id,
        trainingId: b.trainings?.id,
        title: b.trainings?.title,
        start: b.start_date ? "শীঘ্রই শুরু" : "তারিখ নির্ধারিত নয়",
        date: b.start_date || "অপেক্ষমান",
        remaining: b.total_seats,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO — dark luxe */}
      <section className="relative overflow-hidden border-b border-border bg-dark-luxe text-primary-foreground">
        <div
          className="absolute inset-0 bg-star-pattern opacity-[0.03] pointer-events-none"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 z-10 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              বেফাক প্রশিক্ষণ শাখা
            </div>

            <h1 className="mt-6 text-3xl font-extrabold leading-[1.3] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl text-balance sm:text-4xl">
              বিচক্ষণ উলামা গঠনে{" "}
              <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                বেফাকের
              </span>{" "}
              বিশেষায়িত প্রশিক্ষণ
            </h1>

            <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg max-w-2xl mx-auto">
              সারাবছর চলমান ৭টি বুনিয়াদি প্রশিক্ষণ এবং শাবান-রমাদানে ৭টি বিশেষ মেগা ইভেন্ট নিয়ে আমাদের "মহা ইউনিভার্স"।
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="#running-trainings" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-bright px-8 py-4 text-sm font-bold text-gold-foreground shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)] transition hover:brightness-110 hover:scale-105 active:scale-95">
                প্রশিক্ষণ তালিকা <ChevronRight size={16} />
              </a>
              <Link to="/admission" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10 hover:border-gold/30">
                ভর্তির আবেদন করুন
              </Link>
            </div>
          </div>

          {/* UPCOMING BATCHES BAR */}
          <div className="mt-16 max-w-5xl mx-auto sm:mt-20">
            <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-[#d4af37] to-[#b5952f] p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center sm:p-6">
              <div className="shrink-0 flex items-center gap-4 md:border-r md:border-dark-luxe/20 md:pr-6 justify-center md:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-luxe text-gold-bright shadow-lg md:h-12 md:w-12">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-dark-luxe">আসন্ন ব্যাচসমূহ</h3>
                  <p className="text-xs font-semibold text-dark-luxe/70">আগামী ১৫ দিনের মধ্যে শুরু</p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden w-full relative mask-edges">
                <div className="flex w-max gap-4 animate-marquee py-2 pl-2">
                  {[...upcomingBatches, ...upcomingBatches, ...upcomingBatches].map((b, i) => (
                    <div key={`${b.id}-${i}`} className="min-w-[280px] shrink-0 rounded-xl border border-white/10 bg-dark-luxe p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:border-gold/50 cursor-pointer">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-gold-bright px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20">{b.start}</span>
                        <span className="text-[10px] font-bold text-white/60">{toBn(b.remaining)} আসন বাকি</span>
                      </div>
                      <h4 className="mt-3 text-[15px] font-extrabold text-white truncate">{b.title}</h4>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5"><Clock size={12} className="text-gold" /> {b.date}</span>
                        <Link to="/admission" search={{ training: b.trainingId }} className="text-[11px] font-bold text-gold hover:text-gold-bright flex items-center gap-1 group/btn bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors">
                          আবেদন <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YEAR-ROUND TRAININGS (FIXED LIGHT PREMIUM SECTION) */}
      <section id="running-trainings" className="w-full bg-[#FCFBF8] text-primary-dark py-16 relative overflow-hidden sm:py-24">
        {/* Soft elegant glow to make it premium rather than dark/muddy */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-dark">
              <Sparkles size={12} /> সারাবছর রানিং
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-[#1a1a1a] sm:text-3xl sm:text-4xl drop-shadow-sm">বুনিয়াদি প্রশিক্ষণ ধারা</h2>
            <p className="mt-4 text-primary-dark/70 text-base font-medium sm:text-lg">কেন্দ্রীয় এবং আঞ্চলিকভাবে সারা বছর জুড়ে চলমান ৭টি বেসিক প্রশিক্ষণ।</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Central */}
            <div className="space-y-6 flex flex-col">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-black/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark shadow-sm"><Award size={22} /></div>
                <h3 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">কেন্দ্রীয় প্রশিক্ষণ</h3>
                <span className="ml-auto text-xs font-bold bg-primary/5 text-primary-dark px-3 py-1 rounded-full border border-primary/10">{toBn(central.length)}টি প্রশিক্ষণ</span>
              </div>
              <div className="grid gap-5">
                {central.map(t => <PremiumLightTrainingCard key={t.id} t={t} variant="gold" />)}
              </div>
              
              {/* Featured Image Fix - User requirement: dark background, theme-color contrast retouch */}
              <div className="mt-4 flex-1 rounded-2xl overflow-hidden border border-border shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] relative min-h-[250px] group hidden sm:block bg-dark-luxe">
                {/* Image blending with dark background and gold tint */}
                <img 
                  src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80" 
                  alt="Islamic Architecture" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-700" 
                />
                {/* Golden/Theme Overlay to perfectly match the theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-luxe via-dark-luxe/80 to-dark-luxe/10 z-10" />
                <div className="absolute inset-0 bg-gold/10 mix-blend-overlay z-10" />
                
                <div className="absolute bottom-0 inset-x-0 p-8 z-20">
                  <h4 className="text-2xl font-extrabold text-gold-bright drop-shadow-md">ইলম ও আমলের সমন্বয়</h4>
                  <p className="text-sm font-medium text-white/90 mt-2 leading-relaxed max-w-sm">
                    প্রশিক্ষণ কেন্দ্রে আপনার জন্য রয়েছে একটি আদর্শ ও নিরিবিলি পরিবেশ, যা আপনাকে পুরোপুরি ইলমের সাধনায় মগ্ন হতে সাহায্য করবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Regional */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-black/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark shadow-sm"><MapPin size={22} /></div>
                <h3 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">আঞ্চলিক প্রশিক্ষণ</h3>
                <span className="ml-auto text-xs font-bold bg-primary/5 text-primary-dark px-3 py-1 rounded-full border border-primary/10">{toBn(regional.length)}টি প্রশিক্ষণ</span>
              </div>
              <div className="grid gap-5">
                {regional.map(t => <PremiumLightTrainingCard key={t.id} t={t} variant="primary" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIAL RAMADAN TRAININGS */}
      <section className="relative overflow-hidden border-y border-border bg-dark-luxe text-primary-foreground py-24">
        <div
          className="absolute inset-0 bg-star-pattern opacity-[0.03] pointer-events-none"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Target size={12} /> বাৎসরিক স্পেশাল ইভেন্ট
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl drop-shadow-sm">
              শাবান ও রমাদান <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">মহা আয়োজন</span>
            </h2>
            <p className="mt-4 text-white/60 text-lg">
              দেশের প্রখ্যাত ওলামায়ে কেরামের পরিচালনায় রমাদান উপলক্ষে আয়োজিত সর্ববৃহৎ ৭টি বিশেষ প্রশিক্ষণ মেলা।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {special.map(t => <SpecialTrainingCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CONTACT SECTION (LIGHT) */}
      <section className="w-full bg-[#FCFBF8] text-primary-dark py-12 border-t border-black/5 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-gold/20 bg-white p-6 md:p-12 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            
            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] drop-shadow-sm">প্রশিক্ষণ বা ভর্তি সংক্রান্ত জিজ্ঞাসা আছে?</h2>
              <p className="mt-3 text-primary-dark/80 font-medium max-w-xl">আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন। সকাল ৯টা থেকে বিকাল ৫টা পর্যন্ত আমরা আপনার সেবায় নিয়োজিত।</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
              <a href="tel:01722443445" className="flex items-center justify-center gap-3 rounded-xl bg-primary/5 px-6 py-4 transition hover:bg-primary/10 border border-primary/10 group/phone hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform duration-300 group-hover/phone:scale-110">
                  <PhoneCall size={18} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-primary-dark/60 uppercase">হেল্পলাইন</div>
                  <div className="font-extrabold text-[#1a1a1a] tracking-wide">০১৭২২-৪৪৩৪৪৫</div>
                </div>
              </a>
              
              <Link to="/contact" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-bright px-8 py-4 font-bold text-dark-luxe shadow-lg shadow-gold/20 transition hover:brightness-110 hover:-translate-y-1 border border-gold/50">
                বিস্তারিত যোগাযোগ <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PremiumLightTrainingCard({ t, variant }: { t: any; variant: 'gold' | 'primary' }) {
  const isGold = variant === 'gold';
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] hover:border-${isGold ? 'gold' : 'primary'}/30`}>
      {/* Dark theme accent on the left border */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isGold ? 'bg-gold' : 'bg-primary'} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex gap-4 pl-2">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isGold ? 'bg-dark-luxe text-gold-bright' : 'bg-primary/10 text-primary-dark'} shadow-md transition-transform group-hover:scale-110`}>
          {getTrainingIcon(t.id)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-lg text-[#1a1a1a] leading-snug truncate">{t.name}</h4>
          <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold text-primary-dark/60 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Clock size={12} className={isGold ? "text-gold-dark" : "text-primary"}/> {t.duration}</span>
            <span className="flex items-center gap-1"><Users size={12} className={isGold ? "text-gold-dark" : "text-primary"}/> {t.targetGroup}</span>
          </div>
          <p className="mt-3 text-[13px] font-medium text-primary-dark/70 line-clamp-2 leading-relaxed">{t.description}</p>
          
          <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-dark/80 bg-black/5 px-2.5 py-0.5 rounded border border-black/5">
              <MapPin size={10} /> {t.location}
            </span>
            <Link to="/trainings/$slug" params={{ slug: t.slug }} className={`inline-flex items-center gap-1 text-xs font-extrabold ${isGold ? 'text-gold-dark hover:text-gold' : 'text-primary hover:text-primary-dark'} transition-colors`}>
              বিস্তারিত দেখুন <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecialTrainingCard({ t }: { t: any }) {
  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-gold/30 hover:shadow-[0_15px_30px_-15px_rgba(212,175,55,0.15)]">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-bright border border-gold/20 transition-transform group-hover:scale-110">
          {getTrainingIcon(t.id)}
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white/80 border border-white/5">
          {t.duration}
        </span>
      </div>
      
      <h4 className="font-extrabold text-[1.15rem] text-white leading-snug group-hover:text-gold-bright transition-colors">{t.name}</h4>
      <p className="mt-3 text-[13px] font-medium leading-relaxed text-white/50 line-clamp-3 flex-1">{t.description}</p>
      
      <div className="mt-6 pt-5 border-t border-white/10">
        <Link to="/trainings/$slug" params={{ slug: t.slug }} className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-gold hover:text-dark-luxe">
          বিস্তারিত জানুন <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
