import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  FileText,
  MapPin,
  GraduationCap,
  MessageSquare,
  Users,
  Settings,
  Shield,
  Home,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard, exact: true },
];

const cms = [
  { title: "নোটিশ", url: "/admin/notices", icon: Bell },
  { title: "ইভেন্ট", url: "/admin/events", icon: Calendar },
  { title: "রেজাল্ট", url: "/admin/results", icon: FileText },
  { title: "সেন্টার", url: "/admin/centers", icon: MapPin },
  { title: "প্রশিক্ষণ", url: "/admin/trainings", icon: GraduationCap },
];

const engage = [
  { title: "যোগাযোগ মেসেজ", url: "/admin/messages", icon: MessageSquare },
];

const system = [
  { title: "ইউজার ও রোল", url: "/admin/users", icon: Users },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const renderItems = (items: typeof cms) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = isActive(item.url, (item as any).exact);
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.title}
              className="group/item h-10 rounded-lg text-primary-foreground/70 hover:bg-white/[0.06] hover:text-primary-foreground data-[active=true]:bg-gradient-to-r data-[active=true]:from-gold/25 data-[active=true]:to-gold/5 data-[active=true]:text-gold-bright data-[active=true]:shadow-[inset_2px_0_0_0_var(--gold-bright)]"
            >
              <Link to={item.url as any}>
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="font-medium tracking-tight">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-primary-dark [&_[data-sidebar=sidebar]]:via-primary [&_[data-sidebar=sidebar]]:to-primary-dark [&_[data-sidebar=sidebar]]:text-primary-foreground"
    >
      <SidebarHeader className="border-b border-white/[0.08] px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-gold-bright text-gold-foreground shadow-[0_8px_24px_-8px_var(--gold)]">
            <Shield className="h-5 w-5" strokeWidth={2.5} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-primary-dark" />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[15px] font-bold tracking-tight text-primary-foreground">
                অ্যাডমিন প্যানেল
              </div>
              <div className="truncate text-[11px] text-primary-foreground/60">
                বেফাক · প্রশিক্ষণ শাখা
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
            ওভারভিউ
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(main)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
            কন্টেন্ট
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(cms)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
            যোগাযোগ
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(engage)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/40">
            সিস্টেম
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(system)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.08] px-2 py-3">
        {!collapsed ? (
          <div className="mx-1 mb-2 overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-gold/15 via-transparent to-transparent p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gold-bright">
              <Sparkles className="h-3.5 w-3.5" /> Pro Tip
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-primary-foreground/70">
              নতুন নোটিশ যোগ করলে সাথে সাথেই হোমপেজে দেখাবে ইনশাআল্লাহ্‌।
            </p>
          </div>
        ) : null}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="পাবলিক সাইট"
              className="h-10 rounded-lg text-primary-foreground/70 hover:bg-white/[0.06] hover:text-primary-foreground"
            >
              <Link to="/">
                <Home className="h-[18px] w-[18px]" />
                <span>পাবলিক সাইট</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
