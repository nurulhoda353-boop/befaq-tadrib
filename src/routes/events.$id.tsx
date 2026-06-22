import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { events } from "@/lib/data";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "ইভেন্ট বিস্তারিত — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "বেফাক প্রশিক্ষণ শাখার ইভেন্টের সময়, স্থান ও ধরন।" },
    ],
  }),
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { id } = Route.useParams();
  const event = events.find((item) => item.id === id);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          to="/notices"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-emerald-500/50 hover:text-foreground"
        >
          <ArrowLeft size={16} /> নোটিশ/ইভেন্টে ফিরুন
        </Link>

        {event ? (
          <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="relative overflow-hidden border-b border-border bg-dark-luxe px-5 py-8 text-primary-foreground sm:px-8 sm:py-10">
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
              
              <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                  <Calendar size={13} /> ইভেন্ট
                </span>
              </div>
              <h1 className="relative z-10 mt-4 font-display text-3xl font-extrabold leading-snug sm:text-4xl">
                {event.title}
              </h1>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
              <Info icon={Calendar} label="তারিখ" value={event.date} />
              <Info icon={MapPin} label="স্থান" value={event.venue} />
              <Info icon={Tag} label="ধরন" value={event.type} />
            </dl>
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold text-foreground">ইভেন্টটি পাওয়া যায়নি</p>
            <p className="mt-1 text-sm text-muted-foreground">লিংকটি ভুল হতে পারে।</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Icon size={14} /> {label}
      </div>
      <div className="mt-2 font-semibold text-foreground">{value}</div>
    </div>
  );
}