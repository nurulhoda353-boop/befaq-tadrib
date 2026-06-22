import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AboutVisual } from "@/components/AboutVisual";
import {
  BookOpenCheck,
  CalendarCheck2,
  GraduationCap,
  Landmark,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — বেফাক প্রশিক্ষণ শাখা" },
      {
        name: "description",
        content:
          "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশের প্রশিক্ষণ শাখার পরিচিতি, মিশন, ইতিহাস ও মূল উদ্দেশ্যসমূহ।",
      },
      { property: "og:title", content: "আমাদের সম্পর্কে — বেফাক প্রশিক্ষণ শাখা" },
      {
        property: "og:description",
        content: "দেশের বৃহত্তম কওমী মাদ্রাসা বোর্ডের প্রশিক্ষণ শাখার পূর্ণাঙ্গ পরিচিতি।",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "১৯৭৮", label: "প্রতিষ্ঠা সাল", icon: Landmark },
  { value: "১৫,০০০+", label: "অধিভুক্ত মাদ্রাসা", icon: Network },
  { value: "৫০+", label: "প্রশিক্ষণ কেন্দ্র", icon: GraduationCap },
  { value: "লক্ষাধিক", label: "প্রশিক্ষণার্থী", icon: Users },
];

const objectives = [
  {
    icon: Sparkles,
    title: "ডিজিটাল উপস্থিতি",
    text: "প্রশিক্ষণ কার্যক্রমের ব্যাপক প্রচার-প্রসার ও আধুনিক ডিজিটাল উপস্থিতি নিশ্চিত করা।",
  },
  {
    icon: BookOpenCheck,
    title: "সহজ ভর্তি প্রক্রিয়া",
    text: "অনলাইন আবেদন, যাচাই ও নিশ্চিতকরণ — সকল ধাপ এক প্ল্যাটফর্মে।",
  },
  {
    icon: ShieldCheck,
    title: "ডিজিটাল সার্টিফিকেট",
    text: "রেজাল্ট ও সার্টিফিকেট স্বচ্ছ, যাচাইযোগ্য ও দ্রুত প্রকাশ করা।",
  },
  {
    icon: CalendarCheck2,
    title: "ইভেন্ট ম্যানেজমেন্ট",
    text: "কেন্দ্রভিত্তিক প্রশিক্ষণ, কর্মশালা ও সম্মেলনের পূর্ণাঙ্গ ব্যবস্থাপনা।",
  },
  {
    icon: Network,
    title: "যোগাযোগের সেতু",
    text: "প্রশিক্ষণার্থী, প্রশিক্ষক ও কেন্দ্রের মধ্যে কার্যকর যোগাযোগ স্থাপন।",
  },
  {
    icon: Target,
    title: "ডেটা ও পরিসংখ্যান",
    text: "জাতীয় বোর্ডের প্রশিক্ষণ কার্যক্রমের পূর্ণাঙ্গ ডেটা সংরক্ষণ ও বিশ্লেষণ।",
  },
];

