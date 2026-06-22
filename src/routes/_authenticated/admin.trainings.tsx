// @ts-nocheck
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
  Search,
  CheckCircle2,
  GraduationCap,
  Upload,
  X,
  Loader2,
  ExternalLink,
  BookOpen,
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
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/trainings")({
  beforeLoad: ensureAdmin,
  component: AdminTrainings,
});

interface TrainingItem {
  id: string;
  title: string;
  category: string | null;
  duration: string | null;
  syllabus_url: string | null;
  created_at: string;
}

function AdminTrainings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TrainingItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TrainingItem | null>(null);

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["admin-trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TrainingItem[];
    },
  });

  const filtered = useMemo(() => {
    return trainings.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [trainings, search]);

  const deleteMut = useMutation({
    mutationFn: async (t: TrainingItem) => {
      if (t.syllabus_url) {
        const path = getAttachmentPath(t.syllabus_url);
        if (path) {
          await supabase.storage.from("cms-attachments").remove([path]);
        }
      }
      const { error } = await supabase.from("trainings").delete().eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("কোর্স মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="প্রশিক্ষণ"
      title="প্রশিক্ষণ কোর্স ম্যানেজমেন্ট"
      subtitle="শিক্ষক প্রশিক্ষণ কোর্স ও সিলেবাস পরিচালনা করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন কোর্স
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কোর্সের নাম দিয়ে খুঁজুন..."
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
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো কোর্স নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের বোতাম থেকে নতুন প্রশিক্ষণ কোর্স যোগ করুন
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((t) => (
              <li
                key={t.id}
                onClick={() => setEditing(t)}
                className="group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pink-500/10 text-pink-600 ring-1 ring-pink-500/30">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold text-foreground">
                    {t.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    {t.category && (
                      <span className="font-medium text-pink-600 dark:text-pink-500">
                        ক্যাটাগরি: {t.category}
                      </span>
                    )}
                    {t.duration && (
                      <span>মেয়াদ: {t.duration}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {t.syllabus_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        const url = await resolveAttachmentUrl(t.syllabus_url!, 600);
                        if (url) window.open(url, "_blank");
                      }}
                      title="সিলেবাস দেখুন"
                      className="grid h-9 w-9 place-items-center rounded-lg text-primary transition hover:bg-primary/10"
                    >
                      <BookOpen size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    title="Edit"
                    className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(t)}
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

      <TrainingFormDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        training={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>কোর্সটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.title}"</strong> — এই কোর্স ও এর সিলেবাস স্থায়ীভাবে মুছে যাবে।
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

function TrainingFormDialog({
  open,
  training,
  onClose,
  onSaved,
}: {
  open: boolean;
  training: TrainingItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!training;
  const [title, setTitle] = useState(training?.title ?? "");
  const [category, setCategory] = useState(training?.category ?? "প্রাথমিক");
  const [duration, setDuration] = useState(training?.duration ?? "৪ সপ্তাহ");
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(training?.syllabus_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("শুধুমাত্র PDF ফাইল আপলোড করা যাবে");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `trainings/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("cms-attachments")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      setSyllabusUrl(path);
      toast.success("সিলেবাস আপলোড সম্পন্ন");
    } catch (err: any) {
      toast.error(err.message ?? "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("কোর্সের শিরোনাম দিন");
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      category: category.trim() || null,
      duration: duration.trim() || null,
      syllabus_url: syllabusUrl,
    };

    try {
      if (isEdit && training) {
        const { error } = await supabase.from("trainings").update(payload).eq("id", training.id);
        if (error) throw error;
        toast.success("কোর্স আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("trainings").insert(payload);
        if (error) throw error;
        toast.success("কোর্স যোগ করা হয়েছে");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "কোর্স এডিট করুন" : "নতুন কোর্স"}
          </DialogTitle>
          <DialogDescription>
            কোর্সের বিস্তারিত এবং সিলেবাস (PDF) যুক্ত করুন
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">কোর্সের নাম *</Label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="যেমন: মুয়াল্লিম প্রশিক্ষণ কোর্স"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ক্যাটাগরি</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="প্রাথমিক">প্রাথমিক</SelectItem>
                  <SelectItem value="উচ্চতর">উচ্চতর</SelectItem>
                  <SelectItem value="বিশেষ">বিশেষ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">মেয়াদ</Label>
              <input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                placeholder="যেমন: ৪৫ দিন"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>সিলেবাস (PDF)</Label>
            {syllabusUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-pink-500/5 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/30">
                  <BookOpen size={18} className="text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-pink-600">সিলেবাস আপলোড হয়েছে</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSyllabusUrl(null)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground transition hover:border-pink-500/40 hover:bg-pink-500/5">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> আপলোড হচ্ছে...</>
                ) : (
                  <><Upload size={16} /> PDF সিলেবাস আপলোড করুন <span className="text-[11px]">(max 10MB)</span></>
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
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-pink-800 px-4 text-sm font-semibold text-white shadow-soft transition hover:shadow-elegant disabled:opacity-60"
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
