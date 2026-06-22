import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminShellProps {
  breadcrumb?: string;
  current?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminShell({
  breadcrumb = "ড্যাশবোর্ড",
  current = "ওভারভিউ",
  title,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("লগআউট সম্পন্ন");
    navigate({ to: "/auth" });
  };

  const initials = (email || "?").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[oklch(0.97_0.012_90)]">
        <AdminSidebar />
        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <SidebarTrigger className="-ml-1 text-foreground" />
            <div className="h-6 w-px bg-border" />
            <div className="hidden text-sm text-muted-foreground sm:block">
              {breadcrumb} ·{" "}
              <span className="font-medium text-foreground">{current}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="খুঁজুন..."
                  className="h-9 w-64 rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                {initials}
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {(title || actions) && (
              <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  {title && (
                    <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2">{actions}</div>
                )}
              </section>
            )}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
