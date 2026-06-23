import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { trainings, notices as staticNotices, events as staticEvents, stats, siteInfo } from "@/lib/data";
import heroImg from "@/assets/hero.jpg";
import { HeroVisual } from "@/components/HeroVisual";
import { WhyBefaqVisual } from "@/components/WhyBefaqVisual";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, GraduationCap, MapPin, Users, ScrollText, Languages, Feather, Sparkles, Clock, Bell, Megaphone, FileText, ChevronRight, Quote, ShieldCheck, Award, Network, BadgeCheck, Compass } from "lucide-react";
import kitabImg from "@/assets/kitab-stack.jpg";

import mosqueArchImg from "@/assets/mosque-arch.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বেফাক প্রশিক্ষণ শাখা — হোম" },
      { name: "description", content: "কওমী মাদ্রাসা শিক্ষকদের জন্য জাতীয় প্রশিক্ষণ — অনলাইন ভর্তি, রেজাল্ট ও নোটিশ এক প্ল্যাটফর্মে।" },
      { property: "og:title", content: "বেফাক প্রশিক্ষণ শাখা" },
      { property: "og:description", content: "আল্লাহর পথে শেখাও — সেরা শিক্ষক তৈরি করি আমরা।" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function Home() {
  const { data: dbNotices } = useQuery({
    queryKey: ["public-notices-home"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notices")
        .select("id, title, body, category, published_at")
        .eq("status", "published")
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      const catMap: Record<string, string> = { general: "ঘোষণা", urgent: "জরুরি", admission: "ভর্তি" };
      return (data as any[]).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body || "",
        category: catMap[n.category] ?? "ঘোষণা",
        date: n.published_at
          ? new Date(n.published_at).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" })
          : "",
      }));
    },
  });

  const { data: dbEvents } = useQuery({
    queryKey: ["public-events-home"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id, title, location, slug, date")
        .eq("status", "upcoming")
        .order("date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return (data as any[]).map((e) => ({
        id: e.id,
        slug: e.slug || e.id,
        title: e.title,
        venue: e.location || "",
        type: "ইভেন্ট",
        date: e.date
          ? new Date(e.date).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" })
          : "শীঘ্রই",
      }));
    },
  });

  const notices = (dbNotices && dbNotices.length > 0) ? dbNotices : staticNotices.slice(0, 5);
  const events = (dbEvents && dbEvents.length > 0) ? dbEvents : staticEvents.slice(0, 4);

  const featured = trainings.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — scholarly archival elegance */}
      <section className="relative overflow-hidden bg-hero-luxe">
        <SiteHeader overlay />

        {/* Soft luminosity photo */}
        <img
          src={heroImg}
          alt=""
          width={1600}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-[0.08] opacity-10"
        />

        {/* Islamic star pattern overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l2.5 7.5L40 10l-7.5 2.5L30 20l-2.5-7.5L20 10l7.5-2.5L30 0zm0 40l2.5 7.5L40 50l-7.5 2.5L30 60l-2.5-7.5L20 50l7.5-2.5L30 40zM10 20l2.5 7.5L20 30l-7.5 2.5L10 40l-2.5-7.5L0 30l7.5-2.5L10 20zm40 0l2.5 7.5L60 30l-7.5 2.5L50 40l-2.5-7.5L40 30l7.5-2.5L50 20z' fill='%23D4AF37' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Top light source */}
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-2xl pointer-events-none" />

        {/* Hairlines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* Corner ornaments */}
        <div aria-hidden className="pointer-events-none absolute top-28 left-6 hidden h-24 w-24 rounded-tl-3xl border-l border-t border-gold/30 md:block" />
        <div aria-hidden className="pointer-events-none absolute bottom-10 right-6 hidden h-24 w-24 rounded-br-3xl border-r border-b border-gold/30 md:block" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-24 pb-10 sm:px-6 sm:pt-28 md:pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-16">
          {/* LEFT — content */}
          <div className="lg:col-span-7">
            {/* Authority label */}
            <div className="mb-7 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-gold/40" />
              <span className="rounded-full border border-gold/30 bg-gold/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ
              </span>
            </div>

            {/* Ornament divider */}
            <div className="mt-2 flex items-center gap-3 text-gold/60">
              <span className="h-px w-12 bg-gradient-to-r from-gold/50 to-transparent" />
              <span className="text-base leading-none">۞</span>
              <span className="h-px w-24 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-2xl text-balance text-3xl font-bold leading-[1.25] text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.3] sm:leading-[1.18]">
              ইলম, ইখলাস ও উৎকর্ষ —{" "}
              <span className="text-gold-shimmer">শিক্ষক গড়ার</span> জাতীয় প্ল্যাটফর্ম
            </h1>

            {/* Sub */}
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              কওমী শিক্ষাব্যবস্থার গুণগত উৎকর্ষে বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ পরিচালিত
              কেন্দ্রীয় প্রশিক্ষণ, পরীক্ষা ও সনদায়ন ব্যবস্থা।
            </p>


            {/* CTAs */}
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                to="/admission"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-sm font-semibold text-gold-foreground shadow-elegant transition hover:brightness-110"
              >
                অনলাইনে আবেদন করুন
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/trainings"
                className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white backdrop-blur transition hover:border-gold/60 hover:bg-white/[0.10]"
              >
                প্রশিক্ষণ তালিকা দেখুন
              </Link>
            </div>

            {/* Stat strip */}
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: Users, label: "প্রশিক্ষণার্থী", value: stats.trainees },
                { icon: MapPin, label: "কেন্দ্র", value: stats.centers },
                { icon: GraduationCap, label: "জেলা", value: stats.districts },
                { icon: Calendar, label: "ব্যাচ", value: stats.batches },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gold/15 bg-white/[0.04] px-2 py-3 text-center backdrop-blur-md transition hover:border-gold/35 hover:bg-white/[0.07] sm:px-3 sm:py-4"
                >
                  <Icon className="mx-auto mb-1 text-gold/80" size={16} />
                  <div className="text-lg font-extrabold text-gold-shimmer sm:text-2xl">{value}</div>
                  <div className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-white/60 sm:text-[10px]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — live 3D Quranic visual */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm sm:max-w-md lg:max-w-none">
              {/* Gold frame offset */}
              <div aria-hidden className="absolute -inset-2 rounded-[1.5rem] border border-gold/30 sm:-inset-3 sm:rounded-[2rem]" />
              <div aria-hidden className="absolute -bottom-5 -right-5 hidden h-24 w-24 rounded-br-[2rem] border-b-2 border-r-2 border-gold/60 md:block lg:h-32 lg:w-32" />
              <div aria-hidden className="absolute -top-5 -left-5 hidden h-24 w-24 rounded-tl-[2rem] border-t-2 border-l-2 border-gold/60 md:block lg:h-32 lg:w-32" />

              {/* 3D canvas */}
              <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-gold/20">
                <HeroVisual />

                {/* Top vignette */}
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-dark/40 via-transparent to-primary-dark/70" />

                {/* Floating hadith badge */}
                <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-gold/30 bg-primary-dark/75 px-5 py-4 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
                  <div className="mb-2 flex items-center justify-center gap-3">
                    <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/50" />
                    <span className="text-gold/70 text-sm leading-none">۞</span>
                    <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/50" />
                  </div>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-center text-[1.65rem] leading-[2.2] text-gold-shimmer sm:text-[1.85rem]"
                    style={{
                      fontFamily: '"Scheherazade New", "Noto Naskh Arabic", "Amiri Quran", serif',
                      fontFeatureSettings: '"liga", "calt", "kern", "ccmp"',
                    }}
                  >
                    خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
                  </p>
                  <p className="mt-2 text-center text-[12px] leading-relaxed text-white/75">
                    “তোমাদের মধ্যে শ্রেষ্ঠ সেই, যে কুরআন শেখে ও শেখায়।”
                  </p>
                  <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-gold/60">
                    — সহীহ বুখারী
                  </p>
                </div>


                {/* Live indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-gold/30 bg-primary-dark/60 px-3 py-1 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">Live 3D</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About — editorial magazine spread with kitab imagery */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(42_45%_97%)] to-[hsl(42_40%_95%)]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div aria-hidden className="absolute -top-32 right-0 h-[400px] w-[600px] rounded-full bg-gold/[0.07] blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:pt-16 lg:pb-10">
          {/* Premium editorial spread — text left, framed kitab right */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
            {/* Left content column */}
            <div className="space-y-10 lg:col-span-7">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-gold" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">পরিচিতি</span>
                </div>

                <h2 className="text-balance text-3xl font-bold leading-[1.25] text-primary-dark sm:text-4xl lg:text-5xl">
                  ১৯৭৮ সাল থেকে কওমী শিক্ষার{" "}
                  <span className="text-gold">মান-উৎকর্ষের অভিভাবক</span>
                </h2>

                <p className="max-w-2xl text-lg font-light leading-relaxed text-foreground/75">
                  <strong className="font-semibold text-primary-dark">বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ</strong> —
                  দেশের ছয়টি কওমী মাদ্রাসা শিক্ষাবোর্ডের মধ্যে বৃহত্তম। ২০,০০০+ অধিভুক্ত মাদ্রাসার পাঠ্যসূচি প্রণয়ন,
                  স্তরভিত্তিক পরীক্ষা গ্রহণ ও সনদ প্রদানে আলেম-উলামার যৌথ ঐকমত্যে পরিচালিত।
                </p>

                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 rounded-sm border border-primary-dark/80 bg-primary-dark px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark/90"
                >
                  বিস্তারিত পরিচিতি
                  <ArrowLeft size={15} className="rotate-180 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Key facts — borderless minimalist row */}
              <dl className="grid grid-cols-2 gap-4 border-y border-gold/20 py-6 sm:grid-cols-4 sm:gap-8 sm:py-8">
                {[
                  { k: "প্রতিষ্ঠা", v: "এপ্রিল ১৯৭৮" },
                  { k: "মাদ্রাসা", v: "২০,০০০+" },
                  { k: "কার্যালয়", v: "যাত্রাবাড়ী, ঢাকা" },
                  { k: "শাখা", v: "৬৪ জেলা" },
                ].map(({ k, v }) => (
                  <div key={k} className="space-y-1">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{k}</dt>
                    <dd className="text-lg font-semibold text-primary-dark">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* Leadership — colophon row */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">পরিচালনা পর্ষদ</p>
                <div className="flex flex-wrap items-stretch gap-x-8 gap-y-4">
                  {[
                    ["মাওলানা মাহমুদুল হাসান", "সভাপতি"],
                    ["মাওলানা মাহফুজুল হক", "মহাসচিব"],
                    ["মাওলানা উবায়দুর রহমান খান", "মহাপরিচালক"],
                  ].map(([name, role], i, arr) => (
                    <div key={role} className="flex items-stretch gap-8">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-primary-dark">{name}</span>
                        <span className="text-xs text-foreground/60">{role}</span>
                      </div>
                      {i < arr.length - 1 && <div className="hidden w-px bg-gold/20 sm:block" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right image column — framed editorial plate */}
            <div className="relative lg:col-span-5">
              <div className="relative z-10 rounded-sm bg-white p-2 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.35)]">
                <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                  <img
                    src={kitabImg}
                    alt="ক্লাসিক্যাল ইসলামী কিতাবাদি, রেহাল ও কালামদানি"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              {/* Corner gold brackets — hidden on mobile to prevent overflow */}
              <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 border-r-2 border-t-2 border-gold/40 sm:-right-6 sm:-top-6 sm:h-32 sm:w-32" />
              <div aria-hidden className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 border-b-2 border-l-2 border-gold/40 sm:-bottom-6 sm:-left-6 sm:h-32 sm:w-32" />
              {/* Floating quote chip */}
              <div className="absolute -bottom-8 right-8 z-20 bg-primary-dark px-6 py-4 text-primary-foreground shadow-xl">
                <p className="flex items-center gap-2 text-sm italic">
                  <Feather size={14} className="text-gold" />
                  <span>“ইলম ও আমলের সমন্বয়ে আদর্শ শিক্ষক”</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tadrib wing — dark editorial strip */}
          <div className="relative mt-12 overflow-hidden rounded-sm border border-gold/30 bg-dark-luxe p-6 shadow-[0_25px_70px_-25px_rgba(0,0,0,0.6)] sm:p-8 lg:p-10 text-primary-foreground">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
            <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-sm border border-gold/10" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left — copy + 3D minimal counters */}
              <div className="lg:col-span-5">
                <h3 className="text-balance text-3xl font-bold leading-[1.4] text-white sm:text-[2.1rem] lg:text-[2.35rem]">
                  শিক্ষক-পেশাদারিত্ব উন্নয়নের{" "}
                  <span className="text-gold-shimmer">কেন্দ্রীয় কার্যক্রম</span>
                </h3>
                <p className="mt-5 text-[1.05rem] leading-[1.85] text-white/80">
                  তিনটি স্তরে পরিচালিত ১১টি কোর্স — ৩ থেকে ৪০ দিনের মেয়াদে।
                  শাবান-রমজানে বিশেষ আবাসিক ব্যাচ পরিচালিত হয়। ঢাকা কেন্দ্রীয়
                  সেন্টারসহ দেশের ৬৪ জেলায় আঞ্চলিক ব্যাচ চলমান, যা শিক্ষকদের
                  পেশাগত মান উন্নয়নে দীর্ঘমেয়াদি প্রভাব রাখছে।
                </p>

                {/* 3D minimal counters */}
                <dl className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { v: "১১", k: "কোর্স" },
                    { v: "০৩", k: "স্তর" },
                    { v: "৬৪", k: "জেলা" },
                  ].map(({ v, k }) => (
                    <div
                      key={k}
                      className="group relative rounded-lg border border-gold/25 bg-gradient-to-b from-white/[0.04] to-transparent px-3 py-4 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.18),0_8px_24px_-12px_rgba(0,0,0,0.7)] transition hover:border-gold/50 hover:-translate-y-0.5"
                    >
                      <span aria-hidden className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                      <dd className="text-3xl font-extrabold leading-none text-gold-shimmer drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)]">{v}</dd>
                      <dt className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{k}</dt>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Right — stream cards (responsive grid) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7 lg:gap-4">
                {[
                  { n: "০১", slug: "hifz-tajweed", icon: BookOpen, t: "হিফজ ও তাজবীদ", s: "তাজবীদ • কিরাত • হিফজ", p: "কোরআন মুখস্থকরণ, শুদ্ধ তাজবীদ ও বিভিন্ন কিরাতে দক্ষতা গঠনে আধুনিক পদ্ধতিভিত্তিক নিবিড় প্রশিক্ষণ।" },
                  { n: "০২", slug: "noorani", icon: ScrollText, t: "নূরানী", s: "প্রাথমিক • উচ্চারণ", p: "শিশুদের প্রাথমিক কোরআন শিক্ষায় শুদ্ধ উচ্চারণ, মাখরাজ ও ধারাবাহিক পাঠদানের কার্যকর কৌশল।" },
                  { n: "০৩", slug: "darsiyat", icon: GraduationCap, t: "দরসিয়াত", s: "ফিকহ • হাদিস • আকীদা", p: "ফিকহ, হাদিস ও আকীদাসহ মৌলিক দ্বীনি বিষয়সমূহ পাঠদানের আধুনিক, কার্যকর ও পরীক্ষিত শিক্ষাপদ্ধতি।" },
                  { n: "০৪", slug: "language-literature", icon: Languages, t: "ভাষা ও সাহিত্য", s: "আরবি • উর্দু • বাংলা", p: "ত্রিভাষিক দক্ষতা — পাঠ, অনুবাদ ও রচনায় ধারাবাহিক চর্চার মাধ্যমে শিক্ষকদের পেশাগত মান উন্নয়ন।" },
                ].map(({ n, slug, icon: Icon, t, s, p }) => (
                  <Link
                    key={t}
                    to="/trainings/$slug"
                    params={{ slug }}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-gold/30 bg-primary-dark/75 p-4 backdrop-blur-md shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-primary-dark/85 sm:p-5"
                  >
                    <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />
                    <span className="absolute right-4 top-4 rounded-full border border-gold/30 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-gold/80">{n}</span>
                    <div className="relative flex items-center gap-3 pr-10">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/[0.08] text-gold transition group-hover:bg-gold/[0.16]">
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-base font-bold leading-tight text-white truncate">{t}</h4>
                        <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-gold/70 truncate">{s}</p>
                      </div>
                    </div>
                    <p className="relative mt-4 flex-1 text-[13.5px] leading-[1.85] text-white/80">{p}</p>
                    <span className="relative mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/40 bg-gold/[0.06] px-3 py-1.5 text-[11px] font-semibold text-gold transition group-hover:border-gold/70 group-hover:bg-gold/[0.14]">
                      বিস্তারিত দেখুন
                      <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured trainings — dark editorial */}
      <section className="relative overflow-hidden bg-hero-luxe py-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-islamic-pattern opacity-[0.05] opacity-5" />
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />


        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                চলমান প্রশিক্ষণ
              </div>
              <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.4] text-white sm:text-[2.1rem] lg:text-[2.35rem]">
                আবেদন গ্রহণ চলছে —{" "}
                <span className="text-gold-shimmer">নির্বাচন করুন আপনার প্রশিক্ষণ</span>
              </h2>
              <p className="mt-4 text-[1.02rem] leading-[1.85] text-white/70">
                কেন্দ্রীয় ও আঞ্চলিক ব্যাচসমূহে আবেদন গ্রহণ চলছে। আপনার পছন্দের কোর্স বেছে নিয়ে আজই আবেদন সম্পন্ন করুন।
              </p>
            </div>
            <Link
              to="/trainings"
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-gold/40 bg-gold/[0.06] px-5 py-2.5 text-sm font-semibold text-gold transition hover:border-gold/70 hover:bg-gold/[0.14] sm:self-end"
            >
              সব দেখুন
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t, idx) => (
              <Link
                key={t.id}
                to="/trainings/$slug"
                params={{ slug: t.slug }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-primary-dark/75 p-6 backdrop-blur-md shadow-[0_18px_50px_-18px_rgba(0,0,0,0.75)] transition hover:-translate-y-1 hover:border-gold/60 hover:bg-primary-dark/90 hover:shadow-[0_28px_70px_-20px_rgba(0,0,0,0.85)]"
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
                <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/25" />
                <span aria-hidden className="pointer-events-none absolute right-5 top-5 text-[3.25rem] font-extrabold leading-none text-white/[0.04] tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      t.type === "central"
                        ? "border-gold/50 bg-gold/[0.12] text-gold"
                        : "border-white/25 bg-white/[0.06] text-white/80"
                    }`}
                  >
                    {t.typeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/55">
                    <Calendar size={12} className="text-gold/70" />
                    {t.duration}
                  </span>
                </div>

                <h3 className="relative mt-5 text-[1.15rem] font-bold leading-snug text-white transition group-hover:text-gold-shimmer">
                  {t.name}
                </h3>
                <p className="relative mt-2 line-clamp-2 text-[13.5px] leading-[1.75] text-white/65">
                  {t.description}
                </p>

                <div className="relative mt-5 flex items-center gap-1.5 text-[12px] text-white/55">
                  <MapPin size={13} className="text-gold/70" />
                  <span className="line-clamp-1">{t.location}</span>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-gold/15 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gold">
                    বিস্তারিত দেখুন
                    <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    আবেদন চলছে
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Events — editorial magazine layout */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(42_45%_97%)] via-background to-[hsl(42_40%_95%)] py-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gold/[0.08] blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary/[0.06] blur-2xl" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                <Sparkles size={12} />
                ইভেন্ট ও আয়োজন
              </div>
              <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.4] text-primary-dark sm:text-[2.1rem] lg:text-[2.35rem]">
                চলমান ও আসন্ন{" "}
                <span className="text-gold">ইভেন্টসমূহ</span>
              </h2>
              <p className="mt-4 text-[1.02rem] leading-[1.85] text-foreground/70">
                কেন্দ্রীয় উদ্বোধন, সমাপনী অনুষ্ঠান, কর্মশালা ও সেমিনারসহ সকল আয়োজনের সর্বশেষ তথ্য।
              </p>
            </div>
            <Link
              to="/events"
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary-dark/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-primary-dark hover:bg-primary-dark hover:text-primary-foreground sm:self-end"
            >
              সব ইভেন্ট
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Featured (dark, large) + Latest (light, smaller) */}
          <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
            <article className="group relative overflow-hidden rounded-3xl bg-dark-luxe text-primary-foreground p-8 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)] sm:p-10 lg:col-span-3">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
              <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-gold/15" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.22em] text-gold-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-foreground/60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-foreground" />
                    </span>
                    চলমান / আসন্ন
                  </span>
                  <span className="rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold">
                    {events[0].type}
                  </span>
                </div>

                <h3 className="mt-6 text-balance text-2xl font-bold leading-[1.25] text-white sm:text-3xl lg:text-[2rem]">
                  {events[0].title}
                </h3>

                <p className="mt-4 max-w-xl text-[1rem] leading-[1.85] text-white/75">
                  কেন্দ্রীয় প্রশিক্ষণার্থীদের সমাবেশে উপস্থিত থাকবেন বেফাকের শীর্ষস্থানীয় উলামায়ে কেরাম। বিস্তারিত সূচি ও আসন বুকিংয়ের তথ্য ইভেন্ট পেজে।
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Calendar, label: "তারিখ", value: events[0].date },
                    { icon: MapPin, label: "স্থান", value: events[0].venue },
                    { icon: Clock, label: "সময়", value: "সকাল ৯টা" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-gold/20 bg-white/[0.04] p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
                        <Icon size={12} />
                        {label}
                      </div>
                      <div className="mt-1.5 text-[13.5px] font-semibold leading-snug text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/events/$id"
                    params={{ id: events[0]?.slug || events[0]?.id || "unknown" }}
                    className="group/btn inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-elegant transition hover:brightness-110"
                  >
                    বিস্তারিত দেখুন
                    <ArrowRight size={14} className="transition group-hover/btn:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold/70 hover:bg-white/[0.10]"
                  >
                    ক্যালেন্ডারে যোগ করুন
                  </Link>
                </div>
              </div>
            </article>

            <Link
              to="/events/$id"
              params={{ id: events[1]?.slug || events[1]?.id || "unknown" }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-[0_18px_50px_-25px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_28px_60px_-25px_rgba(0,0,0,0.35)] lg:col-span-2"
            >
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/20" />

              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-dark/15 bg-primary-soft/40 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-primary-dark">
                  <Sparkles size={11} className="text-gold" />
                  সর্বশেষ ইভেন্ট
                </span>
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-foreground">
                  {events[1].type}
                </span>
              </div>

              <h3 className="relative mt-6 text-[1.3rem] font-bold leading-snug text-primary-dark transition group-hover:text-gold">
                {events[1].title}
              </h3>

              <p className="relative mt-3 text-[13.5px] leading-[1.8] text-muted-foreground">
                আঞ্চলিক সমন্বয়কারীদের অংশগ্রহণে আয়োজিত একদিনের পেশাগত কর্মশালা — মাঠপর্যায়ের অগ্রগতি ও পরিকল্পনা।
              </p>

              <div className="relative mt-auto space-y-2.5 pt-6 text-[13px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gold" />
                  <span className="font-medium text-primary-dark">{events[1].date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold" />
                  <span>{events[1].venue}</span>
                </div>
              </div>

              <div className="relative mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[12.5px] font-semibold text-primary-dark">বিস্তারিত পড়ুন</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-gold-foreground">
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </div>

          {/* Previous events — slim stream cards */}
          <div className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-foreground/55">পূর্ববর্তী ইভেন্টসমূহ</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: events[2].title, date: events[2].date, venue: events[2].venue, type: events[2].type },
                { title: "শিক্ষাবর্ষ সমাপনী মাহফিল ১৪৪৫", date: "১২ এপ্রিল ২০২৫", venue: "যাত্রাবাড়ী, ঢাকা", type: "সমাপনী" },
                { title: "ইমামত ও খিতাবত কর্মশালা", date: "২৮ মার্চ ২০২৫", venue: "চট্টগ্রাম", type: "কর্মশালা" },
              ].map((e, i) => {
                const parts = e.date.split(" ");
                return (
                  <Link
                    key={i}
                    to="/events/$id"
                    params={{ id: (e as any).slug || (e as any).id || "unknown" }}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.25)]"
                  >
                    <div className="grid shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/[0.08] px-3 py-2 text-center transition group-hover:border-gold/50 group-hover:bg-gold/15">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold/80">
                        {parts[1] ?? "—"}
                      </span>
                      <span className="text-xl font-extrabold leading-none text-primary-dark">
                        {parts[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{e.type}</span>
                      <h4 className="mt-0.5 truncate text-[14px] font-bold text-primary-dark transition group-hover:text-gold">
                        {e.title}
                      </h4>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-muted-foreground">
                        <MapPin size={11} className="text-gold/70" />
                        {e.venue}
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-gold" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Notices — editorial bulletin */}
      <section className="relative overflow-hidden bg-[hsl(42_40%_96%)] py-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-gold/[0.07] blur-2xl" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                <Megaphone size={12} />
                সাম্প্রতিক
              </div>
              <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.4] text-primary-dark sm:text-[2.1rem] lg:text-[2.35rem]">
                নোটিশ ও{" "}
                <span className="text-gold">ঘোষণা</span>
              </h2>
              <p className="mt-4 text-[1.02rem] leading-[1.85] text-foreground/70">
                ভর্তি বিজ্ঞপ্তি, রেজাল্ট, সময়সূচি ও সাধারণ ঘোষণাসমূহ এক জায়গায়।
              </p>
            </div>
            <Link
              to="/notices"
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary-dark/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-primary-dark hover:bg-primary-dark hover:text-primary-foreground sm:self-end"
            >
              সব নোটিশ
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Pinned latest — dark accent */}
            <Link
              to="/notices"
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-dark-luxe text-primary-foreground p-8 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.5)] transition hover:-translate-y-1 lg:col-span-2"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
              <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-gold/15" />

              <div className="relative z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.22em] text-gold-foreground">
                  <Bell size={11} />
                  পিন করা
                </span>
                <span className="rounded-full border border-gold/40 bg-gold/[0.1] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  {notices[0].category}
                </span>
              </div>

              <h3 className="relative mt-5 text-[1.35rem] font-bold leading-snug text-white transition group-hover:text-gold-shimmer">
                {notices[0].title}
              </h3>
              <p className="relative mt-3 text-[13.5px] leading-[1.85] text-white/75">
                {notices[0].body}
              </p>

              <div className="relative mt-auto flex items-center justify-between border-t border-gold/20 pt-5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/60">
                  <Calendar size={12} className="text-gold" />
                  {notices[0].date}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gold">
                  বিস্তারিত
                  <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Notice rows */}
            <div className="grid gap-3 lg:col-span-3">
              {notices.slice(1, 4).map((n) => (
                <Link
                  key={n.id}
                  to="/notices"
                  className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_45px_-22px_rgba(0,0,0,0.28)]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold transition group-hover:bg-gold group-hover:text-gold-foreground">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded bg-primary-soft/50 px-2 py-0.5 font-bold uppercase tracking-wider text-primary-dark">
                        {n.category}
                      </span>
                      <span className="text-muted-foreground">{n.date}</span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug text-primary-dark transition group-hover:text-gold">
                      {n.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                      {n.body}
                    </p>
                  </div>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-foreground/40 transition group-hover:translate-x-1 group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Befaq — premium dark editorial */}
      <section className="relative overflow-hidden border-y border-border bg-dark-luxe text-primary-foreground py-14 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Two-column layout: 3D visual + feature list */}
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left — Live 3D Mushaf */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative">
                <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-gold/20 via-transparent to-gold/10 blur-2xl" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-gold/30 bg-[#04160f] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-gold/15">
                  <WhyBefaqVisual />
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04160f]/70 via-transparent to-transparent" />
                  <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold/80">
                      <span className="h-px w-6 bg-gold/50" />
                      ঐতিহ্য ও উৎকর্ষ
                    </div>
                    <p className="mt-2 text-[15px] leading-[1.7] text-white/85">
                      কিতাবি ঐতিহ্যের আলোয় গড়ে ওঠা প্রশিক্ষণ — মান, মেধা ও মাকামে অগ্রণী।
                    </p>
                  </div>
                </div>

                <span aria-hidden className="pointer-events-none absolute -left-2 -top-2 h-6 w-6 border-l-2 border-t-2 border-gold/60" />
                <span aria-hidden className="pointer-events-none absolute -right-2 -bottom-2 h-6 w-6 border-r-2 border-b-2 border-gold/60" />
              </div>
            </div>

            {/* Right — Header + feature list */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-10 bg-gold/40" />
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                  <Award size={12} />
                  কেন বেফাক
                </span>
              </div>
              <h2 className="mt-6 text-balance text-3xl font-bold leading-[1.4] text-white sm:text-[2.1rem] lg:text-[2.4rem]">
                প্রশিক্ষণে কেন বেছে নিবেন{" "}
                <span className="text-gold-shimmer">বেফাককে?</span>
              </h2>
              <p className="mt-5 max-w-xl text-[1rem] leading-[1.9] text-white/70">
                চার দশকের অভিজ্ঞতা, দেশের শীর্ষস্থানীয় উলামায়ে কেরামের তত্ত্বাবধান, এবং
                ধারাবাহিক মান-উৎকর্ষের ঐতিহ্য — যা বেফাকের প্রশিক্ষণকে করেছে স্বতন্ত্র।
              </p>

              <ul className="mt-8 divide-y divide-gold/15 border-y border-gold/15">
                {[
                  { icon: ShieldCheck, title: "৪৭+ বছরের আস্থা", desc: "১৯৭৮ সাল থেকে কওমী শিক্ষাব্যবস্থার মান-উৎকর্ষের অভিভাবক।" },
                  { icon: Users, title: "শীর্ষস্থানীয় উলামাবৃন্দ", desc: "প্রশিক্ষক হিসেবে যুক্ত দেশের অগ্রগণ্য মুহাক্কিক ও মুদাররিসগণ।" },
                  { icon: BadgeCheck, title: "স্বীকৃত সনদ", desc: "বেফাক-অনুমোদিত সনদ — ২০,০০০+ মাদ্রাসায় গৃহীত ও মূল্যায়িত।" },
                  { icon: Network, title: "৬৪ জেলায় কেন্দ্র", desc: "কেন্দ্রীয় ও আঞ্চলিক উভয় স্তরে — নিকটস্থ কেন্দ্রেই সুযোগ।" },
                  { icon: BookOpen, title: "আধুনিক পাঠপদ্ধতি", desc: "ঐতিহ্যবাহী কিতাবি ধারার সাথে আধুনিক শিক্ষাবিজ্ঞানের সমন্বয়।" },
                  { icon: Compass, title: "নামমাত্র ব্যয়ে", desc: "অধিকাংশ আঞ্চলিক প্রশিক্ষণ বিনামূল্যে — কেন্দ্রীয়গুলোও সাশ্রয়ী।" },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <li
                    key={title}
                    className="group relative grid grid-cols-[auto_1fr] items-start gap-5 py-5 transition"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold tracking-[0.2em] text-gold/60 tabular-nums">
                        ০{i + 1}
                      </span>
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/[0.08] text-gold transition group-hover:border-gold/55 group-hover:bg-gold/[0.16]">
                        <Icon size={19} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[1.05rem] font-bold leading-snug text-white transition group-hover:text-gold-shimmer">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-[13.5px] leading-[1.8] text-white/65">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { to: "/admission", icon: BookOpen, title: "অনলাইন ভর্তি", desc: "সহজ ৩-ধাপের ফরমে আবেদন করুন এবং SMS-এ নিশ্চিতকরণ পান।" },
            { to: "/results", icon: GraduationCap, title: "রেজাল্ট অনুসন্ধান", desc: "রোল নম্বর দিয়ে রেজাল্ট ও ডিজিটাল সার্টিফিকেট পান।" },
            { to: "/centers", icon: MapPin, title: "কেন্দ্র ডিরেক্টরি", desc: "আপনার নিকটস্থ আঞ্চলিক প্রশিক্ষণ কেন্দ্র খুঁজে নিন।" },
          ].map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} target={to === "/admission" ? "_blank" : undefined} rel={to === "/admission" ? "noopener noreferrer" : undefined} className="group rounded-xl border border-border bg-gradient-to-br from-card to-primary-soft/40 p-6 transition hover:border-primary">
              <Icon className="mb-4 text-primary" size={30} />
              <h3 className="text-lg font-bold text-primary-dark">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                এগিয়ে যান <ArrowLeft size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact — two-card editorial */}
      <section className="relative overflow-hidden bg-background py-12 sm:py-14 lg:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-islamic-pattern opacity-[0.03]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
              <Sparkles size={12} />
              যোগাযোগ
            </div>
            <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.4] text-primary-dark sm:text-[2.1rem]">
              আমাদের সাথে <span className="text-gold-shimmer">যোগাযোগ করুন</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              প্রশিক্ষণ, ভর্তি কিংবা যেকোনো জিজ্ঞাসায় — সরাসরি আমাদের জানান।
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-7">
            {/* DARK CARD — info */}
            <div className="relative overflow-hidden rounded-3xl bg-dark-luxe text-primary-foreground p-7 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)] sm:p-9">
              <img
                src={mosqueArchImg}
                alt=""
                width={1024}
                height={1024}
                loading="lazy"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary-dark/85 to-primary-dark/95" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
              <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <div aria-hidden className="pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-tr-2xl border-r border-t border-gold/30" />
              <div aria-hidden className="pointer-events-none absolute bottom-4 left-4 h-16 w-16 rounded-bl-2xl border-b border-l border-gold/30" />
              <div aria-hidden className="pointer-events-none absolute right-6 bottom-4 select-none text-[10rem] leading-none text-gold/[0.05]">۞</div>

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-gold" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">যোগাযোগের তথ্য</span>
                </div>
                <h3 className="mt-3 text-balance text-2xl font-bold leading-[1.25] text-white sm:text-[1.75rem]">
                  সরাসরি আমাদের সাথে কথা বলুন
                </h3>

                <a
                  href={`tel:${siteInfo.phone}`}
                  className="group mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/[0.12] via-gold/[0.06] to-transparent p-4 transition hover:border-gold/70 hover:from-gold/[0.18]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground shadow-elegant transition group-hover:scale-105">
                    <Bell size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/80">জরুরি হেল্পলাইন</div>
                    <div className="mt-0.5 text-[1.15rem] font-extrabold leading-none text-gold-shimmer">{siteInfo.phone}</div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-gold transition group-hover:translate-x-1" />
                </a>

                <ul className="mt-5 space-y-3">
                  {[
                    { icon: MapPin, label: "কেন্দ্রীয় কার্যালয়", value: siteInfo.address },
                    { icon: FileText, label: "ইমেইল", value: siteInfo.email },
                    { icon: Clock, label: "অফিস সময়", value: "শনি – বৃহস্পতি, সকাল ৯টা — বিকাল ৫টা" },
                  ].map(({ icon: Icon, label, value }) => (
                    <li key={label} className="group flex items-start gap-3 rounded-xl border border-gold/15 bg-white/[0.04] p-3.5 backdrop-blur-md transition hover:border-gold/40 hover:bg-white/[0.07]">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/[0.10] text-gold transition group-hover:bg-gold/[0.18]">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/80">{label}</div>
                        <div className="mt-1 text-[13.5px] font-medium leading-snug text-white">{value}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { v: "২৪ ঘ.", k: "রেসপন্স" },
                    { v: "৯৮%", k: "সমাধান" },
                    { v: "৬৪", k: "জেলা" },
                  ].map(({ v, k }) => (
                    <div key={k} className="rounded-xl border border-gold/20 bg-white/[0.04] px-2 py-2.5 text-center backdrop-blur-md">
                      <div className="text-base font-extrabold leading-none text-gold-shimmer">{v}</div>
                      <div className="mt-1 text-[9.5px] font-medium uppercase tracking-widest text-white/55">{k}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-gold/80">অনুসরণ করুন</span>
                  <span className="h-px flex-1 bg-gold/20" />
                  <a
                    href={siteInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-3.5 py-1.5 text-[12px] font-semibold text-gold transition hover:border-gold/60 hover:bg-gold/[0.14]"
                  >
                    Facebook
                    <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* LIGHT CARD — form */}
            <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-white p-7 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.18)] sm:p-9">
              <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gold/10 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-primary/[0.06] blur-3xl" />

              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-10 bg-gold" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">বার্তা পাঠান</span>
                  </div>
                  <h3 className="mt-3 text-balance text-2xl font-bold leading-[1.25] text-primary-dark sm:text-[1.75rem]">
                    আপনার প্রশ্ন বা মতামত জানান
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    নিচের ফর্মটি পূরণ করুন — কর্মদিবসের মধ্যে যোগাযোগ করব ইনশাআল্লাহ্‌।
                  </p>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/[0.10] text-gold">
                    <FileText size={20} />
                  </div>
                </div>
              </div>

              <form className="relative mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">
                      পূর্ণ নাম <span className="text-gold">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Users size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/70" />
                      <input
                        type="text"
                        required
                        placeholder="যেমন: আব্দুল্লাহ"
                        className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-3 text-[14px] text-primary-dark placeholder:text-muted-foreground/60 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">
                      মোবাইল <span className="text-gold">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Bell size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/70" />
                      <input
                        type="tel"
                        required
                        placeholder="০১৭xxxxxxxx"
                        className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-3 text-[14px] text-primary-dark placeholder:text-muted-foreground/60 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">বিষয়</label>
                  <div className="relative mt-1.5">
                    <Compass size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/70" />
                    <select className="w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-10 py-3 text-[14px] text-primary-dark transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30">
                      <option>প্রশিক্ষণ সংক্রান্ত জিজ্ঞাসা</option>
                      <option>ভর্তি / আবেদন</option>
                      <option>আঞ্চলিক কেন্দ্র</option>
                      <option>অন্যান্য</option>
                    </select>
                    <ChevronRight size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-foreground/50" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">
                    বার্তা <span className="text-gold">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="আপনার বার্তা লিখুন..."
                    className="mt-1.5 w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-[14px] text-primary-dark placeholder:text-muted-foreground/60 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <button
                  type="submit"
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-primary-dark px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:bg-primary-dark/90"
                >
                  <span aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                  বার্তা পাঠান
                  <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] leading-relaxed text-muted-foreground">
                  <ShieldCheck size={13} className="text-gold" />
                  <span>আপনার তথ্য সম্পূর্ণ গোপনীয় ও নিরাপদ থাকবে।</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>


      <SiteFooter />
    </div>
  );
}
