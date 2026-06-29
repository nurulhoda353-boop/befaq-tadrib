import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Trash2,
  Search,
  MessageSquare,
  Mail,
  CheckCircle2,
  Loader2,
  Inbox,
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

export const Route = createFileRoute("/_authenticated/admin/messages")({
  beforeLoad: ensureAdmin,
  component: AdminMessages,
});

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("bn-BD", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function AdminMessages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all");
  const [reading, setReading] = useState<MessageItem | null>(null);
  const [deleting, setDeleting] = useState<MessageItem | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MessageItem[];
    },
  });

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filterRead === "read" && !m.is_read) return false;
      if (filterRead === "unread" && m.is_read) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [messages, search, filterRead]);

  const markReadMut = useMutation({
    mutationFn: async (m: MessageItem) => {
      if (m.is_read) return; // Already read
      const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (m: MessageItem) => {
      const { error } = await supabase.from("messages").delete().eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("মেসেজ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setDeleting(null);
      if (reading?.id === deleting?.id) setReading(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="যোগাযোগ"
      title="ইউজার মেসেজ"
      subtitle="ওয়েবসাইটের কন্টাক্ট ফর্ম থেকে আসা মেসেজগুলো পড়ুন"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <Select value={filterRead} onValueChange={(v) => setFilterRead(v as any)}>
          <SelectTrigger className="h-10 w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব মেসেজ</SelectItem>
            <SelectItem value="unread">আনরিড (Unread)</SelectItem>
            <SelectItem value="read">রিড (Read)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">কোনো মেসেজ নেই</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((m) => (
              <li
                key={m.id}
                onClick={() => {
                  setReading(m);
                  if (!m.is_read) markReadMut.mutate(m);
                }}
                className={`group flex cursor-pointer flex-col gap-3 p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center ${!m.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="min-w-0 flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">{m.name}</span>
                    {!m.is_read && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        নতুন
                      </span>
                    )}
                  </div>
                  <h3 className={`truncate text-sm ${!m.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                    {m.subject || "কোনো বিষয় উল্লেখ নেই"}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground mt-0.5">
                    {m.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={11} /> {m.email}
                    </span>
                    <span>{fmtDate(m.created_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 pr-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setDeleting(m)}
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

      {/* Reading Dialog */}
      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{reading?.subject || "যোগাযোগ মেসেজ"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-muted/40 p-4">
              <div className="flex flex-col gap-1 text-sm border-b border-border/50 pb-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{reading?.name}</span>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(reading?.created_at ?? null)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={13} /> {reading?.email}
                </div>
              </div>
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {reading?.message}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => reading && setDeleting(reading)}
              className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 size={14} /> মুছে ফেলুন
            </button>
            <button
              type="button"
              onClick={() => setReading(null)}
              className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              বন্ধ করুন
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>মেসেজটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই মেসেজটি ডাটাবেস থেকে স্থায়ীভাবে মুছে যাবে।
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
