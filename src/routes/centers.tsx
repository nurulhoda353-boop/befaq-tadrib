import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHeader } from "./results";
import { centers } from "@/lib/data";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/centers")({
  head: () => ({
    meta: [
      { title: "কেন্দ্র ডিরেক্টরি — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "সারা দেশে আমাদের কেন্দ্রীয় ও আঞ্চলিক প্রশিক্ষণ কেন্দ্রের তালিকা।" },
    ],
  }),
  component: CentersPage,
});

function CentersPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHeader title="কেন্দ্র ডিরেক্টরি" subtitle="৮ বিভাগে আমাদের কেন্দ্রীয় ও আঞ্চলিক প্রশিক্ষণ কেন্দ্রসমূহ।" />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-6">
              <span className="inline-block rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-dark">{c.division} বিভাগ</span>
              <h3 className="mt-3 font-bold text-primary-dark">{c.name}</h3>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin size={14} /> {c.district}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
