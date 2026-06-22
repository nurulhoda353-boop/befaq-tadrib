import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Award, Download, Search } from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "রেজাল্ট অনুসন্ধান — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "রোল নম্বর দিয়ে আপনার প্রশিক্ষণ রেজাল্ট ও ডিজিটাল সার্টিফিকেট অনুসন্ধান করুন।" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const [roll, setRoll] = useState("");
  const [batch, setBatch] = useState("");
  const [result, setResult] = useState<null | { name: string; training: string; marks: number; grade: string; status: string }>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!roll || !batch) return;
    setResult({
      name: "মাওলানা আব্দুল্লাহ",
      training: "কেন্দ্রীয় হুফফাযুল কোরআন শিক্ষক প্রশিক্ষণ",
      marks: 87,
      grade: "A+",
      status: "উত্তীর্ণ",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHeader title="রেজাল্ট অনুসন্ধান" subtitle="রোল নম্বর ও ব্যাচ নম্বর দিয়ে রেজাল্ট ও সার্টিফিকেট ডাউনলোড করুন।" />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <form onSubmit={search} className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">রোল নম্বর</span>
              <input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="যেমন: 12345" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">ব্যাচ</span>
              <select value={batch} onChange={(e) => setBatch(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">-- নির্বাচন করুন --</option>
                <option value="35">৩৫তম ব্যাচ (২০২৫)</option>
                <option value="34">৩৪তম ব্যাচ (২০২৪)</option>
                <option value="33">৩৩তম ব্যাচ (২০২৪)</option>
              </select>
            </label>
          </div>
          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">
            <Search size={16} /> অনুসন্ধান
          </button>
        </form>

        {result && (
          <div className="mt-8 overflow-hidden rounded-xl border-2 border-gold/40 bg-card shadow-elegant">
            <div className="bg-hero-gradient p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <Award size={36} className="text-gold" />
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80">ফলাফল</div>
                  <div className="text-xl font-bold">{result.status}</div>
                </div>
              </div>
            </div>
            <dl className="grid gap-4 p-6 sm:grid-cols-2">
              <Row k="নাম" v={result.name} />
              <Row k="প্রশিক্ষণ" v={result.training} />
              <Row k="রোল নম্বর" v={roll} />
              <Row k="ব্যাচ" v={batch} />
              <Row k="প্রাপ্ত নম্বর" v={`${result.marks} / ১০০`} />
              <Row k="গ্রেড" v={result.grade} />
            </dl>
            <div className="flex flex-wrap gap-3 border-t border-border p-6">
              <button className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-gold-foreground hover:brightness-105">
                <Download size={16} /> সার্টিফিকেট ডাউনলোড (PDF)
              </button>
              <button className="rounded-md border border-input px-5 py-2 text-sm font-semibold">QR যাচাইকরণ</button>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{v}</dd>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-dark-luxe py-12 text-primary-foreground">
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
      
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 z-10">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-primary-foreground/80">{subtitle}</p>
      </div>
    </section>
  );
}
