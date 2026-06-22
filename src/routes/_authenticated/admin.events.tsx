import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  Loader2,
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

export const Route = createFileRoute("/_authenticated/admin/events")({
  beforeLoad: ensureAdmin,
  component: AdminEvents,
});

type Status = "upcoming" | "completed" | "cancelled";

interface EventItem {
  id: string;
  title: string;
  date: string | null;
  location: string | null;
  description: string | null;
  status: Status;
  created_at: string;
}

const statusMeta: Record<Status, { label: string; tone: string; icon: any }> = {
  upcoming: { label: "আসন্ন", tone: "bg-blue-500/10 text-blue-700 ring-blue-500/30", icon: Clock },
  completed: { label: "সম্পন্ন", tone: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30", icon: CheckCircle2 },
  cancelled: { label: "বাতিল", tone: "bg-red-500/10 text-red-700 ring-red-500/30", icon: XCircle },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("bn-BD", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function AdminEvents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EventItem | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as EventItem[];
    },
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, filterStatus]);

  const deleteMut = useMutation({
    mutationFn: async (e: EventItem) => {
      const { error } = await supabase.from("events").delete().eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ইভেন্ট মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="ইভেন্ট"
      title="ইভেন্ট ম্যানেজমেন্ট"
      subtitle="সেমিনার, প্রোগ্রাম এবং অন্যান্য ইভেন্ট পরিচালনা করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন ইভেন্ট
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
            placeholder="ইভেন্টের নাম দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="upcoming">আসন্ন</SelectItem>
            <SelectItem value="completed">সম্পন্ন</SelectItem>
            <SelectItem value="cancelled">বাতিল</SelectItem>
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
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো ইভেন্ট নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের "নতুন ইভেন্ট" বোতাম থেকে প্রথম ইভেন্টটি তৈরি করুন
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((e) => {
              const StatusIcon = statusMeta[e.status].icon;
              return (
                <li
                  key={e.id}
                  onClick={() => setEditing(e)}
                  className="group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusMeta[e.status].tone}`}>
                        <StatusIcon size={10} /> {statusMeta[e.status].label}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate font-display font-bold text-foreground">{e.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} /> {fmtDate(e.date)}
                      </span>
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setEditing(e)}
                      title="Edit"
                      className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(e)}
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

      <EventFormDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        event={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-events"] });
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ইভেন্টটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.title}"</strong> — এই ইভেন্টটি স্থায়ীভাবে মুছে যাবে।
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

function EventFormDialog({
  open,
  event,
  onClose,
  onSaved,
}: {
  open: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [status, setStatus] = useState<Status>(event?.status ?? "upcoming");
  const [date, setDate] = useState<string>(
    event?.date ? toLocalInput(event.date) : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("শিরোনাম দিন");
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      status,
      date: date ? new Date(date).toISOString() : null,
    };

    try {
      if (isEdit && event) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
        toast.success("ইভেন্ট আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast.success("ইভেন্ট তৈরি হয়েছে");
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
            {isEdit ? "ইভেন্ট এডিট করুন" : "নতুন ইভেন্ট"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">ইভেন্টের নাম *</Label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="যেমন: জাতীয় শিক্ষক সেমিনার ২০২৬"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
               <Label htmlFor="date">তারিখ ও সময়</Label>
               <input
                 id="date"
                 type="datetime-local"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
               />
            </div>
            <div className="space-y-1.5">
               <Label>স্ট্যাটাস</Label>
               <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="upcoming">আসন্ন (Upcoming)</SelectItem>
                   <SelectItem value="completed">সম্পন্ন (Completed)</SelectItem>
                   <SelectItem value="cancelled">বাতিল (Cancelled)</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">স্থান / ঠিকানা</Label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="যেমন: কাজলা, যাত্রাবাড়ী, ঢাকা"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">বিস্তারিত বিবরণ</Label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="প্রোগ্রামের আলোচ্য সূচি বা অন্যান্য তথ্য..."
            />
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
              disabled={saving}
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
