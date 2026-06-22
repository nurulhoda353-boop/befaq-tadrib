import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { notices as staticNotices } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  FileText,
  MapPin,
  Megaphone,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

type NoticeItem = {
  id: string | number;
  title: string;
  body: string;
  category: string;
  date: string;
  pinned?: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
};

export const Route = createFileRoute("/notices/")({
  head: () => ({
    meta: [
      { title: "নোটিশ ও ইভেন্ট — বেফাক প্রশিক্ষণ শাখা" },
      {
        name: "description",
        content:
          "বেফাক প্রশিক্ষণ শাখার সর্বশেষ ভর্তি বিজ্ঞপ্তি, রেজাল্ট, ঘোষণা ও আসন্ন ইভেন্টের তালিকা — এক জায়গায়।",
      },
    ],
  }),
  component: NoticesPage,
});

const bn = (n: number | string) =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);

const categoryIcon: Record<string, typeof Bell> = {
  ভর্তি: FileText,
  রেজাল্ট: Sparkles,
  ঘোষণা: Megaphone,
};

const categoryTone: Record<string, string> = {
  ভর্তি: "from-gold/20 to-gold/5 text-gold-foreground border-gold/40",
  রেজাল্ট:
    "from-emerald-500/20 to-emerald-500/5 text-emerald-700 border-emerald-500/40",
  ঘোষণা: "from-sky-500/20 to-sky-500/5 text-sky-700 border-sky-500/40",
};

function NoticesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const catMap: Record<string, string> = {
    general: "ঘোষণা",
    urgent: "জরুরি",
    admission: "ভর্তি",
  };

  const { data: dbNotices } = useQuery({
    queryKey: ["public-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, body, category, pinned, published_at, attachment_url, attachment_name")
        .eq("status", "published")
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        category: catMap[n.category] ?? "ঘোষণা",
        date: n.published_at
          ? new Date(n.published_at).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" })
          : "",
        pinned: n.pinned,
        attachment_url: n.attachment_url,
        attachment_name: n.attachment_name,
      }));
    },
  });

  // Fallback to static seed if DB is empty (so existing demo still works)
  const notices: NoticeItem[] = (dbNotices && dbNotices.length > 0)
    ? dbNotices
    : (staticNotices as unknown as NoticeItem[]);

  const categories = useMemo(
    () => Array.from(new Set(notices.map((n) => n.category))) as string[],
    [notices],
  );

  const filteredNotices = useMemo(
    () =>
      notices.filter((n) => {
        if (cat !== "all" && n.category !== cat) return false;
        if (q && !(n.title + n.body).toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [q, cat],
  );

  const latest = notices[0] || staticNotices[0];

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
              সর্বশেষ আপডেট
            </div>

              নোটিশ ও <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">ঘোষণা</span> এক জায়গায়

            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              বেফাক প্রশিক্ষণ শাখার সকল ভর্তি বিজ্ঞপ্তি, রেজাল্ট, সাধারণ ঘোষণা ও আসন্ন
              উদ্বোধন-সমাপনী অনুষ্ঠানের হালনাগাদ তথ্য — দ্রুত খুঁজে নিন।
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "মোট নোটিশ", value: `${bn(notices.length)}+` },
                {
                  label: "ভর্তি বিজ্ঞপ্তি",
                  value: bn(notices.filter((n) => n.category === "ভর্তি").length),
                },
                {
                  label: "রেজাল্ট",
                  value: bn(notices.filter((n) => n.category === "রেজাল্ট").length),
                },
                { label: "মোট ঘোষণা", value: bn(notices.filter((n) => n.category === "ঘোষণা").length) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-gold/40"
                >
                  <div className="text-2xl font-extrabold text-gold-bright">{s.value}</div>
                  <div className="text-xs text-primary-foreground/60">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#feed"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-7 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110"
              >
                সকল নোটিশ দেখুন <ChevronRight size={16} />
              </a>
              <Link
                to="/admission"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-transparent px-7 py-3.5 text-sm font-bold text-gold-bright transition hover:bg-gold/10"
              >
                ভর্তির আবেদন
              </Link>
            </div>
          </div>

          {/* RIGHT — Floating preview cards */}
          <div className="relative hidden h-[560px] items-center justify-center lg:flex">
            <div className="absolute flex h-64 w-64 -rotate-12 items-center justify-center rounded-full border-2 border-gold/20 bg-primary/30">
              <Bell size={96} className="text-gold/20" />
            </div>

            <div className="relative w-full max-w-sm space-y-4">
              <div className="relative z-20 scale-105 rounded-2xl border-2 border-gold/50 bg-primary/80 p-5 shadow-2xl shadow-gold/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-gold-bright">
                  <Sparkles size={14} /> সর্বশেষ নোটিশ
                </div>
                <h3 className="mt-3 text-base font-bold leading-snug text-white">
                  {latest.title}
                </h3>
                <div className="mt-3 flex items-center gap-2 text-xs text-primary-foreground/70">
                  <span className="rounded bg-gold/20 px-2 py-0.5 font-semibold text-gold-bright">
                    {latest.category}
                  </span>
                  <span>{latest.date}</span>
                </div>
              </div>

              <div className="translate-x-8 -translate-y-2 rotate-3 transform rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md transition hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    <Tag size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">বিভাগসমূহ</h3>
                    <p className="text-xs text-primary-foreground/60">
                      ভর্তি · রেজাল্ট · ঘোষণা
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEED — LIGHT */}
      <section id="feed" className="relative bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          {/* Tabs + search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="নোটিশ খুঁজুন…"
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

          {/* Category chips */}
          <div className="mt-5 flex flex-wrap gap-2">
              <Chip active={cat === "all"} onClick={() => setCat("all")}>
                সব ({bn(notices.length)})
              </Chip>
              {categories.map((c) => {
                const count = notices.filter((n) => n.category === c).length;
                return (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c} ({bn(count)})
                  </Chip>
                );
              })}
          </div>

          {/* Hierarchical Feed */}
          <div className="mt-10">
            {renderNoticeFeed(filteredNotices)}
          </div>
        </div>
      </section>

      {/* IMPORTANT LINKS — dark accent */}
      <section className="relative overflow-hidden border-y border-border bg-dark-luxe text-primary-foreground">
        <div
          className="absolute inset-0 bg-star-pattern opacity-[0.02] pointer-events-none"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                গুরুত্বপূর্ণ <span className="text-gold-bright">লিংকসমূহ</span>
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                দ্রুত পৌঁছাতে চাইলে এই সেকশনগুলো কাজে লাগবে
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                to: "/admission",
                title: "ভর্তির আবেদন",
                desc: "চলমান ব্যাচে আবেদন করুন",
                icon: FileText,
              },
              {
                to: "/results",
                title: "রেজাল্ট দেখুন",
                desc: "প্রকাশিত সকল রেজাল্ট",
                icon: Sparkles,
              },
              {
                to: "/trainings",
                title: "সকল প্রশিক্ষণ",
                desc: "১১টি কোর্সের বিবরণ",
                icon: Bell,
              },
              {
                to: "/centers",
                title: "প্রশিক্ষণ কেন্দ্র",
                desc: "৬৪ জেলায় ছড়িয়ে",
                icon: MapPin,
              },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                target={l.to === "/admission" ? "_blank" : undefined}
                rel={l.to === "/admission" ? "noopener noreferrer" : undefined}
                className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-bright">
                  <l.icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-bold text-white">
                    {l.title}
                    <ArrowRight
                      size={14}
                      className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-primary-foreground/65">
                    {l.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ---------- Notice feed: featured → secondary → compact list ---------- */
function renderNoticeFeed(items: NoticeItem[]) {
  if (items.length === 0) return <EmptyState />;
  const [first, second, ...rest] = items;

  return (
    <div className="space-y-6">
      {/* Featured (চলমান) */}
      {first && <FeaturedNotice n={first} />}

      {/* Secondary */}
      {second && (
        <div className="grid gap-4">
          <SecondaryNotice n={second} />
        </div>
      )}

      {/* Compact list */}
      {rest.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            পূর্বের নোটিশ
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {rest.map((n) => (
              <CompactNotice key={n.id} n={n} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FeaturedNotice({ n }: { n: NoticeItem }) {
  const Icon = categoryIcon[n.category] ?? Bell;
  return (
    <Link
      to="/notices/$id"
      params={{ id: String(n.id) }}
      className="group relative block overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-card to-card p-8 shadow-xl shadow-gold/5 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-gold/15 sm:p-10"
    >
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow">
            <Sparkles size={12} /> চলমান নোটিশ
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
            <Icon size={12} /> {n.category}
          </span>
          <span className="text-xs text-muted-foreground">{n.date}</span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold leading-snug text-primary-dark sm:text-3xl">
          {n.title}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {n.body}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-dark px-5 py-3 text-sm font-bold text-primary-foreground transition group-hover:bg-primary">
          বিস্তারিত পড়ুন <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function SecondaryNotice({ n }: { n: NoticeItem }) {
  const Icon = categoryIcon[n.category] ?? Bell;
  const tone = categoryTone[n.category] ?? "from-gold/15 to-transparent";
  return (
    <Link
      to="/notices/$id"
      params={{ id: String(n.id) }}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lg"
    >
      <div
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${tone.split(" ").slice(0, 2).join(" ")}`}
      />
      <div className="flex items-start gap-4 pl-2">
        <div
          className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br ${tone} sm:flex`}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-gold">পূর্ববর্তী</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
              <Icon size={11} /> {n.category}
            </span>
            <span className="text-muted-foreground">{n.date}</span>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-primary-dark transition group-hover:text-gold sm:text-xl">
            {n.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold group-hover:underline">
            বিস্তারিত <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactNotice({ n }: { n: NoticeItem }) {
  const Icon = categoryIcon[n.category] ?? Bell;
  return (
    <li>
      <Link
        to="/notices/$id"
        params={{ id: String(n.id) }}
        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-muted/50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground group-hover:text-gold sm:text-[15px]">
            {n.title}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{n.category}</span>
            <span>•</span>
            <span>{n.date}</span>
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



function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-gold bg-gold text-gold-foreground shadow"
          : "border-border bg-card text-muted-foreground hover:border-gold/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <Search size={32} className="mx-auto text-muted-foreground" />
      <p className="mt-3 font-semibold text-primary-dark">কোনো ফলাফল পাওয়া যায়নি</p>
      <p className="mt-1 text-sm text-muted-foreground">
        ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।
      </p>
    </div>
  );
}
