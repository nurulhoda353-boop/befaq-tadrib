import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { Search, CheckCircle2, XCircle, Loader2, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/training-admissions")({
  beforeLoad: ensureAdmin,
  component: AdminTrainingAdmissions,
});

function AdminTrainingAdmissions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admin-training-admissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_admissions")
        .select(`
          *,
          training_batches(
            batch_number,
            trainings(title)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return admissions.filter((a) => {
      if (filterStatus !== "all" && a.application_status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.applicant_name.toLowerCase().includes(q) || a.phone.includes(q) || a.training_batches?.trainings?.title?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [admissions, search, filterStatus]);

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("training_admissions").update({ application_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-training-admissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePaymentMut = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("training_admissions").update({ payment_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("পেমেন্ট স্ট্যাটাস আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-training-admissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell breadcrumb="কন্টেন্ট" current="ভর্তি আবেদন" title="ভর্তি আবেদনসমূহ" subtitle="প্রশিক্ষণ কোর্সের সকল ভর্তি আবেদন">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, মোবাইল বা কোর্স দিয়ে খুঁজুন..." className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-card h-10"><SelectValue placeholder="সব স্ট্যাটাস" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="pending">অপেক্ষমান</SelectItem>
              <SelectItem value="approved">অনুমোদিত</SelectItem>
              <SelectItem value="rejected">বাতিল</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted"><Users className="h-6 w-6 text-muted-foreground" /></div>
            <p className="font-medium text-foreground">কোনো আবেদন নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">আবেদনকারী</th>
                  <th className="p-4 font-medium">কোর্স ও ব্যাচ</th>
                  <th className="p-4 font-medium">পেমেন্ট</th>
                  <th className="p-4 font-medium">স্ট্যাটাস</th>
                  <th className="p-4 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{a.applicant_name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{a.training_batches?.trainings?.title}</div>
                      <div className="text-[11px] text-muted-foreground">ব্যাচ: {a.training_batches?.batch_number}</div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={a.payment_status} 
                        onChange={(e) => updatePaymentMut.mutate({ id: a.id, status: e.target.value })}
                        disabled={updatePaymentMut.isPending}
                        className="bg-transparent border border-border rounded px-2 py-1 text-xs"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select 
                        value={a.application_status} 
                        onChange={(e) => updateStatusMut.mutate({ id: a.id, status: e.target.value })}
                        disabled={updateStatusMut.isPending}
                        className={`bg-transparent border border-border rounded px-2 py-1 text-xs font-semibold ${
                          a.application_status === 'approved' ? 'text-green-600' : a.application_status === 'rejected' ? 'text-red-600' : 'text-orange-500'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setViewing(a)} className="inline-flex items-center gap-1 text-primary hover:underline text-xs"><Eye size={14} /> বিস্তারিত</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>আবেদনের বিস্তারিত</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">নাম</div>
                  <div className="font-medium">{viewing.applicant_name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">মোবাইল</div>
                  <div className="font-medium">{viewing.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs">মাদরাসা</div>
                  <div className="font-medium">{viewing.madrasa_name || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs">কোর্স</div>
                  <div className="font-medium">{viewing.training_batches?.trainings?.title} ({viewing.training_batches?.batch_number})</div>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="text-sm font-semibold mb-2">অতিরিক্ত তথ্য (Form Data)</div>
                <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-auto max-h-[200px]">
                  {JSON.stringify(viewing.form_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
