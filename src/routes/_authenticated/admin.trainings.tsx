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
  Clock,
  Users,
  Wallet,
  MapPin,
  Tag,
  Target,
  Award,
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
  slug: string | null;
  type: string | null;
  category: string | null;
  duration: string | null;
  subject: string | null;
  target_group: string | null;
  location: string | null;
  schedule: string | null;
  fee: string | null;
  description: string | null;
  syllabus: string[] | null;
  eligibility: string[] | null;
  syllabus_url: string | null;
  created_at: string;
}

function AdminTrainingCard({ t, onEdit, onDelete }: { t: TrainingItem; onEdit: () => void; onDelete: () => void }) {
  if (t.type === 'special') {
    return (
      <div onClick={onEdit} className="group cursor-pointer relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-gold/30 hover:shadow-[0_15px_30px_-15px_rgba(212,175,55,0.15)]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-bright border border-gold/20 transition-transform group-hover:scale-110">
            <GraduationCap size={22} />
          </div>
          <div className="flex gap-2">
            {t.location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-white/70 border border-white/5">
                <MapPin size={10} /> {t.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white/80 border border-white/5">
              {t.duration || "-"}
            </span>
          </div>
        </div>
        
        <h4 className="font-extrabold text-[1.15rem] text-white leading-snug group-hover:text-gold-bright transition-colors">{t.title}</h4>
        <p className="mt-3 text-[13px] font-medium leading-relaxed text-white/50 line-clamp-3 flex-1">{t.description || "কোনো বিবরণ নেই"}</p>
        
        <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
          {t.syllabus_url ? (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const url = await resolveAttachmentUrl(t.syllabus_url!, 600);
                if (url) window.open(url, "_blank");
              }}
              title="সিলেবাস দেখুন"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gold/10 px-3 text-[11px] font-bold text-gold-bright transition hover:bg-gold hover:text-dark-luxe"
            >
              <BookOpen size={13} /> সিলেবাস
            </button>
          ) : (
            <span className="text-[11px] text-white/30 italic font-medium px-2">সিলেবাস নেই</span>
          )}

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              title="এডিট করুন"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/20 hover:text-white shadow-sm"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="মুছে ফেলুন"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-red-400 transition hover:bg-red-500 hover:text-white shadow-sm"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGold = t.type === 'central';
  return (
    <div onClick={onEdit} className={`group cursor-pointer relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] hover:border-${isGold ? 'gold' : 'primary'}/30`}>
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isGold ? 'bg-gold' : 'bg-primary'} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex gap-4 pl-2">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isGold ? 'bg-dark-luxe dark:bg-gold/10 text-gold-bright' : 'bg-primary/10 text-primary-dark dark:text-primary'} shadow-md transition-transform group-hover:scale-110`}>
          <GraduationCap size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">{t.title}</h4>
          <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1"><MapPin size={12} className={isGold ? "text-gold-dark dark:text-gold" : "text-primary"}/> {t.location || "-"}</span>
            <span className="flex items-center gap-1"><Clock size={12} className={isGold ? "text-gold-dark dark:text-gold" : "text-primary"}/> {t.duration || "-"}</span>
            <span className="flex items-center gap-1"><Users size={12} className={isGold ? "text-gold-dark dark:text-gold" : "text-primary"}/> {t.target_group || "-"}</span>
          </div>
          <p className="mt-3 text-[13px] font-medium text-muted-foreground line-clamp-2 leading-relaxed">{t.description || "কোনো বিবরণ নেই"}</p>
          
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            {t.syllabus_url ? (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const url = await resolveAttachmentUrl(t.syllabus_url!, 600);
                  if (url) window.open(url, "_blank");
                }}
                title="সিলেবাস দেখুন"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                <BookOpen size={13} /> সিলেবাস
              </button>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic font-medium px-2">সিলেবাস নেই</span>
            )}

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="grid h-8 w-8 place-items-center rounded-lg bg-background/50 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground shadow-sm"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="grid h-8 w-8 place-items-center rounded-lg bg-background/50 text-destructive transition hover:bg-destructive hover:text-destructive-foreground shadow-sm"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminTrainings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
      const matchSearch = search ? t.title.toLowerCase().includes(search.toLowerCase()) || (t.location && t.location.toLowerCase().includes(search.toLowerCase())) : true;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchType && matchCategory;
    });
  }, [trainings, search, typeFilter, categoryFilter]);

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
      toast.success("প্রশিক্ষণ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="প্রশিক্ষণ"
      title="প্রশিক্ষণ ম্যানেজমেন্ট"
      subtitle="শিক্ষক প্রশিক্ষণ ও সিলেবাস পরিচালনা করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন প্রশিক্ষণ
        </button>
      }
    >
      {/* Filter System */}
      <div className="mb-6 rounded-2xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-xl flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="প্রশিক্ষণের নাম বা লোকেশন দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-border/50 bg-background/50 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-full md:w-[150px] rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="সব ধরণ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ধরণ</SelectItem>
              <SelectItem value="central">কেন্দ্রীয়</SelectItem>
              <SelectItem value="regional">আঞ্চলিক</SelectItem>
              <SelectItem value="special">বিশেষ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full md:w-[150px] rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="সব ক্যাটাগরি" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
              <SelectItem value="প্রাথমিক">প্রাথমিক</SelectItem>
              <SelectItem value="উচ্চতর">উচ্চতর</SelectItem>
              <SelectItem value="বিশেষ">বিশেষ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো প্রশিক্ষণ নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের বোতাম থেকে নতুন প্রশিক্ষণ যোগ করুন
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {filtered.filter(t => t.type === 'central').length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold-dark"><Award size={18}/></div>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">কেন্দ্রীয় প্রশিক্ষণ</h3>
                  <span className="ml-auto rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[11px] font-bold text-primary-dark">{filtered.filter(t => t.type === 'central').length}টি প্রশিক্ষণ</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.filter(t => t.type === 'central').map((t) => <AdminTrainingCard key={t.id} t={t} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />)}
                </div>
              </div>
            )}
            
            {filtered.filter(t => t.type === 'regional').length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary-dark"><MapPin size={18}/></div>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">আঞ্চলিক প্রশিক্ষণ</h3>
                  <span className="ml-auto rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[11px] font-bold text-primary-dark">{filtered.filter(t => t.type === 'regional').length}টি প্রশিক্ষণ</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.filter(t => t.type === 'regional').map((t) => <AdminTrainingCard key={t.id} t={t} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />)}
                </div>
              </div>
            )}

            {filtered.filter(t => t.type === 'special').length > 0 && (
              <div className="dark space-y-6 rounded-3xl border border-gold/20 bg-dark-luxe p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-2 relative z-10">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold-bright ring-1 ring-gold/20 shadow-inner"><Target size={22}/></div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">শাবান ও রমাদান <span className="bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">মহা আয়োজন</span></h3>
                    <p className="text-sm font-medium text-white/60 mt-0.5">বাৎসরিক স্পেশাল ইভেন্ট</p>
                  </div>
                  <span className="ml-auto rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-gold-bright">{filtered.filter(t => t.type === 'special').length}টি প্রশিক্ষণ</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10">
                  {filtered.filter(t => t.type === 'special').map((t) => <AdminTrainingCard key={t.id} t={t} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />)}
                </div>
              </div>
            )}
          </div>
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
            <AlertDialogTitle>প্রশিক্ষণটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.title}"</strong> — এই প্রশিক্ষণ ও এর সিলেবাস স্থায়ীভাবে মুছে যাবে।
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
  const [slug, setSlug] = useState(training?.slug ?? "");
  const [type, setType] = useState(training?.type ?? "central");
  const [category, setCategory] = useState(training?.category ?? "প্রাথমিক");
  const [duration, setDuration] = useState(training?.duration ?? "৪ সপ্তাহ");
  const [subject, setSubject] = useState(training?.subject ?? "");
  const [targetGroup, setTargetGroup] = useState(training?.target_group ?? "");
  const [location, setLocation] = useState(training?.location ?? "");
  const [schedule, setSchedule] = useState(training?.schedule ?? "");
  const [fee, setFee] = useState(training?.fee ?? "");
  const [description, setDescription] = useState(training?.description ?? "");
  
  // Arrays managed as newline separated strings in textarea
  const [syllabusText, setSyllabusText] = useState((training?.syllabus || []).join("\n"));
  const [eligibilityText, setEligibilityText] = useState((training?.eligibility || []).join("\n"));

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
      toast.error("প্রশিক্ষণের শিরোনাম দিন");
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
      type: type,
      category: category.trim() || null,
      duration: duration.trim() || null,
      subject: subject.trim() || null,
      target_group: targetGroup.trim() || null,
      location: location.trim() || null,
      schedule: schedule.trim() || null,
      fee: fee.trim() || null,
      description: description.trim() || null,
      syllabus: syllabusText.split("\n").map(s => s.trim()).filter(Boolean),
      eligibility: eligibilityText.split("\n").map(s => s.trim()).filter(Boolean),
      syllabus_url: syllabusUrl,
    };

    try {
      if (isEdit && training) {
        const { error } = await supabase.from("trainings").update(payload).eq("id", training.id);
        if (error) throw error;
        toast.success("প্রশিক্ষণ আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("trainings").insert(payload);
        if (error) throw error;
        toast.success("প্রশিক্ষণ যোগ করা হয়েছে");
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
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 gap-0">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl font-bold flex items-center gap-2">
              {isEdit ? (
                <><Pencil className="h-5 w-5 text-primary" /> প্রশিক্ষণ এডিট করুন</>
              ) : (
                <><Plus className="h-5 w-5 text-primary" /> নতুন প্রশিক্ষণ যোগ করুন</>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              প্রশিক্ষণের বিস্তারিত তথ্য, ফি, শিডিউল এবং সিলেবাস (PDF) যুক্ত করুন
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-card">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/50">
            <h3 className="text-sm font-bold tracking-widest text-primary uppercase flex items-center gap-2 border-b border-border/50 pb-3">
              <BookOpen size={16} /> প্রাথমিক তথ্য
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground/80 font-semibold">প্রশিক্ষণের নাম <span className="text-destructive">*</span></Label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: মুয়াল্লিম প্রশিক্ষণ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-foreground/80 font-semibold">স্লাগ (URL)</Label>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: muallim-training"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">ধরণ (Type)</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">কেন্দ্রীয়</SelectItem>
                    <SelectItem value="regional">আঞ্চলিক</SelectItem>
                    <SelectItem value="special">বিশেষ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">ক্যাটাগরি</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="প্রাথমিক">প্রাথমিক</SelectItem>
                    <SelectItem value="উচ্চতর">উচ্চতর</SelectItem>
                    <SelectItem value="বিশেষ">বিশেষ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground/80 font-semibold">মেয়াদ</Label>
                <input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: ৪৫ দিন"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Details & Schedule */}
          <div className="space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/50">
            <h3 className="text-sm font-bold tracking-widest text-primary uppercase flex items-center gap-2 border-b border-border/50 pb-3">
              <Clock size={16} /> বিস্তারিত ও শিডিউল
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground/80 font-semibold">বিষয়</Label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: নূরানী, হুফফাজ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetGroup" className="text-foreground/80 font-semibold">কারা করতে পারবে?</Label>
                <input
                  id="targetGroup"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: শিক্ষক, ছাত্র"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground/80 font-semibold">লোকেশন</Label>
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: বেফাক নিজস্ব প্রশিক্ষণ সেন্টার"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-foreground/80 font-semibold">শিডিউল</Label>
                <input
                  id="schedule"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: সারাবছর চলমান"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fee" className="text-foreground/80 font-semibold">ফি বিস্তারিত</Label>
                <input
                  id="fee"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="যেমন: ১০০০ টাকা, বা বিনামূল্যে"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground/80 font-semibold">সংক্ষিপ্ত বর্ণনা</Label>
                <input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="প্রশিক্ষণ সম্পর্কে এক লাইনে কিছু লিখুন"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Syllabus & Reqs */}
          <div className="space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/50">
            <h3 className="text-sm font-bold tracking-widest text-primary uppercase flex items-center gap-2 border-b border-border/50 pb-3">
              <Upload size={16} /> সিলেবাস ও যোগ্যতা
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="syllabusText" className="text-foreground/80 font-semibold">সিলেবাসের টপিক (প্রতি লাইনে ১টি)</Label>
                <textarea
                  id="syllabusText"
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm resize-y"
                  placeholder="তাজবীদ ও তাহযীব&#10;শিক্ষাদান পদ্ধতি"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibilityText" className="text-foreground/80 font-semibold">ভর্তির যোগ্যতা (প্রতি লাইনে ১টি)</Label>
                <textarea
                  id="eligibilityText"
                  value={eligibilityText}
                  onChange={(e) => setEligibilityText(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm resize-y"
                  placeholder="মাদ্রাসা পাশ&#10;কুরআন তিলাওয়াতে দক্ষতা"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-foreground/80 font-semibold">বিস্তারিত সিলেবাস (PDF)</Label>
              {syllabusUrl ? (
                <div className="flex items-center gap-4 rounded-xl border border-border bg-primary/5 p-4 shadow-sm">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-primary">সিলেবাস সফলভাবে আপলোড হয়েছে</div>
                    <div className="text-xs text-muted-foreground mt-0.5">আপনি চাইলে এটি ডিলিট করে নতুনটি দিতে পারেন</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyllabusUrl(null)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/50 hover:bg-primary/5 p-8 text-sm text-muted-foreground transition hover:border-primary/40">
                  {uploading ? (
                    <><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="font-medium text-foreground">আপলোড হচ্ছে... একটু অপেক্ষা করুন</span></>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-1">
                        <Upload size={20} />
                      </div>
                      <span className="font-medium text-foreground">PDF সিলেবাস আপলোড করতে ক্লিক করুন</span>
                      <span className="text-[12px] opacity-70">ফাইল সাইজ সর্বোচ্চ 10MB</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFile} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <DialogFooter className="gap-3 sm:justify-end w-full flex-col sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-muted focus:ring-2 focus:ring-border w-full sm:w-auto"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant disabled:opacity-60 w-full sm:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
