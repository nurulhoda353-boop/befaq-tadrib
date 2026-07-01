import { useState, useMemo, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { useRouterState } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { FormBuilder, FormFieldSchema } from "@/components/admin/FormBuilder";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Status = "draft" | "upcoming" | "completed" | "cancelled";

interface EventItem {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  featured_image: string | null;
  status: Status;
  has_registration: boolean;
  form_schema: FormFieldSchema[];
  reg_prefix: string | null;
  created_at: string;
  confirmation_sms_template?: string | null;
  show_emergency_contact?: boolean;
  emergency_contact_title?: string | null;
  emergency_contact_description?: string | null;
  emergency_contact_phone1?: string | null;
  emergency_contact_phone2?: string | null;
}

const statusMeta: Record<Status, { label: string; tone: string; icon: any }> = {
  draft: { label: "ড্রাফট", tone: "bg-slate-500/10 text-slate-700 ring-slate-500/30", icon: Clock },
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

export function EventListView({ tabs }: { tabs: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [managing, setManaging] = useState<EventItem | null>(null);

  const context = useRouterState({ select: (s: any) => s.matches.find((m: any) => m.routeId === '/_authenticated')?.context }) as any;
  const role = context?.role || 'viewer';
  const permissions = context?.permissions || [];
  
  const canCreate = role === 'admin' || permissions.includes('events.full') || permissions.includes('events.create');
  const canManage = role === 'admin' || permissions.includes('events.full') || permissions.includes('events.manage') || permissions.includes('events.manage_no_delete');
  const canDelete = role === 'admin' || permissions.includes('events.full') || permissions.includes('events.manage');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as unknown as EventItem[];
    },
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      // Tab filter
      if (activeTab === "published" && e.status === "draft") return false;
      if (activeTab === "drafts" && e.status !== "draft") return false;

      // Status dropdown filter
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, filterStatus, activeTab]);

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

  // Background sync for auto-completing past events
  useEffect(() => {
    if (events.length === 0) return;
    const pastUpcoming = events.filter(e => e.status === "upcoming" && e.date && new Date(e.date).getTime() < Date.now());
    
    if (pastUpcoming.length > 0) {
      const syncIds = pastUpcoming.map(e => e.id);
      supabase.from("events").update({ status: "completed" }).in("id", syncIds).then(({ error }) => {
        if (!error) {
          queryClient.invalidateQueries({ queryKey: ["admin-events"] });
          queryClient.invalidateQueries({ queryKey: ["public-events"] });
          toast.success(`${pastUpcoming.length}টি ইভেন্ট স্বয়ংক্রিয়ভাবে 'সম্পন্ন' হিসেবে আপডেট হয়েছে।`);
        }
      });
    }
  }, [events, queryClient]);

  return (
    <AdminShell
      breadcrumb="কন্টেন্ট"
      current="ইভেন্ট"
      actions={
        canCreate ? (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
          >
            <Plus size={15} /> নতুন ইভেন্ট
          </button>
        ) : null
      }
    >
      {tabs}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
            activeTab === "published" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          পাবলিশড
          {activeTab === "published" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
            activeTab === "drafts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ড্রাফটস
          {activeTab === "drafts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

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
          <SelectTrigger className="h-10 w-full sm:w-44 bg-card">
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
                      {e.has_registration && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 bg-gold/10 text-gold-bright ring-gold/30">
                          রেজিস্ট্রেশন অন
                        </span>
                      )}
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
                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => setManaging(e)}
                        title="রেজিস্ট্রেশন ম্যানেজার সেট করুন"
                        className="grid h-9 w-9 place-items-center rounded-lg text-blue-500 transition hover:bg-blue-500/10"
                      >
                        <Users size={15} />
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setEditing(e)}
                        title="Edit"
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleting(e)}
                        title="Delete"
                        className="grid h-9 w-9 place-items-center rounded-lg text-destructive transition hover:bg-destructive/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
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

      <ManageManagersDialog 
        event={managing} 
        open={!!managing} 
        onClose={() => setManaging(null)} 
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

