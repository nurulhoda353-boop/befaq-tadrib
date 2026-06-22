import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import brandImage from "@/assets/manuscript-gold.jpg";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).single();
        if (roleData && ['admin', 'editor'].includes(roleData.role)) {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/" });
        }
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let authResult;
      if (isLogin) {
        authResult = await supabase.auth.signInWithPassword({ email, password });
      } else {
        authResult = await supabase.auth.signUp({ email, password });
      }
      
      if (authResult.error) throw authResult.error;
      
      toast.success(isLogin ? "সফলভাবে লগইন হয়েছে" : "অ্যাকাউন্ট তৈরি সফল হয়েছে");
      
      if (authResult.data.user) {
        // Wait a tiny bit for the database trigger to assign the role
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", authResult.data.user.id).single();
        if (roleData && ['admin', 'editor'].includes(roleData.role)) {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/" });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "একটি সমস্যা হয়েছে";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const [isLogin, setIsLogin] = useState(true);


  return (
    <div className="min-h-screen bg-dark-luxe text-white relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-star-pattern opacity-[0.03]" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Back link */}
      <Link
        to="/"
        className="group absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md transition hover:border-gold/50 hover:bg-white/10 hover:text-gold-bright sm:left-8 sm:top-8"
      >
        <ArrowLeft size={14} className="transition group-hover:-translate-x-0.5" />
        হোমপেজ
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:grid-cols-2">
          {/* LEFT — Brand panel */}
          <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src={brandImage}
                alt=""
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary-dark/85 to-primary/70" />
            </div>

            {/* Subtle gold corner ornaments */}
            <div aria-hidden className="absolute left-0 top-0 h-24 w-24 border-l-2 border-t-2 border-gold/40 rounded-tl-3xl" />
            <div aria-hidden className="absolute bottom-0 right-0 h-24 w-24 border-b-2 border-r-2 border-gold/40 rounded-br-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/5 p-1.5 ring-1 ring-gold/40">
                  <img src={logo} alt="বেফাক" className="h-12 w-12 object-contain" />
                </div>
                <div>
                  <div className="font-bold text-white">বেফাক প্রশিক্ষণ শাখা</div>
                  <div className="text-[11px] text-white/60">কওমী মাদ্রাসা শিক্ষাবোর্ড</div>
                </div>
              </div>
            </div>

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                <Sparkles size={12} /> Admin Portal
              </div>
              <h2 className="font-display text-4xl font-bold leading-tight text-white">
                ইলম ও আমানতের <span className="text-gold-bright">সমন্বিত প্ল্যাটফর্ম</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                সম্মানিত শিক্ষক ও দায়িত্বশীলদের জন্য — প্রশিক্ষণ, নোটিশ, ইভেন্ট ও কেন্দ্র ব্যবস্থাপনার সুরক্ষিত প্যানেল।
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { icon: ShieldCheck, text: "এন্ড-টু-এন্ড এনক্রিপ্টেড নিরাপত্তা" },
                  { icon: KeyRound, text: "ভূমিকা-ভিত্তিক প্রবেশাধিকার নিয়ন্ত্রণ" },
                ].map((f) => (
                  <div
                    key={f.text}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-bright">
                      <f.icon size={16} />
                    </div>
                    <div className="text-sm text-white/85">{f.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/50">
              <span>© বেফাক প্রশিক্ষণ শাখা</span>
              <span className="font-arabic text-base text-gold/80">بسم الله</span>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="relative bg-card text-foreground p-7 sm:p-10 lg:p-12">
            {/* Mobile brand */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <img src={logo} alt="" className="h-11 w-11 object-contain" />
              <div>
                <div className="text-sm font-bold">বেফাক প্রশিক্ষণ শাখা</div>
                <div className="text-[11px] text-muted-foreground">Admin Portal</div>
              </div>
            </div>

            <div className="mb-7">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                {isLogin ? "স্বাগতম, ফিরে এসেছেন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLogin ? "আপনার অ্যাকাউন্টে প্রবেশ করুন প্যানেল ব্যবহারের জন্য।" : "আপনার ইমেইল ও পাসওয়ার্ড দিয়ে যুক্ত হোন।"}
              </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ইমেইল ঠিকানা
                </label>
                <div className="group relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-gold" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm transition focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  পাসওয়ার্ড
                </label>
                <div className="group relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-gold" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-11 text-sm transition focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">কমপক্ষে ৬ অক্ষর হতে হবে</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-dark via-primary to-primary-dark px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-gold/20 disabled:opacity-60"
              >
                <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="relative inline-flex items-center gap-2">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "প্যানেলে প্রবেশ করুন" : "অ্যাকাউন্ট তৈরি করুন"}
                      <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </button>

              {/* Divider with calligraphy */}
              <div className="relative py-1 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative inline-block bg-card px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  নিরাপদ সংযোগ
                </span>
              </div>

              <div className="mt-6 text-center text-[13px] text-muted-foreground">
                {isLogin ? "অ্যাকাউন্ট নেই? " : "ইতিমধ্যেই অ্যাকাউন্ট আছে? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-gold hover:text-gold-bright transition"
                >
                  {isLogin ? "সাইন আপ করুন" : "লগইন করুন"}
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-muted-foreground opacity-60">
                সাধারণ ইউজাররা সাইন আপ করলে হোমপেজে রিডাইরেক্ট হবেন। 
                <br />অ্যাডমিন প্যানেলে প্রবেশাধিকার সংরক্ষিত।
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
