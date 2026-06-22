import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Calendar,
  FileText,
  MapPin,
  GraduationCap,
  MessageSquare,
  Loader2,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: ensureAdmin,
  component: AdminDashboard,
});

type Role = "admin" | "editor" | "viewer";

function AdminDashboard() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? "");
    });
  }, []);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["my-roles", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((r) => r.role as Role);
    },
  });

  // Real stats
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const { count: notices } = await supabase
        .from("notices")
        .select("*", { count: "exact", head: true });
      return { notices: notices ?? 0 };
    },
  });

  const hasAnyRole = (roles?.length ?? 0) > 0;

  const stats = [
    { label: "মোট নোটিশ", value: counts?.notices ?? "—", icon: Bell, tone: "from-blue-500/15 to-blue-500/0 text-blue-600" },
    { label: "আসন্ন ইভেন্ট", value: "—", icon: Calendar, tone: "from-purple-500/15 to-purple-500/0 text-purple-600" },
    { label: "প্রকাশিত রেজাল্ট", value: "—", icon: FileText, tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-600" },
    { label: "নতুন মেসেজ", value: "—", icon: MessageSquare, tone: "from-amber-500/15 to-amber-500/0 text-amber-600" },
  ];

  const cmsModules = [
    { label: "নোটিশ", desc: "ঘোষণা ও বিজ্ঞপ্তি প্রকাশ করুন", icon: Bell, to: "/admin/notices", tint: "from-blue-500/10 to-transparent", ready: true },
    { label: "ইভেন্ট", desc: "প্রোগ্রাম ও সেমিনার পরিচালনা", icon: Calendar, to: "/admin/events", tint: "from-purple-500/10 to-transparent", ready: true },
    { label: "রেজাল্ট", desc: "পরীক্ষার ফলাফল আপলোড", icon: FileText, to: "/admin/results", tint: "from-emerald-500/10 to-transparent", ready: true },
    { label: "সেন্টার", desc: "প্রশিক্ষণ কেন্দ্র ব্যবস্থাপনা", icon: MapPin, to: "/admin/centers", tint: "from-orange-500/10 to-transparent", ready: true },
    { label: "প্রশিক্ষণ", desc: "কোর্স ও সিলেবাস কন্টেন্ট", icon: GraduationCap, to: "/admin/trainings", tint: "from-pink-500/10 to-transparent", ready: true },
    { label: "যোগাযোগ মেসেজ", desc: "ব্যবহারকারীদের বার্তা", icon: MessageSquare, to: "/admin/messages", tint: "from-teal-500/10 to-transparent", ready: true },
  ];

  return (
    <AdminShell
      breadcrumb="ড্যাশবোর্ড"
      current="ওভারভিউ"
      title={
        <div className="flex items-center gap-3">
          ড্যাশবোর্ড
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          ) : hasAnyRole ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
              <Shield size={10} /> {roles![0].toUpperCase()}
            </span>
          ) : null}
        </div>
      }
      subtitle="আজকের কন্টেন্ট ও কার্যক্রম এক নজরে"
      actions={
        <Link
          to={"/admin/notices" as any}
          className="group inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-elegant"
        >
          <Plus size={15} /> নতুন কন্টেন্ট
          <ArrowUpRight size={13} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      }
    >
      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${s.tone} opacity-60`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-background/80 ring-1 ring-border">
                <s.icon size={16} />
              </div>
            </div>
            <div className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <TrendingUp size={11} /> এই সপ্তাহ
            </div>
          </div>
        ))}
      </section>

      {/* Modules */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              কন্টেন্ট ম্যানেজমেন্ট
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              আপনার ইকোসিস্টেমের সব মডিউল এক জায়গায়
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Users size={13} /> {hasAnyRole ? "অ্যাক্সেস আছে" : "অ্যাক্সেস নেই"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cmsModules.map((m) => {
            const Inner = (
              <div className="relative flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-background ring-1 ring-border">
                  <m.icon size={20} className="text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display font-bold text-foreground">{m.label}</div>
                    {!m.ready && (
                      <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        শীঘ্রই
                      </span>
                    )}
                    {m.ready && (
                      <ArrowUpRight size={16} className="text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            );
            const className = `group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 text-left transition ${
              m.ready ? "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft" : "cursor-not-allowed opacity-75"
            }`;
            return m.ready ? (
              <Link key={m.label} to={m.to as any} className={className}>
                <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${m.tint} opacity-70`} />
                {Inner}
              </Link>
            ) : (
              <div key={m.label} className={className}>
                <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${m.tint} opacity-70`} />
                {Inner}
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