// -------------------- Template Editor --------------------
function TemplateEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Convert raw text to HTML with locked chips
  const formatToHtml = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
      
    html = html.replace(/\{name\}/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gold/20 text-gold-bright select-none mx-0.5 cursor-not-allowed" contenteditable="false" data-var="{name}">অংশগ্রহণকারীর নাম</span>');
    html = html.replace(/\{event\}/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gold/20 text-gold-bright select-none mx-0.5 cursor-not-allowed" contenteditable="false" data-var="{event}">ইভেন্টের নাম</span>');
    html = html.replace(/\{id\}/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gold/20 text-gold-bright select-none mx-0.5 cursor-not-allowed" contenteditable="false" data-var="{id}">আইডি নং</span>');
    return html;
  };

  // Convert HTML back to raw text
  const parseFromHtml = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    
    // Replace spans with their data-var
    const spans = temp.querySelectorAll('span[data-var]');
    spans.forEach(span => {
      const varName = span.getAttribute('data-var');
      if (varName) {
        span.replaceWith(varName);
      }
    });

    // Replace br with newline
    let text = temp.innerHTML.replace(/<br\s*[\/]?>/gi, "\n");
    // Decode HTML entities
    const decoder = document.createElement("textarea");
    decoder.innerHTML = text;
    return decoder.value;
  };

  // Set initial content only once to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = formatToHtml(value || "অভিনন্দন {name}!\n\"{event}\"-এ আপনার রেজিস্ট্রেশন কনফার্ম হয়েছে।\nআপনার আইডি: {id}");
      // If value is empty, update parent with default
      if (!value) {
        onChange("অভিনন্দন {name}!\n\"{event}\"-এ আপনার রেজিস্ট্রেশন কনফার্ম হয়েছে।\nআপনার আইডি: {id}");
      }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const newText = parseFromHtml(editorRef.current.innerHTML);
      onChange(newText);
    }
  };

  return (
    <div 
      className={`w-full min-h-[100px] rounded-md border p-3 text-sm bg-background font-mono leading-relaxed transition-colors ${isFocused ? 'border-gold ring-1 ring-gold' : 'border-border'}`}
      onClick={() => editorRef.current?.focus()}
    >
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={handleInput}
        className="outline-none whitespace-pre-wrap"
        style={{ caretColor: 'currentColor' }}
      />
    </div>
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
  const [subtitle, setSubtitle] = useState(event?.subtitle ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [featuredImage, setFeaturedImage] = useState(event?.featured_image ?? "");
  const [status, setStatus] = useState<Status>(event?.status ?? "upcoming");
  const [date, setDate] = useState<string>(
    event?.date ? toLocalInput(event.date) : ""
  );
  
  // Registration specific fields
  const [hasRegistration, setHasRegistration] = useState(event?.has_registration ?? false);
  const [regPrefix, setRegPrefix] = useState(event?.reg_prefix ?? "");
  const [confirmationSmsTemplate, setConfirmationSmsTemplate] = useState(event?.confirmation_sms_template ?? "");
  const [formSchema, setFormSchema] = useState<FormFieldSchema[]>(event?.form_schema ?? []);

  // Emergency contact fields
  const [showEmergencyContact, setShowEmergencyContact] = useState(event?.show_emergency_contact ?? false);
  const [emergencyContactTitle, setEmergencyContactTitle] = useState(event?.emergency_contact_title ?? "রেজিস্ট্রেশন ফর্ম পূরণ করতে সমস্যা হচ্ছে?");
  const [emergencyContactDescription, setEmergencyContactDescription] = useState(event?.emergency_contact_description ?? "ফরম পূরণে কোনো ধরণের অসুবিধা হলে আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন।");
  const [emergencyContactPhone1, setEmergencyContactPhone1] = useState(event?.emergency_contact_phone1 ?? "");
  const [emergencyContactPhone2, setEmergencyContactPhone2] = useState(event?.emergency_contact_phone2 ?? "");

  const [saving, setSaving] = useState(false);
  const [submitType, setSubmitType] = useState<"draft" | "publish">("publish");

  // Generate a short english slug
  const generateSlug = (text: string) => {
    return 'event-' + Math.random().toString(36).substring(2, 8) + '-' + Date.now().toString().slice(-3);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("শিরোনাম দিন");
      return;
    }
    setSaving(true);

    const newStatus = submitType === "draft" ? "draft" : (status === "draft" ? "upcoming" : status);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      location: location.trim() || null,
      featured_image: featuredImage.trim() || null,
      status: newStatus,
      date: date ? new Date(date).toISOString() : null,
      has_registration: hasRegistration,
      reg_prefix: regPrefix.trim() || null,
      confirmation_sms_template: confirmationSmsTemplate.trim() || null,
      form_schema: formSchema,
      slug: isEdit ? event.slug : generateSlug(title), // Only generate new slug if creating
      show_emergency_contact: showEmergencyContact,
      emergency_contact_title: emergencyContactTitle.trim() || null,
      emergency_contact_description: emergencyContactDescription.trim() || null,
      emergency_contact_phone1: emergencyContactPhone1.trim() || null,
      emergency_contact_phone2: emergencyContactPhone2.trim() || null,
    };

    try {
      if (isEdit && event) {
        const { error } = await supabase.from("events").update(payload as any).eq("id", event.id);
        if (error) throw error;
        toast.success(submitType === "draft" ? "ড্রাফট আপডেট হয়েছে" : "ইভেন্ট আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("events").insert(payload as any);
        if (error) throw error;
        toast.success(submitType === "draft" ? "ড্রাফট সেভ হয়েছে" : "ইভেন্ট তৈরি হয়েছে");
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-6 py-4 backdrop-blur-xl">
          <DialogTitle className="font-display text-xl text-foreground">
            {isEdit ? "ইভেন্ট এডিট করুন" : "নতুন ইভেন্ট তৈরি করুন"}
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left Column - Main Details */}
            <div className="space-y-6 lg:col-span-3">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-foreground">ইভেন্টের নাম (Title) *</Label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="যেমন: জাতীয় শিক্ষক সেমিনার ২০২৬"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subtitle" className="text-muted-foreground">সাবটাইটেল (Subtitle)</Label>
                <input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  maxLength={250}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="যেমন: শিক্ষকদের দক্ষতা উন্নয়ন কর্মসূচি"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-foreground">বিস্তারিত বিবরণ (Description)</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">স্থান / ঠিকানা (Location)</Label>
                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="যেমন: কাজলা, যাত্রাবাড়ী, ঢাকা"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image">কভার ছবির লিংক (Image URL)</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    <ImageIcon size={18} />
                  </div>
                  <input
                    id="image"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Settings & Registration */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Clock size={16} className="text-gold" /> সময় ও স্ট্যাটাস
                </h4>
                
                <div className="space-y-1.5">
                  <Label htmlFor="date">তারিখ ও সময়</Label>
                  <input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDate(newDate);
                      if (newDate) {
                        const time = new Date(newDate).getTime();
                        // Auto-update status based on selected date
                        if (time > Date.now()) {
                          setStatus("upcoming");
                        } else {
                          setStatus("completed");
                        }
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>স্ট্যাটাস (অটো-ফিল্ড)</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                    <SelectTrigger className="bg-background focus:ring-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">আসন্ন (Upcoming)</SelectItem>
                      <SelectItem value="completed">সম্পন্ন (Completed)</SelectItem>
                      <SelectItem value="cancelled">বাতিল (Cancelled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-4">
                <h4 className="font-semibold text-gold-bright text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> রেজিস্ট্রেশন সেটিংস
                </h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="has-reg" className="cursor-pointer text-sm font-medium">
                    রেজিস্ট্রেশন চালু করুন
                  </Label>
                  <Switch
                    id="has-reg"
                    checked={hasRegistration}
                    onCheckedChange={setHasRegistration}
                  />
                </div>

                {hasRegistration && (
                  <>
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="prefix" className="text-xs">রেজিস্ট্রেশন আইডি প্রিফিক্স (Prefix)</Label>
                      <input
                        id="prefix"
                        value={regPrefix}
                        onChange={(e) => setRegPrefix(e.target.value.toUpperCase())}
                        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                        placeholder="যেমন: BEFAQ24"
                      />
                      <p className="text-[10px] text-muted-foreground">ইউজারদের কনফার্মেশন আইডির শুরুতে এটি যুক্ত হবে (e.g. BEFAQ24-001)</p>
                    </div>

                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-xs">কনফার্মেশন SMS টেমপ্লেট</Label>
                      <TemplateEditor 
                        value={confirmationSmsTemplate} 
                        onChange={setConfirmationSmsTemplate} 
                      />
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                        কালার করা অংশগুলো (নাম, ইভেন্ট, আইডি) সম্পূর্ণ লক করা আছে, এগুলোতে হাত দেওয়া যাবে না। বাকি যেকোনো লেখা আপনি ইচ্ছেমতো এডিট বা ডিলিট করতে পারবেন।
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gold/10 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-emergency" className="cursor-pointer text-xs font-semibold">
                          জরুরি যোগাযোগ কার্ড দেখান
                        </Label>
                        <Switch
                          id="show-emergency"
                          checked={showEmergencyContact}
                          onCheckedChange={setShowEmergencyContact}
                        />
                      </div>
                      
                      {showEmergencyContact && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1">
                          <div className="space-y-1.5">
                            <Label htmlFor="emergency-title" className="text-xs font-semibold">কার্ডের শিরোনাম (Title)</Label>
                            <input
                              id="emergency-title"
                              value={emergencyContactTitle}
                              onChange={(e) => setEmergencyContactTitle(e.target.value)}
                              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                              placeholder="রেজিস্ট্রেশন ফর্ম পূরণ করতে সমস্যা হচ্ছে?"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label htmlFor="emergency-desc" className="text-xs font-semibold">সংক্ষিপ্ত বিবরণ (Description)</Label>
                            <textarea
                              id="emergency-desc"
                              value={emergencyContactDescription}
                              onChange={(e) => setEmergencyContactDescription(e.target.value)}
                              rows={2}
                              className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:border-gold"
                              placeholder="ফরম পূরণে কোনো ধরণের অসুবিধা হলে আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন।"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="emergency-phone1" className="text-xs font-semibold">ফোন নাম্বার ১ (WhatsApp সহ)</Label>
                            <input
                              id="emergency-phone1"
                              value={emergencyContactPhone1}
                              onChange={(e) => setEmergencyContactPhone1(e.target.value)}
                              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                              placeholder="017XXXXXXXX"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="emergency-phone2" className="text-xs font-semibold">ফোন নাম্বার ২ (WhatsApp সহ)</Label>
                            <input
                              id="emergency-phone2"
                              value={emergencyContactPhone2}
                              onChange={(e) => setEmergencyContactPhone2(e.target.value)}
                              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                              placeholder="018XXXXXXXX"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Builder Section - Full Width */}
          {hasRegistration && (
            <div className="mt-8 pt-8 border-t border-border animate-in fade-in">
              <FormBuilder fields={formSchema} onChange={setFormSchema} />
            </div>
          )}

          <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-border bg-card/80 px-6 py-4 backdrop-blur-xl -mx-6 -mb-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              বাতিল
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                onClick={() => setSubmitType("draft")}
                disabled={saving}
                className="h-10 rounded-lg border border-border bg-muted px-4 text-sm font-semibold text-foreground transition hover:bg-muted/80 disabled:opacity-50"
              >
                ড্রাফট হিসেবে সেভ করুন
              </button>
              <button
                type="submit"
                onClick={() => setSubmitType("publish")}
                disabled={saving}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gold px-6 text-sm font-bold text-gold-foreground shadow-soft transition hover:brightness-110 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={15} />}
                {isEdit && status !== "draft" ? "আপডেট করুন" : "পাবলিশ করুন"}
              </button>
            </div>
          </div>
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

// -------------------- Event Managers Dialog --------------------

function ManageManagersDialog({
  event,
  open,
  onClose,
}: {
  event: EventItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<string[]>([]); // array of user_ids

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users-editors"],
    queryFn: async () => {
      // Get all editors
      const { data, error } = await supabase.rpc("get_all_users");
      if (error) throw error;
      return (data as any[]).filter(u => u.role === "editor");
    },
    enabled: open,
  });

  const { data: existingManagers, isLoading: loadingManagers } = useQuery({
    queryKey: ["event-managers", event?.id],
    queryFn: async () => {
      if (!event) return [];
      const { data, error } = await supabase.from("event_managers").select("user_id").eq("event_id", event.id);
      if (error) throw error;
      return data;
    },
    enabled: !!event && open,
  });

  useEffect(() => {
    if (existingManagers) {
      setManagers(existingManagers.map((m: any) => m.user_id));
    } else if (!open) {
      setManagers([]);
    }
  }, [existingManagers, open]);

  const toggleManager = (userId: string) => {
    setManagers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!event) return;
    setLoading(true);
    try {
      // 1. Delete all existing managers for this event
      await supabase.from("event_managers").delete().eq("event_id", event.id);
      
      // 2. Insert new ones
      if (managers.length > 0) {
        const inserts = managers.map(uid => ({ event_id: event.id, user_id: uid }));
        const { error } = await supabase.from("event_managers").insert(inserts);
        if (error) throw error;
      }
      
      toast.success("ম্যানেজার এক্সেস আপডেট হয়েছে");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ইভেন্ট ম্যানেজার সেট করুন</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            ইভেন্ট: <strong>{event?.title}</strong>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            যাদেরকে আপনি পারমিশন দেবেন, তারা এই ইভেন্টের রেজিস্ট্রেশন কনফার্ম ও এডিট করতে পারবেন। 
            (শুধুমাত্র "সম্পাদক" রোল পাওয়া ইউজারদের লিস্টে দেখা যাচ্ছে)
          </p>
        </DialogHeader>

        <div className="py-4 space-y-3 min-h-[150px] max-h-[60vh] overflow-y-auto">
          {loadingUsers || loadingManagers ? (
            <div className="flex justify-center py-8 text-muted-foreground"><Loader2 className="animate-spin" /></div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              কোনো "সম্পাদক" (Editor) পাওয়া যায়নি। আগে ইউজার ম্যানেজমেন্ট থেকে কাউকে সম্পাদক রোল দিন।
            </div>
          ) : (
            allUsers.map(user => (
              <label key={user.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                    {user.email.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground text-sm">{user.email}</span>
                </div>
                <input
                  type="checkbox"
                  checked={managers.includes(user.id)}
                  onChange={() => toggleManager(user.id)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20"
                />
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            disabled={loading || loadingUsers || loadingManagers}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "সেভ করুন"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
