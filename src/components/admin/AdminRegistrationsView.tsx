import { useState, useMemo, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Plus,
  Loader2,
  User,
  Hash,
  Users,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Download,
  CalendarDays,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormFieldSchema } from "@/components/admin/FormBuilder";
import { sendConfirmationDetails } from "@/lib/notifications";
import { AdminShell } from "@/components/admin/AdminShell";

type RegStatus = "pending" | "confirmed" | "cancelled";

interface Registration {
  id: string;
  event_id: string;
  form_data: any;
  status: RegStatus;
  serial_no: number | null;
  registration_id: string | null;
  created_by_admin: boolean;
  created_at: string;
}

interface EventShort {
  id: string;
  title: string;
  reg_prefix: string;
  form_schema: FormFieldSchema[];
}

export function AdminRegistrationsView({ tabs }: { tabs: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [viewReg, setViewReg] = useState<Registration | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Advanced State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RegStatus>("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const context = useRouterState({ select: (s) => s.matches.find((m) => m.routeId === '/_authenticated')?.context }) as any;
  const role = context?.role || 'viewer';
  const permissions = context?.permissions || [];
  
  const canDeleteReg = role === 'admin' || permissions.includes('events.full') || permissions.includes('events.manage');

  // Fetch events that have registration enabled
  const { data: allEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["admin-events-reg"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, reg_prefix, form_schema")
        .eq("has_registration", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventShort[];
    },
  });

  const { data: myManagers } = useQuery({
    queryKey: ["my-event-managers"],
    queryFn: async () => {
      if (role === 'admin') return null; // Admins don't need this
      const { data, error } = await supabase.from("event_managers").select("event_id");
      if (error) throw error;
      return data?.map((d: any) => d.event_id) || [];
    },
    enabled: role !== 'admin',
  });

  const events = useMemo(() => {
    if (role === 'admin') return allEvents;
    if (!myManagers) return [];
    return allEvents.filter(e => myManagers.includes(e.id));
  }, [allEvents, role, myManagers]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Fetch registrations for the selected event
  const { data: registrations = [], isLoading: loadingRegs } = useQuery({
    queryKey: ["admin-registrations", selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", selectedEventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!selectedEventId,
  });

  // Default select first event and reset filters
  useMemo(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useMemo(() => {
    setTimeFilter("all");
    setCustomDate("");
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedRows([]);
  }, [selectedEventId]);

  // Mutation to confirm registration
  const confirmMut = useMutation({
    mutationFn: async (regId: string) => {
      if (!selectedEvent) throw new Error("No event selected");

      // Get max serial no
      const { data: maxData, error: maxErr } = await supabase
        .from("event_registrations")
        .select("serial_no")
        .eq("event_id", selectedEvent.id)
        .not("serial_no", "is", null)
        .order("serial_no", { ascending: false })
        .limit(1);

      if (maxErr) throw maxErr;

      const nextSerial = (maxData?.[0]?.serial_no || 0) + 1;
      const prefix = selectedEvent.reg_prefix || "REG";
      const regIdStr = `${prefix}-${String(nextSerial).padStart(3, "0")}`;

      const { error } = await supabase
        .from("event_registrations")
        .update({
          status: "confirmed",
          serial_no: nextSerial,
          registration_id: regIdStr,
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", regId);

      if (error) throw error;

      // Call notification placeholder
      await sendConfirmationDetails(regIdStr, nextSerial, {});

      return { regIdStr, nextSerial };
    },
    onSuccess: (data) => {
      toast.success(`রেজিস্ট্রেশন কনফার্মড! আইডি: ${data.regIdStr}`);
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkConfirmMut = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) throw new Error("No event selected");
      const { data: maxData } = await supabase
        .from("event_registrations")
        .select("serial_no")
        .eq("event_id", selectedEvent.id)
        .not("serial_no", "is", null)
        .order("serial_no", { ascending: false })
        .limit(1);

      let nextSerial = (maxData?.[0]?.serial_no || 0) + 1;
      const prefix = selectedEvent.reg_prefix || "REG";
      const toConfirm = registrations.filter(r => selectedRows.includes(r.id) && r.status !== "confirmed");

      for (const reg of toConfirm) {
        const regIdStr = `${prefix}-${String(nextSerial).padStart(3, "0")}`;
        const { error } = await supabase.from("event_registrations").update({
          status: "confirmed",
          serial_no: nextSerial,
          registration_id: regIdStr,
          confirmed_at: new Date().toISOString(),
        }).eq("id", reg.id);
        if (error) throw error;
        nextSerial++;
      }
    },
    onSuccess: () => {
      toast.success("বাল্ক কনফার্ম সফল হয়েছে");
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkCancelMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_registrations").update({ status: "cancelled" }).in("id", selectedRows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("বাল্ক বাতিল সফল হয়েছে");
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRegMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      setViewReg(null);
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
    },
  });

  const [isEditingData, setIsEditingData] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  
  useMemo(() => {
    if (viewReg) setEditFormData(viewReg.form_data || {});
  }, [viewReg]);

  const saveEditMut = useMutation({
    mutationFn: async () => {
      if (!viewReg) throw new Error("No registration selected");
      const { error } = await supabase.from("event_registrations").update({ form_data: editFormData }).eq("id", viewReg.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("তথ্য আপডেট হয়েছে");
      setIsEditingData(false);
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
      setViewReg({ ...viewReg!, form_data: editFormData });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getPrimaryName = (formData: any) => {
    const keys = Object.keys(formData || {});
    const nameKey = keys.find((k) => k.toLowerCase().includes("নাম") || k.toLowerCase().includes("name"));
    return nameKey ? formData[nameKey] : "অজ্ঞাত নাম";
  };

  const getPrimaryPhone = (formData: any) => {
    const keys = Object.keys(formData || {});
    const phoneKey = keys.find((k) => k.toLowerCase().includes("মোবাইল") || k.toLowerCase().includes("ফোন") || k.toLowerCase().includes("phone") || k.toLowerCase().includes("mobile"));
    return phoneKey ? formData[phoneKey] : "—";
  };

  const filteredRegs = useMemo(() => {
    return registrations.filter((reg) => {
      if (statusFilter !== "all" && reg.status !== statusFilter) return false;
      
      if (timeFilter !== "all") {
        const regDate = new Date(reg.created_at);
        const today = new Date();
        
        if (timeFilter === "today") {
          if (regDate.toDateString() !== today.toDateString()) return false;
        } else if (timeFilter === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (regDate.toDateString() !== yesterday.toDateString()) return false;
        } else if (timeFilter === "last7days") {
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 7);
          if (regDate < last7) return false;
        } else if (timeFilter === "thisMonth") {
          if (regDate.getMonth() !== today.getMonth() || regDate.getFullYear() !== today.getFullYear()) return false;
        } else if (timeFilter === "lastMonth") {
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          if (regDate.getMonth() !== lastMonth.getMonth() || regDate.getFullYear() !== lastMonth.getFullYear()) return false;
        } else if (timeFilter === "thisYear") {
          if (regDate.getFullYear() !== today.getFullYear()) return false;
        } else if (timeFilter === "custom" && customDate) {
          const selectedDate = new Date(customDate);
          if (regDate.toDateString() !== selectedDate.toDateString()) return false;
        }
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(getPrimaryName(reg.form_data)).toLowerCase();
        const phone = String(getPrimaryPhone(reg.form_data)).toLowerCase();
        const id = (reg.registration_id || "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, searchQuery, statusFilter, timeFilter, customDate]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const confirmed = registrations.filter((r) => r.status === "confirmed").length;
    const cancelled = registrations.filter((r) => r.status === "cancelled").length;
    const today = new Date().toDateString();
    const todayNew = registrations.filter((r) => new Date(r.created_at).toDateString() === today).length;
    return { total, pending, confirmed, cancelled, todayNew };
  }, [registrations]);

  const exportToCSV = () => {
    if (filteredRegs.length === 0) return toast.error("এক্সপোর্ট করার মতো কোনো ডেটা নেই");
    
    const allKeys = new Set<string>();
    filteredRegs.forEach((reg) => {
      if (reg.form_data) Object.keys(reg.form_data).forEach((k) => allKeys.add(k));
    });
    
    const headers = ["স্ট্যাটাস", "রেজিস্ট্রেশন আইডি", "সিরিয়াল", "এন্ট্রি বাই", "তারিখ", ...Array.from(allKeys)];
    
    const csvContent = [
      headers.join(","),
      ...filteredRegs.map((reg) => {
        const row = [
          reg.status,
          reg.registration_id || "-",
          reg.serial_no || "-",
          reg.created_by_admin ? "Admin" : "User",
          new Date(reg.created_at).toLocaleDateString(),
          ...Array.from(allKeys).map((k) => {
            let val = reg.form_data?.[k] || "";
            if (typeof val === "string") val = val.replace(/"/g, '""');
            return `"${val}"`;
          })
        ];
        return row.join(",");
      })
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `registrations_${selectedEvent?.title || "event"}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isAllSelected = filteredRegs.length > 0 && selectedRows.length === filteredRegs.length;
  const toggleAll = () => {
    if (isAllSelected) setSelectedRows([]);
    else setSelectedRows(filteredRegs.map((r) => r.id));
  };

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="রেজিস্ট্রেশন"
      actions={
        <button
          onClick={() => {
            if (!selectedEventId) return toast.error("আগে একটি ইভেন্ট সিলেক্ট করুন");
            setIsAddingNew(true);
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন এন্ট্রি (অফলাইন)
        </button>
      }
    >
      {tabs}

      <div className="rounded-xl border border-border bg-card p-4">
        <Label className="text-muted-foreground mb-2 block">ইভেন্ট নির্বাচন করুন</Label>
        {loadingEvents ? (
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        ) : events.length === 0 ? (
          <div className="text-sm text-destructive">কোনো রেজিস্ট্রেশন-এনাবলড ইভেন্ট নেই।</div>
        ) : (
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="h-10 w-full max-w-md bg-background font-semibold">
              <SelectValue placeholder="ইভেন্ট সিলেক্ট করুন" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedEventId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">সর্বমোট</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">কনফার্মড</p>
                  <p className="text-xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-500/10 text-orange-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">অপেক্ষমাণ</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">আজকের নতুন</p>
                  <p className="text-xl font-bold">{stats.todayNew}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Export Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, ফোন বা আইডি দিয়ে খুঁজুন..."
                  className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-10 w-full sm:w-36 bg-card">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                  <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
                  <SelectItem value="confirmed">কনফার্মড</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-10 w-full sm:w-40 bg-card">
                  <SelectValue placeholder="সময়কাল" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল সময়</SelectItem>
                  <SelectItem value="today">আজকে</SelectItem>
                  <SelectItem value="yesterday">গতকাল</SelectItem>
                  <SelectItem value="last7days">গত ৭ দিন</SelectItem>
                  <SelectItem value="thisMonth">এই মাস</SelectItem>
                  <SelectItem value="lastMonth">গত মাস</SelectItem>
                  <SelectItem value="thisYear">এই বছর</SelectItem>
                  <SelectItem value="custom">কাস্টম তারিখ</SelectItem>
                </SelectContent>
              </Select>
              
              {timeFilter === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-10 w-full sm:w-auto rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              )}
              
              <button
                onClick={exportToCSV}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <FileSpreadsheet size={16} className="text-emerald-600" /> এক্সেল ডাউনলোড
              </button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-primary" />
                <span className="text-sm font-semibold text-primary">{selectedRows.length} টি সিলেক্ট করা হয়েছে</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => bulkConfirmMut.mutate()}
                  disabled={bulkConfirmMut.isPending}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {bulkConfirmMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  সব কনফার্ম
                </button>
                <button
                  onClick={() => bulkCancelMut.mutate()}
                  disabled={bulkCancelMut.isPending}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {bulkCancelMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  সব বাতিল
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            {loadingRegs ? (
              <div className="flex justify-center p-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">এই ইভেন্টে কোনো রেজিস্ট্রেশন নেই।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/50 bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                          {isAllSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">নাম ও ফোন</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">স্ট্যাটাস</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">সিরিয়াল / আইডি</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">এন্ট্রি বাই</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredRegs.map((reg) => {
                      const isSelected = selectedRows.includes(reg.id);
                      return (
                      <tr key={reg.id} className={`transition hover:bg-muted/20 ${isSelected ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setSelectedRows(isSelected ? selectedRows.filter(id => id !== reg.id) : [...selectedRows, reg.id])}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{getPrimaryName(reg.form_data)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{getPrimaryPhone(reg.form_data)}</div>
                        </td>
                        <td className="px-4 py-3">
                          {reg.status === "confirmed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 size={12} /> কনফার্মড
                            </span>
                          ) : reg.status === "cancelled" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-600">
                              <XCircle size={12} /> বাতিল
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-[11px] font-bold text-orange-600">
                              <Clock size={12} /> অপেক্ষমাণ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg.serial_no ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-bold text-gold-bright">{reg.registration_id}</span>
                              <span className="text-[10px] text-muted-foreground">ক্রমিক: {reg.serial_no}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg.created_by_admin ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                              <User size={12} /> এডমিন
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">ইউজার</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reg.status === "pending" && (
                              <button
                                onClick={() => confirmMut.mutate(reg.id)}
                                disabled={confirmMut.isPending}
                                className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                কনফার্ম
                              </button>
                            )}
                            <button
                              onClick={() => setViewReg(reg)}
                              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              title="বিস্তারিত ও এডিট"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* View Details Modal */}
      <Dialog open={!!viewReg} onOpenChange={(o) => {
        if (!o) {
          setViewReg(null);
          setIsEditingData(false);
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>রেজিস্ট্রেশনের বিস্তারিত</DialogTitle>
            {viewReg && canDeleteReg && (
              <button
                onClick={() => {
                  if (window.confirm("আপনি কি নিশ্চিত যে এই রেজিস্ট্রেশন মুছে ফেলতে চান?")) {
                    deleteRegMut.mutate(viewReg.id);
                  }
                }}
                disabled={deleteRegMut.isPending}
                className="text-red-500 hover:text-red-700 transition px-2"
                title="মুছে ফেলুন"
              >
                {deleteRegMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4 border-b border-border pb-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">স্ট্যাটাস</p>
                <p className="font-semibold capitalize text-foreground">{viewReg?.status}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">রেজিঃ আইডি</p>
                <p className="font-mono font-bold text-gold-bright">{viewReg?.registration_id || "—"}</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-foreground">প্রদত্ত তথ্যসমূহ:</h4>
                <button 
                  onClick={() => setIsEditingData(!isEditingData)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Pencil size={12} /> {isEditingData ? "ক্যান্সেল এডিট" : "এডিট করুন"}
                </button>
              </div>
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                {viewReg?.form_data && Object.entries(isEditingData ? editFormData : viewReg.form_data).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground mb-1">{key}</p>
                    {isEditingData ? (
                      <input 
                        value={String(val || "")}
                        onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                        className="w-full h-8 px-2 text-sm border border-border rounded-md bg-background focus:border-primary/50 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground">{String(val)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            {isEditingData ? (
              <button
                onClick={() => saveEditMut.mutate()}
                disabled={saveEditMut.isPending}
                className="h-9 rounded-md bg-gold px-4 text-sm font-bold text-gold-foreground transition hover:brightness-110 flex items-center gap-2"
              >
                {saveEditMut.isPending && <Loader2 size={16} className="animate-spin" />}
                সেভ করুন
              </button>
            ) : (
              <button
                onClick={() => setViewReg(null)}
                className="h-9 rounded-md bg-muted px-4 text-sm font-medium transition hover:bg-muted/80"
              >
                বন্ধ করুন
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Offline Registration Modal */}
      {selectedEvent && (
        <AddRegistrationDialog
          open={isAddingNew}
          event={selectedEvent}
          onClose={() => setIsAddingNew(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-registrations", selectedEventId] });
            setIsAddingNew(false);
          }}
        />
      )}
    </AdminShell>
  );
}

function AddRegistrationDialog({
  open,
  event,
  onClose,
  onSuccess,
}: {
  open: boolean;
  event: EventShort;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        form_data: formData,
        status: "pending",
        created_by_admin: true,
      });
      if (error) throw error;
      toast.success("রেজিস্ট্রেশন এন্ট্রি সফল হয়েছে!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন এন্ট্রি (অফলাইন) - {event.title}</DialogTitle>
          <DialogDescription>
            অফলাইন বা কলের মাধ্যমে পাওয়া তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {(() => {
            let formSchema: any[] = [];
            try {
              if (Array.isArray(event.form_schema)) formSchema = event.form_schema;
              else if (typeof event.form_schema === "string") {
                const parsed = JSON.parse(event.form_schema);
                if (Array.isArray(parsed)) formSchema = parsed;
              }
            } catch (e) {}
            return formSchema.map((field) => {
            if (field.type === "section_title") {
              return (
                <div key={field.id} className="pt-4 pb-2 border-b border-border/50">
                  <h4 className="text-sm font-bold text-foreground">{field.label}</h4>
                  {field.hint && <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>}
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-foreground">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.hint && <p className="text-[10px] text-muted-foreground leading-snug">{field.hint}</p>}
                
                {field.type === "longtext" ? (
                  <textarea
                    required={field.required}
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                ) : field.type === "dropdown" ? (
                  <Select
                    required={field.required}
                    value={formData[field.label] || ""}
                    onValueChange={(v) => setFormData({ ...formData, [field.label]: v })}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="সিলেক্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(field.options) && field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "radio" ? (
                  <div className="space-y-2 mt-2">
                    {Array.isArray(field.options) && field.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name={field.label + "_admin"}
                          required={field.required && !formData[field.label]}
                          checked={formData[field.label] === opt}
                          onChange={() => setFormData({ ...formData, [field.label]: opt })}
                          className="h-4 w-4 border-border text-gold focus:ring-gold"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2 mt-2">
                    {Array.isArray(field.options) && field.options.length > 0 ? (
                      field.options.map((opt) => {
                        const currentValues = formData[field.label] || [];
                        return (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:bg-muted/30 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={currentValues.includes(opt)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...currentValues, opt]
                                  : currentValues.filter((v: string) => v !== opt);
                                setFormData({ ...formData, [field.label]: newValues });
                              }}
                              className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })
                    ) : (
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[field.label] || false}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.checked })}
                          className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                        />
                        <span className="text-sm">হ্যাঁ</span>
                      </label>
                    )}
                    {field.required && Array.isArray(field.options) && field.options.length > 0 && (!formData[field.label] || formData[field.label].length === 0) && (
                      <input type="checkbox" required className="opacity-0 absolute -z-10" />
                    )}
                  </div>
                ) : field.type === "file" ? (
                  <div className="mt-2">
                    <input
                      type="file"
                      required={field.required}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({ ...formData, [field.label]: file.name });
                      }}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 transition cursor-pointer"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                    required={field.required}
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                )}
              </div>
            );
          })})()}

          {(!event.form_schema || (Array.isArray(event.form_schema) ? event.form_schema.length === 0 : false)) && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              এই ইভেন্টে কোনো ফর্ম ফিল্ড সেট করা নেই। দয়া করে আগে ইভেন্ট এডিট করে ফর্ম তৈরি করুন।
            </div>
          )}

          <DialogFooter className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-medium hover:bg-muted"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving || !event.form_schema || event.form_schema.length === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gold px-6 text-sm font-bold text-gold-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "সেভ করুন"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
