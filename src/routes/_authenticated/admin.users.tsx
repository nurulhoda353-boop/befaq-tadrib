// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Users, Shield, Loader2, Search, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

type UserRole = "admin" | "editor" | "viewer";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
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

function AdminUsers() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users");
      if (error) throw error;
      return data as UserData[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase.rpc("update_user_role", {
        target_user_id: userId,
        new_role: newRole,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("ইউজারের রোল আপডেট করা হয়েছে!");
    },
    onError: (err: any) => {
      toast.error(err.message || "রোল আপডেট করতে সমস্যা হয়েছে");
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    return users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  return (
    <AdminShell
      breadcrumb="সিস্টেম"
      current="ইউজার ও রোল"
      title="ইউজার ম্যানেজমেন্ট"
      subtitle="সিস্টেমের সব ইউজার দেখুন এবং পারমিশন নির্ধারণ করুন"
    >
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4">
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
                    <th className="px-6 py-4 font-semibold text-foreground">বর্তমান রোল</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-bold text-primary">
                            {user.email.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{user.email}</span>
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted">
                              রোল পরিবর্তন <ChevronDown size={14} className="text-muted-foreground" />
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
                                  onClick={() => updateRoleMutation.mutate({ userId: user.id, newRole: r })}
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
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
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
    </AdminShell>
  );
}
