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
  MapPin,
  Phone,
  Building2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

export const Route = createFileRoute("/_authenticated/admin/centers")({
  beforeLoad: ensureAdmin,
  component: AdminCenters,
});

interface CenterItem {
  id: string;
  name: string;
  division: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

const divisions = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ"];

function AdminCenters() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CenterItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CenterItem | null>(null);

  const { data: centers = [], isLoading } = useQuery({
    queryKey: ["admin-centers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as CenterItem[];
    },
  });

  const filtered = useMemo(() => {
    return centers.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.division && c.division.includes(search))) return false;
      return true;
    });
  }, [centers, search]);

  const deleteMut = useMutation({
    mutationFn: async (c: CenterItem) => {
      const { error } = await supabase.from("centers").delete().eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("কেন্দ্রটি মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-centers"] });
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="সেন্টার"
      title="প্রশিক্ষণ কেন্দ্রসমূহ"
      subtitle="দেশজুড়ে বেফাক অনুমোদিত প্রশিক্ষণ কেন্দ্রগুলো পরিচালনা করুন"
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন কেন্দ্র
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কেন্দ্রের নাম বা বিভাগ দিয়ে খুঁজুন..."
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
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো কেন্দ্র নেই</p>
            <p className="text-sm text-muted-foreground">
              উপরের বোতাম থেকে নতুন কেন্দ্র যোগ করুন
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/70">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between bg-card p-5 transition hover:bg-muted/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display font-bold text-foreground leading-tight">{c.name}</h3>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => setEditing(c)}
                        className="p-1.5 text-muted-foreground hover:bg-muted rounded hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        className="p-1.5 text-muted-foreground hover:bg-destructive/10 rounded hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {c.division && (
                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-orange-500/80" />
                        <span>বিভাগ: {c.division}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-2">
                        <Building2 size={15} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <Phone size={14} className="shrink-0" />
                        {c.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CenterFormDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        center={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-centers"] });
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>কেন্দ্রটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">"{deleting?.name}"</strong> — এই কেন্দ্রটি ডাটাবেস থেকে মুছে যাবে।
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

function CenterFormDialog({
  open,
  center,
  onClose,
  onSaved,
}: {
  open: boolean;
  center: CenterItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!center;
  const [name, setName] = useState(center?.name ?? "");
  const [division, setDivision] = useState(center?.division ?? "");
  const [address, setAddress] = useState(center?.address ?? "");
  const [phone, setPhone] = useState(center?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("কেন্দ্রের নাম দিন");
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      division: division.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
    };

    try {
      if (isEdit && center) {
        const { error } = await supabase.from("centers").update(payload).eq("id", center.id);
        if (error) throw error;
        toast.success("কেন্দ্র আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("centers").insert(payload);
        if (error) throw error;
        toast.success("কেন্দ্র যোগ করা হয়েছে");
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
            {isEdit ? "কেন্দ্র আপডেট করুন" : "নতুন কেন্দ্র যোগ করুন"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">কেন্দ্রের নাম *</Label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="যেমন: যাত্রাবাড়ী জামিয়া ইসলামিয়া"
            />
          </div>

          <div className="space-y-1.5">
            <Label>বিভাগ</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                {divisions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">ঠিকানা</Label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="কেন্দ্রের বিস্তারিত ঠিকানা..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">যোগাযোগের নম্বর</Label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              placeholder="০১৭..."
            />
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
              disabled={saving}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-700 px-4 text-sm font-semibold text-white shadow-soft transition hover:shadow-elegant disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={15} />}
              {isEdit ? "আপডেট করুন" : "যোগ করুন"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
