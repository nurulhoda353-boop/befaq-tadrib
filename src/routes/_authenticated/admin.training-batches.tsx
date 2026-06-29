import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, Search, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/training-batches")({
  beforeLoad: ensureAdmin,
  component: AdminTrainingBatches,
});

function AdminTrainingBatches() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<any | null>(null);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["admin-training-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_batches")
        .select("*, trainings(title), centers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ["admin-trainings-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("id, title");
      if (error) throw error;
      return data;
    },
  });

  const { data: centers = [] } = useQuery({
    queryKey: ["admin-centers-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (search && !b.batch_number?.toLowerCase().includes(search.toLowerCase()) && !b.trainings?.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [batches, search]);

  const deleteMut = useMutation({
    mutationFn: async (t: any) => {
      const { error } = await supabase.from("training_batches").delete().eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ব্যাচ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-training-batches"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell breadcrumb="কন্টেন্ট" current="ব্যাচ" title="ব্যাচ ম্যানেজমেন্ট" subtitle="প্রশিক্ষণ কোর্সগুলোর ব্যাচ পরিচালনা করুন" actions={
      <button onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant">
        <Plus size={15} /> নতুন ব্যাচ
      </button>
    }>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ব্যাচ বা কোর্সের নাম দিয়ে খুঁজুন..." className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted"><Calendar className="h-6 w-6 text-muted-foreground" /></div>
            <p className="font-medium text-foreground">কোনো ব্যাচ নেই</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((b) => (
              <li key={b.id} onClick={() => setEditing(b)} className="group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold text-foreground">{b.batch_number} - {b.trainings?.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>শুরু: {b.start_date || '-'}</span>
                    <span>আসন: {b.total_seats}</span>
                    <span className="capitalize">স্ট্যাটাস: {b.status}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => setEditing(b)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Pencil size={15} /></button>
                  <button type="button" onClick={() => setDeleting(b)} className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BatchFormDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        batch={editing}
        trainings={trainings}
        centers={centers}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-training-batches"] })}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>মুছে ফেলবেন?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMut.mutate(deleting)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "হ্যাঁ, মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function BatchFormDialog({ open, batch, trainings, centers, onClose, onSaved }: any) {
  const isEdit = !!batch;
  const [trainingId, setTrainingId] = useState(batch?.training_id ?? "");
  const [batchNumber, setBatchNumber] = useState(batch?.batch_number ?? "");
  const [startDate, setStartDate] = useState(batch?.start_date ?? "");
  const [endDate, setEndDate] = useState(batch?.end_date ?? "");
  const [totalSeats, setTotalSeats] = useState(batch?.total_seats ?? 0);
  const [centerId, setCenterId] = useState(batch?.center_id ?? "");
  const [fee, setFee] = useState(batch?.fee ?? 0);
  const [foodFee, setFoodFee] = useState(batch?.food_fee ?? 0);
  const [status, setStatus] = useState(batch?.status ?? "upcoming");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trainingId || !batchNumber) { toast.error("প্রয়োজনীয় তথ্য দিন"); return; }
    setSaving(true);

    const payload = {
      training_id: trainingId,
      batch_number: batchNumber,
      start_date: startDate || null,
      end_date: endDate || null,
      total_seats: Number(totalSeats),
      center_id: centerId || null,
      fee: Number(fee),
      food_fee: Number(foodFee),
      status: status,
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from("training_batches").update(payload).eq("id", batch.id);
        if (error) throw error;
        toast.success("আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("training_batches").insert(payload);
        if (error) throw error;
        toast.success("যোগ করা হয়েছে");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "ব্যাচ এডিট" : "নতুন ব্যাচ"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>কোর্স *</Label>
              <Select value={trainingId} onValueChange={setTrainingId}>
                <SelectTrigger><SelectValue placeholder="কোর্স নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  {trainings.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>ব্যাচ নম্বর *</Label>
              <input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" placeholder="e.g. 1st Batch" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>শুরুর তারিখ</Label>
              <input value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
            </div>
            <div className="space-y-1.5">
              <Label>শেষের তারিখ</Label>
              <input value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>আসন সংখ্যা</Label>
              <input type="number" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
            </div>
            <div className="space-y-1.5">
              <Label>কেন্দ্র</Label>
              <Select value={centerId} onValueChange={setCenterId}>
                <SelectTrigger><SelectValue placeholder="কেন্দ্র" /></SelectTrigger>
                <SelectContent>
                  {centers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>কোর্স ফি</Label>
              <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
            </div>
            <div className="space-y-1.5">
              <Label>খাবার ফি</Label>
              <input type="number" value={foodFee} onChange={e => setFoodFee(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>স্ট্যাটাস</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">আসন্ন</SelectItem>
                <SelectItem value="running">চলমান</SelectItem>
                <SelectItem value="completed">সম্পন্ন</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted">বাতিল</button>
            <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "সংরক্ষণ"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
