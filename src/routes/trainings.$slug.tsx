import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { trainings, type Training } from "@/lib/data";
import {
  Calendar, CheckCircle2, ChevronLeft, Clock, MapPin, Tag, Users, Wallet,
  BadgeCheck, Info, Sparkles, AlertCircle
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/trainings/$slug")({
  loader: ({ params }): Training => {
    const training = trainings.find((t) => t.slug === params.slug);
    if (!training) throw notFound();
    return training;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "প্রশিক্ষণ"} — বেফাক প্রশিক্ষণ শাখা` },
      { name: "description", content: loaderData?.description ?? "" },
    ],
  }),
  component: TrainingDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-primary-dark">প্রশিক্ষণ পাওয়া যায়নি</h1>
        <Link to="/trainings" className="mt-6 inline-block text-primary underline">সকল প্রশিক্ষণ দেখুন</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (v: string | number) => String(v).replace(/\d/g, (d) => bnDigits[+d]);

function TrainingDetail() {
  const t: Training = Route.useLoaderData();

  const isSpecial = t.type === "special";

  // Generate some dummy batches for UI demonstration
  const batches = useMemo(() => {
    return [
      { id: "b1", num: 36, status: "upcoming", start: "২২ জুন, ২০২৬", end: "০২ জুলাই, ২০২৬", seats: 40, filled: 28, center: "বেফাক প্রশিক্ষণ সেন্টার, যাত্রাবাড়ী" },
      { id: "b2", num: 37, status: "upcoming", start: "১০ জুলাই, ২০২৬", end: "২০ জুলাই, ২০২৬", seats: 40, filled: 5, center: "জামিয়া ইসলামিয়া দারুল উলুম, গাজীপুর" },
      { id: "b3", num: 35, status: "ongoing", start: "০১ জুন, ২০২৬", end: "১৫ জুন, ২০২৬", seats: 60, filled: 60, center: "বেফাক প্রশিক্ষণ সেন্টার, যাত্রাবাড়ী" },
      { id: "b4", num: 34, status: "completed", start: "১০ মে, ২০২৬", end: "২৫ মে, ২০২৬", seats: 50, filled: 50, center: "মাদরাসাতুল সুফফাহ, চট্টগ্রাম" },
    ];
  }, [t.id]);

  const upcomingBatches = batches.filter(b => b.status === "upcoming");
  const ongoingBatches = batches.filter(b => b.status === "ongoing");
  const completedBatches = batches.filter(b => b.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO SECTION — Dark Luxe */}
      <section className="relative overflow-hidden border-b border-border bg-dark-luxe text-primary-foreground py-16 sm:py-24">
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
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 z-10">
          <Link to="/trainings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-bright hover:text-gold transition mb-6">
            <ChevronLeft size={16} /> প্রশিক্ষণ তালিকায় ফিরুন
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
              t.type === "special" ? "bg-gold/20 text-gold-bright border border-gold/30" : "bg-primary/20 text-primary-300 border border-primary/30"
            }`}>
              <Tag size={12} /> {t.typeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-white/10 text-white border border-white/10">
              <Clock size={12} /> মেয়াদ: {t.duration}
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl leading-tight text-balance">
            {t.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-primary-foreground/75 leading-relaxed">
            {t.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/admission"
              search={{ training: t.id }}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-7 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              এই প্রশিক্ষণে আবেদন করুন
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Syllabus, Eligibility & Batches */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Syllabus & Eligibility */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary-dark">সিলেবাস সংক্ষেপ</h2>
              </div>
              <ul className="space-y-3">
                {t.syllabus.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" /> 
                    <span className="text-foreground text-sm font-medium leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-bright">
                  <BadgeCheck size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary-dark">যোগ্যতা</h2>
              </div>
              <ul className="space-y-3">
                {t.eligibility.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gold" /> 
                    <span className="text-foreground text-sm font-medium leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Batches Overview */}
          <div>
            <h2 className="text-2xl font-extrabold text-primary-dark mb-6 border-b border-border pb-4">ব্যাচ ও সময়সূচি</h2>
            
            {upcomingBatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-gold animate-ping"></span>
                  <span className="flex h-2 w-2 rounded-full bg-gold absolute"></span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-3">আসন্ন ব্যাচসমূহ</h3>
                </div>
                <div className="space-y-3">
                  {upcomingBatches.map(b => <BatchRow key={b.id} b={b} />)}
                </div>
              </div>
            )}

            {ongoingBatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">চলমান ব্যাচসমূহ</h3>
                <div className="space-y-3">
                  {ongoingBatches.map(b => <BatchRow key={b.id} b={b} />)}
                </div>
              </div>
            )}

            {completedBatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">পূর্ববর্তী ব্যাচসমূহ</h3>
                <div className="space-y-3">
                  {completedBatches.map(b => <BatchRow key={b.id} b={b} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Info Sidebar */}
        <aside>
          <div className="sticky top-24 rounded-2xl border-2 border-primary/10 bg-card p-6 shadow-elegant">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-primary-dark flex items-center gap-2 border-b border-border pb-4">
              <Info size={16} className="text-primary" /> প্রশিক্ষণ তথ্য সংক্ষেপ
            </h3>
            <dl className="space-y-5">
              <InfoRow icon={Clock} label="মেয়াদ" value={t.duration} />
              <InfoRow icon={Calendar} label="সময়সূচি" value={t.schedule} />
              <InfoRow icon={Users} label="লক্ষ্যদল" value={t.targetGroup} />
              <InfoRow icon={Tag} label="বিষয়" value={t.subject} />
              <InfoRow icon={MapPin} label="স্থান" value={t.location} />
              <InfoRow icon={Wallet} label="ফি" value={t.fee} />
            </dl>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="rounded-xl bg-primary-soft p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary-dark leading-relaxed font-medium">
                  যেকোনো প্রশিক্ষণে অংশগ্রহণের জন্য নির্দিষ্ট সময়ের পূর্বে অনলাইনে আবেদন সম্পন্ন করতে হবে। আসন সংখ্যা সীমিত।
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon size={18} />
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-bold text-foreground text-sm leading-snug">{value}</dd>
      </div>
    </div>
  );
}

function BatchRow({ b }: { b: any }) {
  const isUpcoming = b.status === "upcoming";
  const isOngoing = b.status === "ongoing";
  
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
      isUpcoming ? "bg-card border-gold/40 shadow-soft hover:shadow-lg hover:-translate-y-0.5" : 
      isOngoing ? "bg-primary-soft/30 border-primary/30" : 
      "bg-muted/30 border-border opacity-70"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg shrink-0 ${
          isUpcoming ? "bg-gold text-gold-foreground shadow-inner" :
          isOngoing ? "bg-primary text-primary-foreground" :
          "bg-muted text-muted-foreground border border-border"
        }`}>
          <span className="text-xs font-bold leading-none">{toBn(b.num)}</span>
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">তম</span>
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm sm:text-base">
            {b.start} — {b.end}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin size={12} /> {b.center}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border sm:border-0 pt-3 sm:pt-0">
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">আসন অবস্থা</div>
          <div className="mt-0.5 text-xs font-semibold">
            {isUpcoming ? (
              <span className="text-gold-bright">{toBn(b.seats - b.filled)} টি ফাঁকা</span>
            ) : (
              <span className="text-foreground">{toBn(b.filled)} / {toBn(b.seats)} পূর্ণ</span>
            )}
          </div>
        </div>
        
        {isUpcoming && (
          <Link to="/admission" search={{ batch: b.id }} className="shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-dark transition">
            আবেদন করুন
          </Link>
        )}
      </div>
    </div>
  );
}
