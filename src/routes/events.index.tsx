import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight, Calendar, MapPin, Search, Sparkles, Tag, X, Clock } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "ইভেন্ট ক্যালেন্ডার — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "আসন্ন প্রশিক্ষণ, সমাপনী অনুষ্ঠান ও সেমিনারের তালিকা।" },
    ],
  }),
  component: EventsPage,
});

const bn = (n: number | string) =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);

function EventsPage() {
  const [q, setQ] = useState("");

  const { data: activeEvents = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .order("date", { ascending: true });
      if (error) throw error;
      const validEvents = data.filter((e: any) => {
        if (!e.date) return true;
        return new Date(e.date).getTime() >= Date.now();
      });

      return validEvents.map((e: any) => ({
        id: e.id,
        slug: e.slug || e.id,
        title: e.title,
        subtitle: e.subtitle,
        venue: e.location || "স্থান নির্ধারিত নয়",
        type: "ইভেন্ট", // we don't have 'type' column anymore, can just use 'ইভেন্ট'
        date: e.date
          ? new Date(e.date).toLocaleDateString("bn-BD", { day: "2-digit", month: "long", year: "numeric" })
          : "শীঘ্রই",
        time: e.time || (e.date ? new Date(e.date).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) : null),
        hasRegistration: e.has_registration,
        featuredImage: e.featured_image,
      }));
    },
  });

  const filteredEvents = useMemo(
    () =>
      activeEvents.filter((e: any) =>
        q ? (e.title + e.venue + e.subtitle).toLowerCase().includes(q.toLowerCase()) : true,
      ),
    [activeEvents, q],
  );

  const upcoming = activeEvents[0];

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

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              ইভেন্ট ক্যালেন্ডার
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.5] drop-shadow-sm sm:text-4xl sm:text-5xl lg:text-6xl">
              আসন্ন সকল <span className="text-gold-bright">সেমিনার ও কর্মশালা</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              বেফাক প্রশিক্ষণ শাখার সকল আগামী ইভেন্ট, সমাপনী অনুষ্ঠান, এবং কর্মশালার সময়সূচি এখানে দেখুন এবং অংশগ্রহণ নিশ্চিত করুন।
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#feed"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-7 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110"
              >
                সব ইভেন্ট দেখুন
              </a>
            </div>
          </div>

          {/* RIGHT — Floating preview cards */}
          <div className="relative hidden h-[400px] items-center justify-center lg:flex">
            <div className="absolute flex h-64 w-64 -rotate-12 items-center justify-center rounded-full border-2 border-gold/20 bg-primary/30">
              <Calendar size={96} className="text-gold/20" />
            </div>

            {upcoming && (
              <div className="relative z-20 w-full max-w-sm scale-105 rounded-2xl border-2 border-gold/50 bg-primary/80 p-6 shadow-2xl shadow-gold/20 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-bright">
                    <Sparkles size={14} /> পরবর্তী ইভেন্ট
                  </div>
                  {upcoming.hasRegistration && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-emerald-500/50">রেজিস্ট্রেশন চলছে</span>
                  )}
                </div>
                
                {upcoming.featuredImage && (
                  <img src={upcoming.featuredImage} alt={upcoming.title} className="w-full h-32 object-cover rounded-xl mb-4 border border-white/10" />
                )}

                <h3 className="text-lg font-bold leading-snug text-white">
                  {upcoming.title}
                </h3>
                {upcoming.subtitle && <p className="text-xs text-white/60 mt-1">{upcoming.subtitle}</p>}
                
                <div className="mt-4 space-y-2 text-sm text-primary-foreground/70">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gold-bright" />
                    <span>{upcoming.date}</span>
                    {upcoming.time && <span className="ml-1 opacity-75 text-xs">({upcoming.time})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-gold-bright" />
                    <span className="truncate">{upcoming.venue}</span>
                  </div>
                </div>
                <Link
                  to="/events/$id"
                  params={{ id: upcoming.slug }}
                  className="mt-4 block text-center w-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2 rounded-lg transition"
                >
                  বিস্তারিত দেখুন
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEED */}
      <section id="feed" className="relative bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* Search */}
          <div className="flex justify-end mb-8">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ইভেন্ট খুঁজুন…"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label="clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-48 rounded-3xl bg-muted/40"></div>
                <div className="h-32 rounded-2xl bg-muted/20"></div>
                <div className="h-32 rounded-2xl bg-muted/20"></div>
              </div>
            ) : (
              renderEventFeed(filteredEvents)
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ---------- Event feed components ---------- */
function renderEventFeed(items: any[]) {
  if (items.length === 0) return <EmptyState />;
  const [first, second, ...rest] = items;

  return (
    <div className="space-y-6">
      {first && <FeaturedEvent e={first} />}
      {second && <SecondaryEvent e={second} />}
      {rest.length > 0 && (
        <div className="pt-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            পূর্বের ইভেন্ট
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {rest.map((e) => (
              <CompactEvent key={e.id} e={e} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FeaturedEvent({ e }: { e: any }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-card to-card p-8 shadow-xl shadow-gold/5 transition hover:shadow-2xl hover:shadow-gold/15 sm:p-10">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {e.featuredImage ? (
           <img src={e.featuredImage} alt={e.title} className="h-32 w-32 rounded-2xl object-cover shadow-lg shadow-gold/20" />
        ) : (
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-gold text-gold-foreground shadow-lg shadow-gold/30">
            <Calendar size={28} />
            <span className="mt-1 text-xs font-bold">পরবর্তী</span>
          </div>
        )}
        
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow">
              <Sparkles size={12} /> আসন্ন ইভেন্ট
            </span>
            {e.hasRegistration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                রেজিস্ট্রেশন চলছে
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-extrabold leading-snug text-primary-dark sm:text-3xl">
            {e.title}
          </h2>
          {e.subtitle && <p className="mt-1 text-sm font-medium text-muted-foreground">{e.subtitle}</p>}
          
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-gold" />
              <span className="font-semibold text-foreground">{e.date} {e.time && <span className="text-xs font-normal opacity-70">({e.time})</span>}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-gold" />
              <span>{e.venue}</span>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/events/$id"
              params={{ id: e.slug }}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold text-gold-foreground transition hover:brightness-110"
            >
              বিস্তারিত দেখুন <ArrowRight size={15} />
            </Link>
            {e.hasRegistration && (
              <Link
                to="/events/$id"
                params={{ id: e.slug }}
                hash="registration"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-gold/40 bg-card px-5 py-3 text-sm font-bold text-gold transition hover:bg-gold/5"
              >
                রেজিস্ট্রেশন করুন
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryEvent({ e }: { e: any }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lg">
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold/40 to-transparent"
      />
      <div className="flex items-start gap-4 pl-2">
        <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold-bright sm:flex">
          <Calendar size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-gold-bright">এরপর</span>
            {e.hasRegistration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 ring-1 ring-emerald-500/30">
                রেজিস্ট্রেশন চলছে
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-primary-dark transition group-hover:text-gold sm:text-xl">
            {e.title}
          </h3>
          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} /> {e.date}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} /> {e.venue}
            </div>
          </dl>
          <div className="mt-3 flex gap-4">
            <Link
              to="/events/$id"
              params={{ id: e.slug }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
            >
              বিস্তারিত <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactEvent({ e }: { e: any }) {
  return (
    <li>
      <Link
        to="/events/$id"
        params={{ id: e.slug }}
        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-muted/50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold">
          <Calendar size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground group-hover:text-gold sm:text-[15px]">
              {e.title}
            </span>
            {e.hasRegistration && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="রেজিস্ট্রেশন চলছে" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{e.date}</span>
            <span>•</span>
            <span className="truncate">{e.venue}</span>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-gold"
        />
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <Search size={32} className="mx-auto text-muted-foreground" />
      <p className="mt-3 font-semibold text-primary-dark">কোনো ইভেন্ট পাওয়া যায়নি</p>
      <p className="mt-1 text-sm text-muted-foreground">
        ফিল্টার পরিবর্তন করে দেখতে পারেন।
      </p>
    </div>
  );
}
