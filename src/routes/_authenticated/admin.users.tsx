// @ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Users, Shield, Loader2, Search, ChevronDown, Check, Settings2, Plus, CalendarDays, User, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: ({ context }) => {
    if ((context as any).role !== 'admin') {
      throw redirect({ to: "/admin" });
    }
  },
  component: AdminUsers,
});

type UserRole = "admin" | "editor" | "viewer";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  permissions: string[];
  events: string[];
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-500/15 text-red-600 ring-red-500/20",
  editor: "bg-blue-500/15 text-blue-600 ring-blue-500/20",
  viewer: "bg-gray-500/15 text-gray-600 ring-gray-500/20",
};

const roleLabels: Record<UserRole, string> = {
  admin: "অ্যাডমিন",
  editor: "সম্পাদক",
  viewer: "সাধারণ ইউজার",
};

const availableModules = [
  { 
    id: "events", 
    label: "ইভেন্ট (Events)",
    actions: [
      { id: "events.full", label: "পূর্ণাঙ্গ এক্সেস" },
      { id: "events.create", label: "ইভেন্ট ক্রিয়েট" },
      { id: "events.manage", label: "ইভেন্ট ম্যানেজমেন্ট (ডিলিট সহ)" },
      { id: "events.manage_no_delete", label: "ইভেন্ট ম্যানেজমেন্ট (ডিলিট ছাড়া)" },
    ]
  },
  { 
    id: "notices", 
    label: "নোটিশ (Notices)",
    actions: [
      { id: "notices.full", label: "পূর্ণাঙ্গ এক্সেস" },
      { id: "notices.create", label: "নোটিশ ক্রিয়েট" },
      { id: "notices.manage", label: "নোটিশ ম্যানেজমেন্ট (ডিলিট সহ)" },
      { id: "notices.manage_no_delete", label: "নোটিশ ম্যানেজমেন্ট (ডিলিট ছাড়া)" },
    ]
  },
  { 
    id: "trainings", 
    label: "প্রশিক্ষণ (Trainings)",
    actions: [
      { id: "trainings.full", label: "পূর্ণাঙ্গ এক্সেস" },
      { id: "trainings.create", label: "প্রশিক্ষণ ক্রিয়েট" },
      { id: "trainings.manage", label: "প্রশিক্ষণ ম্যানেজমেন্ট (ডিলিট সহ)" },
      { id: "trainings.manage_no_delete", label: "প্রশিক্ষণ ম্যানেজমেন্ট (ডিলিট ছাড়া)" },
    ]
  },
  { 
    id: "results", 
    label: "রেজাল্ট (Results)",
    actions: [
      { id: "results.full", label: "পূর্ণাঙ্গ এক্সেস" },
      { id: "results.manage", label: "রেজাল্ট ম্যানেজমেন্ট" },
    ]
  },
  { 
    id: "centers", 
    label: "সেন্টার (Centers)",
    actions: [
      { id: "centers.full", label: "পূর্ণাঙ্গ এক্সেস" },
      { id: "centers.manage", label: "সেন্টার ম্যানেজমেন্ট" },
    ]
  },
];

