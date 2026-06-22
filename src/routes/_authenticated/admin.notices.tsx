import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { getAttachmentPath, resolveAttachmentUrl } from "@/lib/notice-attachment";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Search,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  Paperclip,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/notices")({
  beforeLoad: ensureAdmin,
  component: AdminNotices,
});

type Category = "general" | "urgent" | "admission";
type Status = "draft" | "published" | "scheduled";

interface Notice {
  id: string;
  title: string;
  body: string;
  category: Category;
  status: Status;
  pinned: boolean;
  published_at: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  updated_at: string;
}

const categoryMeta: Record<Category, { label: string; tone: string }> = {
  general: { label: "সাধারণ", tone: "bg-sky-500/10 text-sky-700 ring-sky-500/30" },
  urgent: { label: "জরুরি", tone: "bg-red-500/10 text-red-700 ring-red-500/30" },
  admission: { label: "ভর্তি", tone: "bg-gold/15 text-amber-800 ring-gold/40" },
};

const statusMeta: Record<Status, { label: string; tone: string; icon: typeof Clock }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground ring-border", icon: FileEdit },
  published: { label: "Published", tone: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", tone: "bg-purple-500/10 text-purple-700 ring-purple-500/30", icon: Clock },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("bn-BD", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function AdminNotices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [editing, setEditing] = useState<Notice | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Notice | null>(null);

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["admin-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      if (filterStatus !== "all" && n.status !== filterStatus) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [notices, search, filterStatus]);

  const togglePin = useMutation({
    mutationFn: async (n: Notice) => {
      const { error } = await supabase
        .from("notices")
        .update({ pinned: !n.pinned })
        .eq("id", n.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (n: Notice) => {
      if (n.attachment_url) {
        const path = getAttachmentPath(n.attachment_url);
        if (path) {
          await supabase.storage.from("cms-attachments").remove([path]);
        }
      }
      const { error } = await supabase.from("notices").delete().eq("id", n.id);
      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("নোটিশ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
      queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="নোটিশ"
      title="নোটিশ ম্যানেজমেন্ট"
      subtitle="ঘোষণা, বিজ্ঞপ্তি ও জরুরি তথ্য প্রকাশ করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন নোটিশ
        </button>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="শিরোনাম দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো নোটিশ নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের "নতুন নোটিশ" বোতাম থেকে প্রথম নোটিশটি তৈরি করুন
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((n) => {
              const StatusIcon = statusMeta[n.status].icon;
              return (
                <li
                  key={n.id}
                  onClick={() => setEditing(n)}
                  className="group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 ring-1 ring-gold/30">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${categoryMeta[n.category].tone}`}>
                        {categoryMeta[n.category].label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusMeta[n.status].tone}`}>
                        <StatusIcon size={10} /> {statusMeta[n.status].label}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate font-display font-bold text-foreground">{n.title}</h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span>প্রকাশ: {fmtDate(n.published_at)}</span>
                      {n.attachment_name && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip size={11} /> {n.attachment_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => togglePin.mutate(n)}
                      title={n.pinned ? "Unpin" : "Pin"}
                      className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      {n.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(n)}
                      title="Edit"
                      className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(n)}
                      title="Delete"
                      className="grid h-9 w-9 place-items-center rounded-lg text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create / Edit dialog */}
      <NoticeFormDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        notice={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
          queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নোটিশটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.title}"</strong> — এই নোটিশটি স্থায়ীভাবে মুছে যাবে। কাজটি ফেরানো যাবে না।
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

// -------------------- Form Dialog --------------------

function NoticeFormDialog({
  open,
  notice,
  onClose,
  onSaved,
}: {
  open: boolean;
  notice: Notice | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!notice;
  const [title, setTitle] = useState(notice?.title ?? "");
  const [body, setBody] = useState(notice?.body ?? "");
  const [category, setCategory] = useState<Category>(notice?.category ?? "general");
  const [status, setStatus] = useState<Status>(notice?.status ?? "draft");
  const [pinned, setPinned] = useState(notice?.pinned ?? false);
  const [publishedAt, setPublishedAt] = useState<string>(
    notice?.published_at ? toLocalInput(notice.published_at) : ""
  );
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(notice?.attachment_url ?? null);
  const [attachmentName, setAttachmentName] = useState<string | null>(notice?.attachment_name ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ১০ MB-এর বেশি হওয়া যাবে না");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `notices/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("cms-attachments")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      // Store only the storage path. Short-lived signed URLs are minted on demand
      // so unpublishing a notice immediately revokes file access.
      setAttachmentUrl(path);
      setAttachmentName(file.name);
      toast.success("ফাইল আপলোড সম্পন্ন");
    } catch (err: any) {
      toast.error(err.message ?? "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  }

  async function openAttachment() {
    const url = await resolveAttachmentUrl(attachmentUrl, 60 * 10);
    if (!url) {
      toast.error("ফাইল লিংক তৈরি করা যায়নি");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("শিরোনাম দিন");
      return;
    }
    setSaving(true);

    // Auto-detect scheduled vs published
    let finalStatus: Status = status;
    let finalPublishedAt: string | null = null;
    if (status === "published" || status === "scheduled") {
      finalPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
      if (new Date(finalPublishedAt).getTime() > Date.now()) {
        finalStatus = "scheduled";
      } else {
        finalStatus = "published";
      }
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      category,
      status: finalStatus,
      pinned,
      published_at: finalPublishedAt,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
    };

    try {
      if (isEdit && notice) {
        const { error } = await supabase.from("notices").update(payload).eq("id", notice.id);
        if (error) throw error;
        toast.success("নোটিশ আপডেট হয়েছে");
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("notices")
          .insert({ ...payload, created_by: u.user?.id });
        if (error) throw error;
        toast.success("নোটিশ তৈরি হয়েছে");
      }
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "নোটিশ এডিট করুন" : "নতুন নোটিশ"}
          </DialogTitle>
          <DialogDescription>
            ক্যাটাগরি ও স্ট্যাটাস ঠিক করে প্রকাশ করুন
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">শিরোনাম *</Label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="নোটিশের শিরোনাম..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">বিস্তারিত</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="বিস্তারিত লিখুন..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ক্যাটাগরি</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">সাধারণ</SelectItem>
                  <SelectItem value="urgent">জরুরি</SelectItem>
                  <SelectItem value="admission">ভর্তি</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>স্ট্যাটাস</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (অপ্রকাশিত)</SelectItem>
                  <SelectItem value="published">Published (এখনই প্রকাশ)</SelectItem>
                  <SelectItem value="scheduled">Scheduled (নির্ধারিত তারিখে)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(status === "published" || status === "scheduled") && (
            <div className="space-y-1.5">
              <Label htmlFor="pub">
                প্রকাশের তারিখ {status === "scheduled" && <span className="text-muted-foreground">(ভবিষ্যৎ)</span>}
              </Label>
              <input
                id="pub"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
              <p className="text-[11px] text-muted-foreground">
                খালি রাখলে এখনই প্রকাশ হিসেবে গণ্য হবে
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <Label htmlFor="pinned" className="text-sm font-medium">উপরে আটকে রাখুন (Pinned)</Label>
              <p className="text-[11px] text-muted-foreground">তালিকার সবার উপরে দেখাবে</p>
            </div>
            <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
          </div>

          <div className="space-y-2">
            <Label>সংযুক্তি (PDF / Image)</Label>
            {attachmentUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-background ring-1 ring-border">
                  <FileText size={18} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{attachmentName}</div>
                  <button type="button" onClick={openAttachment} className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                    দেখুন <ExternalLink size={10} />
                  </button>

                </div>
                <button
                  type="button"
                  onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> আপলোড হচ্ছে...</>
                ) : (
                  <><Upload size={16} /> ফাইল বাছাই করুন <span className="text-[11px]">(max 10MB)</span></>
                )}
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFile} disabled={uploading} />
              </label>
            )}
          </div>

          <DialogFooter>
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
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={15} />}
              {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
