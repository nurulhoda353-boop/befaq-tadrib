import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Download, ExternalLink, FileText, Loader2, Paperclip, Tag } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { notices as staticNotices } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { resolveAttachmentUrl } from "@/lib/notice-attachment";


type PublicNotice = {
  id: string;
  title: string;
  body: string;
  category: string;
  date: string;
  pinned?: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
};

const categoryLabels: Record<string, string> = {
  general: "সাধারণ",
  urgent: "জরুরি",
  admission: "ভর্তি",
};

export const Route = createFileRoute("/notices/$id")({
  head: () => ({
    meta: [
      { title: "নোটিশ বিস্তারিত — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "বেফাক প্রশিক্ষণ শাখার প্রকাশিত নোটিশের বিস্তারিত তথ্য।" },
    ],
  }),
  component: NoticeDetailsPage,
});

function NoticeDetailsPage() {
  const { id } = Route.useParams();
  const staticNotice = staticNotices.find((n) => n.id === id);

  const { data: dbNotice, isLoading } = useQuery({
    queryKey: ["public-notice", id],
    enabled: !staticNotice,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, body, category, pinned, published_at, attachment_url, attachment_name")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return {
        id: data.id,
        title: data.title,
        body: data.body,
        category: categoryLabels[data.category] ?? "সাধারণ",
        date: data.published_at
          ? new Date(data.published_at).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" })
          : "",
        pinned: data.pinned,
        attachment_url: data.attachment_url,
        attachment_name: data.attachment_name,
      } satisfies PublicNotice;
    },
  });

  const notice: PublicNotice | undefined = staticNotice
    ? { ...staticNotice, attachment_url: null, attachment_name: null }
    : dbNotice;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          to="/notices"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-gold/50 hover:text-foreground"
        >
          <ArrowLeft size={16} /> সব নোটিশ
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            লোড হচ্ছে...
          </div>
        ) : notice ? (
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
                {notice.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 font-bold text-gold-foreground">
                    গুরুত্বপূর্ণ
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 font-semibold text-gold-bright">
                  <Tag size={12} /> {notice.category}
                </span>
                {notice.date && (
                  <span className="inline-flex items-center gap-1 text-primary-foreground/70">
                    <Calendar size={12} /> {notice.date}
                  </span>
                )}
              </div>
              <h1 className="relative z-10 mt-4 font-display text-3xl font-extrabold leading-snug sm:text-4xl">
                {notice.title}
              </h1>
            </div>

            <div className="space-y-6 px-5 py-7 sm:px-8">
              <div className="prose prose-slate max-w-none whitespace-pre-line text-[15px] leading-8 text-foreground sm:text-base">
                {notice.body}
              </div>

              {notice.attachment_url && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-background ring-1 ring-border">
                        <FileText size={20} className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Paperclip size={12} /> সংযুক্তি
                        </div>
                        <p className="truncate font-medium text-foreground">
                          {notice.attachment_name ?? "নোটিশ ফাইল"}
                        </p>
                      </div>
                    </div>
                    <AttachmentDownloadButton value={notice.attachment_url} />

                  </div>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold text-foreground">নোটিশটি পাওয়া যায়নি</p>
            <p className="mt-1 text-sm text-muted-foreground">লিংকটি ভুল হতে পারে অথবা নোটিশটি প্রকাশিত নয়।</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function AttachmentDownloadButton({ value }: { value: string }) {
  const [loading, setLoading] = useState(false);
  async function open() {
    setLoading(true);
    try {
      const url = await resolveAttachmentUrl(value, 60 * 10);
      if (!url) {
        toast.error("ফাইল লিংক তৈরি করা যায়নি");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} খুলুন <ExternalLink size={13} />
    </button>
  );
}