const timeline = [
  { year: "১৯৭৮", title: "বেফাকের প্রতিষ্ঠা", text: "দেশের কওমী মাদ্রাসা শিক্ষার কেন্দ্রীয় বোর্ড হিসেবে যাত্রা শুরু।" },
  { year: "২০০০", title: "প্রশিক্ষণ শাখার সূচনা", text: "শিক্ষক-শিক্ষিকাদের পেশাদার দক্ষতা উন্নয়নে আনুষ্ঠানিক কার্যক্রম।" },
  { year: "২০১৫", title: "কেন্দ্র সম্প্রসারণ", text: "সারাদেশে আঞ্চলিক প্রশিক্ষণ কেন্দ্রের নেটওয়ার্ক গঠন।" },
  { year: "বর্তমান", title: "ডিজিটাল রূপান্তর", text: "সম্পূর্ণ ইকোসিস্টেম একটি আধুনিক প্ল্যাটফর্মে — অনলাইন ভর্তি থেকে সার্টিফিকেট পর্যন্ত।" },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
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

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center z-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 backdrop-blur">
              <Sparkles size={14} className="text-gold" />
              <span className="text-xs font-medium tracking-wider text-gold">আমাদের পরিচিতি</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-6xl">
              <span className="text-gold-shimmer">ঐতিহ্যের শিকড়ে</span>
              <br />
              <span className="text-white/95">আধুনিকতার ছোঁয়া</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ — দেশের বৃহত্তম কওমী মাদ্রাসা শিক্ষাবোর্ড। প্রশিক্ষণ শাখা
              কওমী শিক্ষাঙ্গনের মান উন্নয়নে নিবেদিত একটি গুরুত্বপূর্ণ বিভাগ।
            </p>
            <p className="mt-4 font-arabic text-2xl text-gold/90">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</p>
          </div>

          {/* 3D visual */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-gold/30 shadow-elegant ring-1 ring-gold/20 lg:aspect-[4/5]">
              <AboutVisual />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
            </div>
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] blur-3xl"
              style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 25%, transparent), transparent 70%)" }}
            />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <s.icon size={24} className="text-gold" />
              <div className="text-2xl font-extrabold text-primary-dark sm:text-3xl">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO + MISSION */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">পরিচিতি</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-primary-dark sm:text-4xl">
              দেশের কওমী শিক্ষার <span className="text-gold-shimmer">কেন্দ্রীয় বোর্ড</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/85">
              বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ ১৯৭৮ সালে প্রতিষ্ঠিত হয়। বর্তমানে সারাদেশে ১৫,০০০+ কওমী মাদ্রাসা
              এই বোর্ডের অধীন। প্রশিক্ষণ শাখা (Tadrib Wing) বোর্ডের অন্যতম গুরুত্বপূর্ণ বিভাগ, যা মাদ্রাসার
              শিক্ষক-শিক্ষিকাদের পেশাদার দক্ষতা উন্নয়নে কাজ করে।
            </p>
            <p className="mt-4 leading-relaxed text-foreground/75">
              আধুনিক শিক্ষাপদ্ধতি, ব্যবস্থাপনা দক্ষতা, ডিজিটাল সাক্ষরতা ও ইসলামী মূল্যবোধের সমন্বয়ে আমরা গড়ে
              তুলছি আগামীর শিক্ষক প্রজন্ম।
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-primary-dark to-primary p-8 text-primary-foreground shadow-elegant">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
              <Target size={28} className="text-gold" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">আমাদের মিশন</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-balance">
                একটি আধুনিক, তথ্যভিত্তিক ও ব্যবহারকারী-বান্ধব ডিজিটাল প্ল্যাটফর্ম তৈরি করা — যা বেফাক প্রশিক্ষণ
                শাখার সম্পূর্ণ ইকোসিস্টেম পরিচালনা করবে এবং দেশের কওমী শিক্ষার মানোন্নয়নে গুরুত্বপূর্ণ ভূমিকা রাখবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="border-y border-border bg-primary-soft/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">কেন আমরা</p>
            <h2 className="mt-3 text-3xl font-bold text-primary-dark sm:text-4xl">মূল উদ্দেশ্যসমূহ</h2>
            <p className="mt-4 text-muted-foreground">
              প্রশিক্ষণ ব্যবস্থার প্রতিটি ধাপ — শুরু থেকে সার্টিফিকেট পর্যন্ত — এক ছাতার নিচে।
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((o) => (
              <div
                key={o.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-elegant"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gold/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/30">
                  <o.icon size={22} className="text-gold-foreground" />
                </div>
                <h3 className="relative mt-5 text-lg font-bold text-primary-dark">{o.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">আমাদের যাত্রা</p>
          <h2 className="mt-3 text-3xl font-bold text-primary-dark sm:text-4xl">সময়ের সাক্ষী</h2>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent sm:left-1/2" />
          <div className="space-y-10">
            {timeline.map((t, i) => (
              <div
                key={t.year}
                className={`relative grid gap-4 sm:grid-cols-2 ${i % 2 === 0 ? "" : "sm:[&>div:first-child]:order-2"}`}
              >
                <div className={`pl-12 sm:pl-0 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                  <div className="inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-foreground">
                    {t.year}
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-primary-dark">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                </div>
                <div className="hidden sm:block" />
                <div className="absolute left-4 top-2 -translate-x-1/2 sm:left-1/2">
                  <div className="h-3 w-3 rounded-full bg-gold ring-4 ring-background" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-dark-luxe p-10 text-center sm:p-16 text-primary-foreground shadow-[0_25px_60px_-25px_rgba(0,0,0,0.5)]">
          <div
            className="absolute inset-0 bg-star-pattern opacity-[0.03] pointer-events-none"
            aria-hidden
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]"
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              আমাদের <span className="text-gold-shimmer">প্রশিক্ষণের অংশ হোন</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">
              দেশের যেকোনো প্রান্ত থেকে বেফাক প্রশিক্ষণ কেন্দ্রের তালিকা দেখুন ও যোগাযোগ করুন।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/trainings"
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-soft transition-transform hover:scale-[1.03]"
              >
                প্রশিক্ষণ তালিকা
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                যোগাযোগ করুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