function AdminUsers() {
  const [search, setSearch] = useState("");
  
  // Unified Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null); // null means Creating
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "viewer" as UserRole,
    permissions: [] as string[],
    events: [] as string[],
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users");
      if (error) {
        console.error("get_all_users RPC Error:", error);
        throw error;
      }
      return data as UserData[];
    },
    retry: false,
  });

  useEffect(() => {
    if (queryError) {
      toast.error(`ডাটা ফেচ করতে এরর: ${(queryError as any).message}`);
    }
  }, [queryError]);

  const { data: regEvents = [] } = useQuery({
    queryKey: ["admin-events-reg"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .eq("has_registration", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      if (editingUser) {
        // Edit Mode -> Call update_user_role
        const { error } = await supabase.rpc("update_user_role", {
          target_user_id: editingUser.id,
          new_role: payload.role,
          new_permissions: payload.permissions,
          new_events: payload.events
        });
        if (error) throw error;
      } else {
        // Create Mode
        if (payload.password) {
          // Immediate creation via auth.users
          const { error } = await supabase.rpc("admin_create_user", {
            target_email: payload.email,
            target_password: payload.password,
            target_role: payload.role,
            target_permissions: payload.permissions,
            target_events: payload.events
          });
          if (error) throw error;
        } else {
          // Invite via user_invites
          const { error } = await supabase.from("user_invites").upsert({
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions,
            event_ids: payload.events
          });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(editingUser ? "ইউজারের তথ্য আপডেট করা হয়েছে!" : "নতুন ইউজার/ইনভাইট তৈরি হয়েছে!");
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_delete_user", { target_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("ইউজার সফলভাবে ডিলিট করা হয়েছে!");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "ইউজার ডিলিট করতে সমস্যা হয়েছে");
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    return users.filter((u) => u?.email?.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ email: "", password: "", role: "viewer", permissions: [], events: [] });
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Password cannot be edited from here easily, only reset via auth
      role: user.role,
      permissions: user.permissions || [],
      events: user.events || [],
    });
    setDialogOpen(true);
  };

  const quickRoleChange = (user: UserData, newRole: UserRole) => {
    if (newRole === "editor") {
      openEditDialog({ ...user, role: newRole });
    } else {
      // Just update role quickly, wiping permissions
      setEditingUser(user);
      saveMutation.mutate({
        email: user.email,
        password: "",
        role: newRole,
        permissions: [],
        events: []
      });
    }
  };

  const togglePermission = (moduleId: string) => {
    setFormData(prev => {
      let newPerms = [...prev.permissions];
      
      if (newPerms.includes(moduleId)) {
        // If unchecking, just remove it
        newPerms = newPerms.filter(p => p !== moduleId);
        // If unchecking a sub-action, also uncheck the .full permission for that module
        const moduleBase = moduleId.split('.')[0];
        newPerms = newPerms.filter(p => p !== `${moduleBase}.full`);
      } else {
        // If checking
        newPerms.push(moduleId);
        // If checking .full, automatically check all sub-actions for that module
        if (moduleId.endsWith('.full')) {
          const moduleBase = moduleId.split('.')[0];
          const moduleData = availableModules.find(m => m.id === moduleBase);
          if (moduleData) {
            moduleData.actions.forEach(a => {
              if (!newPerms.includes(a.id)) newPerms.push(a.id);
            });
          }
        }
      }
      return { ...prev, permissions: newPerms };
    });
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const handleSave = () => {
    if (!formData.email) {
      toast.error("ইমেইল অ্যাড্রেস দিতে হবে!");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <AdminShell
      breadcrumb="সিস্টেম"
      current="ইউজার ও রোল"
      title="ইউজার ম্যানেজমেন্ট (ইকোসিস্টেম)"
      subtitle="এখান থেকে ইউজার তৈরি, রোল এবং ইভেন্ট অ্যাক্সেস কন্ট্রোল করুন"
    >
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ইমেইল দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border/50 bg-card pl-9 pr-4 text-sm shadow-soft outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={openCreateDialog}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary-dark"
          >
            <Plus size={16} /> নতুন ইউজার তৈরি করুন
          </button>
        </div>

        {/* Table Area */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={20} /> লোড হচ্ছে...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-4 font-semibold text-foreground">ইমেইল</th>
                    <th className="px-6 py-4 font-semibold text-foreground">রেজিস্ট্রেশন তারিখ</th>
                    <th className="px-6 py-4 font-semibold text-foreground">রোল ও এক্সেস</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-bold text-primary">
                            {(user?.email || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{user.email || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider ring-1 ring-inset ${
                            roleColors[user.role]
                          }`}
                        >
                          {user.role === "admin" && <Shield size={12} />}
                          {user.role === "editor" && <Users size={12} />}
                          {roleLabels[user.role]}
                        </span>
                        
                        {/* Modules & Actions */}
                        {user.role === "editor" && user.permissions && user.permissions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.permissions.map(p => {
                              const moduleBase = p.split('.')[0];
                              const moduleData = availableModules.find(m => m.id === moduleBase);
                              const actionData = moduleData?.actions.find(a => a.id === p);
                              const label = actionData ? `${moduleData.label.split(' ')[0]}: ${actionData.label}` : p;
                              return (
                                <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Events */}
                        {user.role === "editor" && user.events && user.events.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.events.map(evId => (
                              <span key={evId} className="flex items-center gap-1 text-[10px] bg-gold/10 px-1.5 py-0.5 rounded text-gold-bright border border-gold/20">
                                <CalendarDays size={10} />
                                {regEvents.find(e => e.id === evId)?.title || "ইভেন্ট"}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditDialog(user)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:border-primary"
                            title="ম্যানেজ করুন"
                          >
                            <Settings2 size={14} /> ম্যানেজ
                          </button>
                          
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted">
                                <ChevronDown size={14} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                align="end"
                                className="z-50 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-elegant animate-in fade-in zoom-in-95"
                              >
                                {(["admin", "editor", "viewer"] as UserRole[]).map((r) => (
                                  <DropdownMenu.Item
                                    key={r}
                                    onClick={() => quickRoleChange(user, r)}
                                    className="relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition data-[highlighted]:bg-muted"
                                  >
                                    <div className="w-4 text-primary">
                                      {user.role === r && <Check size={14} />}
                                    </div>
                                    <span className={user.role === r ? "text-primary" : "text-foreground"}>
                                      {roleLabels[r]}
                                    </span>
                                  </DropdownMenu.Item>
                                ))}
                                <div className="h-px bg-border my-1" />
                                <DropdownMenu.Item
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-red-500 outline-none transition data-[highlighted]:bg-red-500/10"
                                >
                                  <Trash2 size={14} />
                                  <span>ডিলিট করুন</span>
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        কোনো ইউজার পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Unified User & Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "ইউজার ম্যানেজমেন্ট ও এক্সেস" : "নতুন ইউজার তৈরি / ইনভাইট"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "ইউজারের রোল এবং কোন কোন মডিউলে বা ইভেন্টে এক্সেস পাবে তা আপডেট করুন।" 
                : "ইমেইল দিলে ইউজার ইনভাইট হবে। আর পাসওয়ার্ড দিলে সাথে সাথে একাউন্ট তৈরি হয়ে যাবে।"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ইমেইল অ্যাড্রেস *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  disabled={!!editingUser}
                  placeholder="user@example.com"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
              
              {!editingUser && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">পাসওয়ার্ড (ঐচ্ছিক)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                      placeholder="পাসওয়ার্ড সেট করুন..."
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">ফাঁকা রাখলে ইউজার নিজে সাইন-আপ করার সময় পাসওয়ার্ড সেট করবে</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">ইউজার রোল নির্বাচন করুন</label>
              <div className="grid grid-cols-3 gap-3">
                {(["admin", "editor", "viewer"] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setFormData(p => ({ ...p, role: r }))}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                      formData.role === r 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    {r === "admin" && <Shield size={24} className={formData.role === r ? "text-primary" : "text-muted-foreground"} />}
                    {r === "editor" && <Users size={24} className={formData.role === r ? "text-primary" : "text-muted-foreground"} />}
                    {r === "viewer" && <User size={24} className={formData.role === r ? "text-primary" : "text-muted-foreground"} />}
                    <span className={`text-sm font-bold ${formData.role === r ? "text-primary" : "text-muted-foreground"}`}>
                      {roleLabels[r]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {formData.role === "editor" && (
              <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
                
                {/* Modules Access */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <label className="text-sm font-bold text-foreground border-b border-border/50 pb-2 block">অ্যাকশন পারমিশন (Action Level Access)</label>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {availableModules.map((module) => (
                      <div key={module.id} className="space-y-2 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                        <span className="font-semibold text-primary text-xs uppercase tracking-wider">{module.label}</span>
                        <div className="space-y-1.5 pl-2">
                          {module.actions.map(action => (
                            <label key={action.id} className="flex cursor-pointer items-center justify-between rounded-md p-1.5 transition hover:bg-muted/50">
                              <span className={`text-xs ${action.id.endsWith('.full') ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                {action.label}
                              </span>
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(action.id)}
                                onChange={() => togglePermission(action.id)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Level Access */}
                <div className="space-y-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <label className="text-sm font-bold text-gold-bright border-b border-gold/20 pb-2 flex items-center gap-2">
                    <CalendarDays size={16} /> ইভেন্ট রেজিস্ট্রেশন এক্সেস
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {regEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">কোনো রেজিস্ট্রেশন ইভেন্ট পাওয়া যায়নি।</p>
                    ) : (
                      regEvents.map((ev) => (
                        <label key={ev.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-background p-2.5 shadow-sm transition hover:border-gold/50">
                          <span className="font-medium text-foreground text-xs line-clamp-1 flex-1 pr-2">{ev.title}</span>
                          <input
                            type="checkbox"
                            checked={formData.events.includes(ev.id)}
                            onChange={() => toggleEvent(ev.id)}
                            className="h-4 w-4 shrink-0 rounded border-border text-gold focus:ring-gold/20"
                          />
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                    টিক দেওয়া ইভেন্টগুলোর রেজিস্ট্রেশন ডাটা এই ইউজার ম্যানেজ করতে পারবে (ডিলিট বাদে)।
                  </p>
                </div>

              </div>
            )}
          </div>

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <button
              onClick={() => setDialogOpen(false)}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              বাতিল
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-soft transition hover:shadow-elegant hover:bg-primary-dark disabled:opacity-70"
            >
              {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "সংরক্ষণ করুন"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 size={20} />
              ইউজার ডিলিট করুন
            </DialogTitle>
            <DialogDescription className="pt-3 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি <strong>{userToDelete?.email}</strong> কে সম্পূর্ণ ডিলিট করতে চান? 
              <br/><br/>
              এই ইউজারের সমস্ত পারমিশন এবং এক্সেস ডাটা মুছে যাবে। তাকে পরবর্তীতে সিস্টেমে ঢুকতে হলে <strong>নতুন করে সাইন-আপ</strong> করতে হবে। এই অ্যাকশনটি আর ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-border pt-4">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              বাতিল
            </button>
            <button
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
              disabled={deleteMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-6 text-sm font-bold text-white shadow-soft transition hover:shadow-elegant hover:bg-red-600 disabled:opacity-70"
            >
              {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "ডিলিট করুন"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
