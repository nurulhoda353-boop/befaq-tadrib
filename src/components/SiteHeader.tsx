import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bell,
  CircleUserRound,
  Facebook,
  Home,
  Info,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  X,
  Calendar,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { siteInfo as staticSiteInfo } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "হোম", icon: Home, desc: "মূল পাতা" },
  { to: "/about", label: "পরিচিতি", icon: Info, desc: "আমাদের সম্পর্কে" },
  { to: "/notices", label: "নোটিশ", icon: Bell, desc: "সর্বশেষ ঘোষণা" },
  { to: "/trainings", label: "প্রশিক্ষণ", icon: BookOpen, desc: "সকল কোর্স" },
  { to: "/events", label: "ইভেন্ট", icon: Calendar, desc: "আসন্ন সেমিনার ও কর্মশালা" },
  { to: "/contact", label: "যোগাযোগ", icon: Phone, desc: "আমাদের সাথে কথা বলুন" },
] as const;

export function SiteHeader(_props: { overlay?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  const { data: globalSettings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").limit(1).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const siteInfo = globalSettings
    ? {
        nameBn: globalSettings.site_name_bn || staticSiteInfo.nameBn,
        shortName: globalSettings.short_name || staticSiteInfo.shortName,
        phone: globalSettings.phone || staticSiteInfo.phone,
        email: globalSettings.email || staticSiteInfo.email,
        address: globalSettings.address || staticSiteInfo.address,
        facebook: globalSettings.facebook_url || staticSiteInfo.facebook,
      }
    : staticSiteInfo;

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + esc-close when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isLight = stuck;

  const wrapper = `fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
    isLight
      ? "bg-background/85 backdrop-blur-xl border-b border-gold/15 shadow-sm"
      : "bg-transparent border-b border-transparent"
  }`;

  const titleCls = isLight ? "text-primary-dark" : "text-white";
  const subtitleCls = isLight ? "text-muted-foreground" : "text-white/65";
  const linkBase = isLight
    ? "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-primary-soft hover:text-primary-dark"
    : "rounded-md px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white";
  const linkActive = isLight
    ? "bg-primary-soft text-primary-dark"
    : "bg-white/15 text-white ring-1 ring-gold/40";
  const menuBtnCls = isLight
    ? "border-border bg-card text-foreground hover:border-gold/40"
    : "border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-gold/40 hover:bg-white/15";

  return (
    <>
      <header className={wrapper}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-1" onClick={() => setOpen(false)}>
            <img src={logo} alt="বেফাক প্রশিক্ষণ শাখা" className="h-[53px] w-[53px] shrink-0 object-contain sm:h-[61px] sm:w-[61px]" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className={`truncate text-base font-bold tracking-tight sm:text-lg ${titleCls}`}>{siteInfo.shortName}</span>
              <span className={`mt-0.5 truncate text-[11px] leading-snug ${subtitleCls}`}>{siteInfo.nameBn}</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className={linkBase}
                activeProps={{ className: linkActive }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/auth"
              aria-label="লগইন"
              title="লগইন"
              className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                isLight
                  ? "border-border text-foreground/70 hover:border-gold/60 hover:text-primary-dark"
                  : "border-white/25 text-white/85 hover:border-gold/60 hover:text-white"
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <CircleUserRound size={16} strokeWidth={1.75} className="relative" />
            </Link>
            <Link
              to="/admission"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground shadow-soft transition hover:brightness-110"
            >
              ভর্তি আবেদন
            </Link>
          </div>

          <button
            aria-label="মেনু খুলুন"
            aria-expanded={open}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition lg:hidden ${menuBtnCls}`}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* OFF-CANVAS MOBILE MENU — slide from left */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <button
          tabIndex={open ? 0 : -1}
          aria-label="মেনু বন্ধ করুন"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-primary-dark/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="প্রধান মেনু"
          className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-hidden bg-dark-luxe text-primary-foreground shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Decorative gold glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.04]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center gap-2"
            >
              <div className="rounded-xl bg-white/5 p-1 ring-1 ring-gold/30">
                <img src={logo} alt="" className="h-11 w-11 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-bold text-white">{siteInfo.shortName}</div>
                <div className="truncate text-[11px] text-primary-foreground/65">
                  {siteInfo.nameBn}
                </div>
              </div>
            </Link>
            <button
              aria-label="বন্ধ করুন"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:border-gold/50 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scroll area */}
          <div className="relative flex-1 overflow-y-auto px-5 py-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold">
              <Sparkles size={12} /> মেনু
            </div>

            <nav className="mt-4 flex flex-col gap-1.5">
              {nav.map((n, i) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: n.to === "/" }}
                  style={{
                    transitionDelay: open ? `${80 + i * 50}ms` : "0ms",
                  }}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10 ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                  }`}
                  activeProps={{
                    className:
                      "border-gold/60 bg-gradient-to-r from-gold/15 to-transparent ring-1 ring-gold/30",
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-bright transition group-hover:bg-gold group-hover:text-gold-foreground">
                    <n.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">{n.label}</div>
                    <div className="truncate text-[11px] text-primary-foreground/60">
                      {n.desc}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-primary-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-gold-bright"
                  />
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <Link
              to="/admission"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110 ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: open ? "380ms" : "0ms" }}
            >
              ভর্তির আবেদন করুন <ArrowRight size={15} />
            </Link>

            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-gold/50 hover:bg-white/10 ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: open ? "420ms" : "0ms" }}
            >
              <LogIn size={15} /> অ্যাডমিন লগইন
            </Link>

            {/* Contact mini-block */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                দ্রুত যোগাযোগ
              </div>
              <div className="mt-3 space-y-2.5 text-sm">
                <a
                  href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-white/90 transition hover:text-gold-bright"
                >
                  <Phone size={14} className="text-gold" /> {siteInfo.phone}
                </a>
                <a
                  href={`mailto:${siteInfo.email}`}
                  className="flex items-center gap-2 break-all text-white/90 transition hover:text-gold-bright"
                >
                  <Mail size={14} className="text-gold" /> {siteInfo.email}
                </a>
                <div className="flex items-start gap-2 text-xs text-primary-foreground/70">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gold" />
                  <span>{siteInfo.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-4">
            <a
              href={siteInfo.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gold-bright transition hover:border-gold/50 hover:bg-white/10"
              aria-label="ফেসবুক"
            >
              <Facebook size={16} />
            </a>
            <div className="text-[11px] text-primary-foreground/55">
              © {siteInfo.shortName}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
