import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { resolveAttachmentUrl, getAttachmentPath } from "@/lib/notice-attachment";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Plus,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/results")({
  beforeLoad: ensureAdmin,
  component: AdminResults,
});

interface ResultItem {
  id: string;
  title: string;
  exam_year: string;
  pdf_url: string | null;
  published_at: string | null;
  created_at: string;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("bn-BD", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function AdminResults() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ResultItem | null>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["admin-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResultItem[];
    },
  });

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.exam_year.includes(search)) return false;
      return true;
    });
  }, [results, search]);

  const deleteMut = useMutation({
    mutationFn: async (r: ResultItem) => {
      if (r.pdf_url) {
        const path = getAttachmentPath(r.pdf_url);
        if (path) {
          await supabase.storage.from("cms-attachments").remove([path]);
        }
      }
      const { error } = await supabase.from("results").delete().eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ফলাফল মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-results"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="রেজাল্ট"
      title="ফলাফল ম্যানেজমেন্ট"
      subtitle="প্রশিক্ষণ কোর্স ও বিভিন্ন পরীক্ষার ফলাফল (PDF) প্রকাশ করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন ফলাফল
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ফলাফলের নাম বা বছর দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো ফলাফল নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের "নতুন ফলাফল" বোতাম থেকে রেজাল্ট আপলোড করুন
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="group flex flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold text-foreground">
                    {r.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-emerald-600 dark:text-emerald-500">
                      পরীক্ষার বছর: {r.exam_year}
                    </span>
                    <span>প্রকাশিত: {fmtDate(r.published_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {r.pdf_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        const url = await resolveAttachmentUrl(r.pdf_url, 600);
                        if (url) window.open(url, "_blank");
                      }}
                      title="PDF দেখুন"
                      className="grid h-9 w-9 place-items-center rounded-lg text-primary transition hover:bg-primary/10"
                    >
                      <ExternalLink size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleting(r)}
                    title="Delete"
                    className="grid h-9 w-9 place-items-center rounded-lg text-destructive transition hover:bg-destructive/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ResultFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-results"] })}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ফলাফলটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.title}"</strong> — এই ফলাফল ও এর PDF ফাইলটি স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMut.mutate(deleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "হ্যাঁ, মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function ResultFormDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form when opened
  useMemo(() => {
    if (open) {
      setTitle("");
      setExamYear(new Date().getFullYear().toString());
      setPdfUrl(null);
      setPdfName(null);
    }
  }, [open]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("শুধুমাত্র PDF ফাইল আপলোড করা যাবে");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ১৫ MB-এর বেশি হওয়া যাবে না");
      return;
    }
    
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `results/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("cms-attachments")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      
      setPdfUrl(path);
      setPdfName(file.name);
      toast.success("PDF আপলোড সম্পন্ন");
    } catch (err: any) {
      toast.error(err.message ?? "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !examYear.trim()) {
      toast.error("শিরোনাম ও বছর দিন");
      return;
    }
    if (!pdfUrl) {
      toast.error("একটি PDF ফাইল আপলোড করতে হবে");
      return;
    }
    
    setSaving(true);
    const payload = {
      title: title.trim(),
      exam_year: examYear.trim(),
      pdf_url: pdfUrl,
      published_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("results").insert(payload);
      if (error) throw error;
      toast.success("ফলাফল প্রকাশিত হয়েছে");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">নতুন ফলাফল আপলোড</DialogTitle>
          <DialogDescription>
            ফলাফলের বিস্তারিত এবং PDF ফাইল আপলোড করুন
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ফলাফলের শিরোনাম *</Label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="যেমন: ৩য় ও ৪র্থ বর্ষের চুড়ান্ত ফলাফল"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">পরীক্ষার বছর *</Label>
            <Select value={examYear} onValueChange={setExamYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = (new Date().getFullYear() - i).toString();
                  return <SelectItem key={y} value={y}>{y}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>রেজাল্ট PDF ফাইল *</Label>
            {pdfUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-emerald-500/5 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30">
                  <FileText size={18} className="text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{pdfName}</div>
                  <div className="text-[10px] text-emerald-600">আপলোড সম্পন্ন হয়েছে</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setPdfUrl(null); setPdfName(null); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-sm text-muted-foreground transition hover:border-emerald-500/40 hover:bg-emerald-500/5">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> আপলোড হচ্ছে...</>
                ) : (
                  <><Upload size={18} /> PDF ফাইল নির্বাচন করুন <span className="text-[11px]">(max 15MB)</span></>
                )}
                <input type="file" className="hidden" accept=".pdf" onChange={handleFile} disabled={uploading} />
              </label>
            )}
          </div>

          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-4 text-sm font-semibold text-white shadow-soft transition hover:shadow-elegant disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={15} />}
              প্রকাশ করুন
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
