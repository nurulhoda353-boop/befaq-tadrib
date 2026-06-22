import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { siteInfo } from "@/lib/data";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Facebook,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — বেফাক প্রশিক্ষণ শাখা" },
      {
        name: "description",
        content:
          "বেফাক প্রশিক্ষণ শাখার যোগাযোগের ঠিকানা, ফোন, ইমেইল, ফেসবুক ও সরাসরি ম্যাপ — যাত্রাবাড়ী, ঢাকা।",
      },
    ],
  }),
  component: ContactPage,
});

const LAT = 23.7143997;
const LNG = 90.4485331;
const MAPS_URL =
  "https://www.google.com/maps/place/%E0%A6%AC%E0%A7%87%E0%A6%AB%E0%A6%BE%E0%A6%95%E0%A7%81%E0%A6%B2+%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A6%BE%E0%A6%B0%E0%A6%BF%E0%A6%B8%E0%A6%BF%E0%A6%B2+%E0%A6%86%E0%A6%B0%E0%A6%BE%E0%A6%AC%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE+%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6(%E0%A6%A8%E0%A6%A4%E0%A7%81%E0%A6%A8+%E0%A6%AD%E0%A6%AC%E0%A6%A8)/@23.7143997,90.4485331,17z/data=!3m1!4b1!4m6!3m5!1s0x3755b9f8d855d9f3:0xde57e1c38b6e02e4!8m2!3d23.7143997!4d90.4485331";
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;
const EMBED_URL = `https://www.google.com/maps?q=${LAT},${LNG}&z=17&hl=bn&output=embed`;

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO — dark luxe */}
      <section className="relative overflow-hidden border-b border-border bg-dark-luxe text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <MessageCircle size={13} /> আমরা আপনার পাশে আছি
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.5] drop-shadow-sm sm:text-5xl lg:text-6xl">
              যেকোনো প্রশ্নে{" "}
              <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
                সরাসরি যোগাযোগ
              </span>{" "}
              করুন
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
              ভর্তি, প্রশিক্ষণ, আঞ্চলিক কেন্দ্র বা যেকোনো বিষয়ে — ফোন, ইমেইল, ফেসবুক
              অথবা সরাসরি বেফাক প্রশিক্ষণ কেন্দ্রে আসুন। আমাদের দরজা সর্বদা খোলা।
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110"
              >
                <Phone size={15} /> এখনই কল করুন
              </a>
              <a
                href="#message"
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-transparent px-6 py-3.5 text-sm font-bold text-gold-bright transition hover:bg-gold/10"
              >
                বার্তা পাঠান <ChevronRight size={15} />
              </a>
            </div>

            {/* Inline meta */}
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <Clock size={18} className="text-gold-bright" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">
                    অফিস সময়
                  </div>
                  <div className="text-sm font-bold">শনি–বৃহঃ · ৯:০০–৫:০০</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <CheckCircle2 size={18} className="text-gold-bright" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">
                    গড় রেসপন্স
                  </div>
                  <div className="text-sm font-bold">২৪ ঘণ্টার মধ্যে</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Floating contact cards */}
          <div className="relative hidden h-[520px] items-center justify-center lg:flex">
            <div className="absolute flex h-64 w-64 -rotate-12 items-center justify-center rounded-full border-2 border-gold/20 bg-primary/30">
              <MessageCircle size={96} className="text-gold/20" />
            </div>

            <div className="relative w-full max-w-sm space-y-4">
              <ContactFloat
                icon={Phone}
                tone="centerpiece"
                eyebrow="সরাসরি কল"
                title={siteInfo.phone}
                sub="প্রধান যোগাযোগ লাইন"
              />
              <ContactFloat
                icon={Mail}
                tone="left"
                eyebrow="ইমেইল"
                title={siteInfo.email}
                sub="আনুষ্ঠানিক যোগাযোগ"
              />
              <ContactFloat
                icon={Facebook}
                tone="right"
                eyebrow="ফেসবুক পেজ"
                title="wifaqtadrib.bd"
                sub="সর্বশেষ আপডেট পান"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CARDS — LIGHT */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Sparkles size={12} /> যোগাযোগের মাধ্যম
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-primary-dark sm:text-4xl">
              যেভাবে আপনার সুবিধা
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              পছন্দমতো যেকোনো মাধ্যমে যোগাযোগ করুন — আমরা দ্রুত উত্তর দিতে প্রতিশ্রুতিবদ্ধ।
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={Phone}
              title="ফোন"
              value={siteInfo.phone}
              hint="সরাসরি কল বা SMS"
              href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
              cta="কল করুন"
            />
            <ContactCard
              icon={Mail}
              title="ইমেইল"
              value={siteInfo.email}
              hint="২৪ ঘণ্টায় উত্তর"
              href={`mailto:${siteInfo.email}`}
              cta="ইমেইল পাঠান"
            />
            <ContactCard
              icon={Facebook}
              title="ফেসবুক"
              value="wifaqtadrib.bd"
              hint="ঘোষণা ও আপডেট"
              href={siteInfo.facebook}
              cta="পেজে যান"
              external
            />
            <ContactCard
              icon={MapPin}
              title="ঠিকানা"
              value="যাত্রাবাড়ী, ঢাকা"
              hint="নতুন ভবন"
              href={MAPS_URL}
              cta="ম্যাপে দেখুন"
              external
            />
          </div>
        </div>
      </section>

      {/* MESSAGE FORM + INFO — split light/dark */}
      <section id="message" className="relative overflow-hidden bg-dark-luxe text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.02]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Info panel */}
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              আমাদের কাছে{" "}
              <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
                লিখুন
              </span>
            </h2>
            <p className="mt-3 max-w-md text-primary-foreground/75">
              ফরম পূরণ করে পাঠান — আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
            </p>

            <ul className="mt-8 space-y-4">
              <InfoRow icon={MapPin} label="ঠিকানা" value={siteInfo.address} />
              <InfoRow icon={Phone} label="ফোন" value={siteInfo.phone} />
              <InfoRow icon={Mail} label="ইমেইল" value={siteInfo.email} />
              <InfoRow icon={Clock} label="অফিস সময়" value="শনি–বৃহঃ · ৯:০০–৫:০০" />
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/centers"
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-bold text-gold-bright transition hover:bg-gold/10"
              >
                সকল কেন্দ্র দেখুন <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-gold/20 via-transparent to-transparent opacity-40"
            />
            <div className="relative">
              {sent ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold-bright">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="mt-4 text-xl font-extrabold text-white">
                    ধন্যবাদ! আপনার বার্তা পৌঁছেছে।
                  </p>
                  <p className="mt-2 text-sm text-primary-foreground/70">
                    আমাদের টিম শীঘ্রই যোগাযোগ করবে ইনশাআল্লাহ্‌।
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gold/40 px-5 py-2 text-sm font-semibold text-gold-bright hover:bg-gold/10"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="নাম" placeholder="আপনার পূর্ণ নাম" />
                    <Field label="ফোন" type="tel" placeholder="০১৭xx-xxxxxx" required={false} />
                  </div>
                  <Field label="ইমেইল" type="email" placeholder="you@example.com" />
                  <Field label="বিষয়" placeholder="যে বিষয়ে জানতে চান" />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-primary-foreground/85">
                      বার্তা
                    </span>
                    <textarea
                      required
                      rows={5}
                      placeholder="বিস্তারিত লিখুন…"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-primary-foreground/40 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110"
                  >
                    <Send size={15} /> বার্তা পাঠান
                  </button>
                  <p className="text-center text-xs text-primary-foreground/55">
                    আপনার তথ্য নিরাপদ থাকবে — শুধুমাত্র যোগাযোগের জন্য ব্যবহৃত হবে।
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* MAP — special */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Compass size={12} /> সরাসরি ভিজিট করুন
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-primary-dark sm:text-4xl">
                আমাদের অবস্থান
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (নতুন ভবন) — সামাদনগর, যাত্রাবাড়ী, ঢাকা।
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary"
              >
                <Navigation size={14} /> দিকনির্দেশনা
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-gold/50 hover:text-gold"
              >
                <ExternalLink size={14} /> Google Maps-এ খুলুন
              </a>
            </div>
          </div>

          {/* Framed map */}
          <div className="relative mt-8">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-gold/40 via-gold/10 to-transparent blur-2xl opacity-60"
            />
            <div className="relative overflow-hidden rounded-3xl border-2 border-gold/30 bg-card shadow-2xl shadow-gold/10">
              {/* Map */}
              <div className="relative h-[460px] w-full sm:h-[520px]">
                <iframe
                  title="বেফাক প্রশিক্ষণ কেন্দ্রের অবস্থান"
                  src={EMBED_URL}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {/* Floating address card */}
                <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
                  <div className="pointer-events-auto rounded-2xl border border-gold/40 bg-primary-dark/95 p-5 text-primary-foreground shadow-2xl backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                          মূল কেন্দ্র
                        </div>
                        <div className="mt-0.5 font-bold leading-snug">
                          বেফাক প্রশিক্ষণ সেন্টার
                        </div>
                        <div className="mt-1 text-xs text-primary-foreground/75">
                          {siteInfo.address}
                        </div>
                        <a
                          href={DIRECTIONS_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-bright hover:underline"
                        >
                          দিকনির্দেশনা পান <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ---------- helpers ---------- */
function Field({
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary-foreground/85">
        {label}
        {!required && (
          <span className="ml-1 text-xs font-normal text-primary-foreground/50">
            (ঐচ্ছিক)
          </span>
        )}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-primary-foreground/40 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40"
      />
    </label>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-bright">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/55">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
      </div>
    </li>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  hint,
  href,
  cta,
  external,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  hint: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10"
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/10 opacity-0 blur-2xl transition group-hover:opacity-100"
      />
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold ring-1 ring-gold/30">
          <Icon size={20} />
        </div>
        <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 truncate text-base font-bold text-primary-dark group-hover:text-gold">
          {value}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold">
          {cta}
          <ArrowRight
            size={12}
            className="transition group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </a>
  );
}

function ContactFloat({
  icon: Icon,
  tone,
  eyebrow,
  title,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "centerpiece" | "left" | "right";
  eyebrow: string;
  title: string;
  sub: string;
}) {
  if (tone === "centerpiece") {
    return (
      <div className="relative z-20 scale-105 rounded-2xl border-2 border-gold/50 bg-primary/80 p-5 shadow-2xl shadow-gold/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
              {eyebrow}
            </div>
            <div className="truncate font-bold text-white">{title}</div>
            <div className="truncate text-xs text-primary-foreground/65">{sub}</div>
          </div>
        </div>
      </div>
    );
  }
  const offset =
    tone === "left"
      ? "-translate-x-10 translate-y-2 -rotate-3"
      : "translate-x-8 -translate-y-2 rotate-3";
  return (
    <div
      className={`${offset} transform rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md transition hover:-translate-y-1`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            {eyebrow}
          </div>
          <div className="truncate font-bold text-white">{title}</div>
          <div className="truncate text-xs text-primary-foreground/65">{sub}</div>
        </div>
      </div>
    </div>
  );
}
