import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Lock, Save, Loader2, KeyRound, Globe, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Global Settings State
  const [siteName, setSiteName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "");
    });
  }, []);

  const { data: globalSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").limit(1).single();
      if (error && error.code !== "PGRST116") throw error; // Ignore not found initially
      return data;
    },
  });

  useEffect(() => {
    if (globalSettings) {
      setSiteName(globalSettings.site_name_bn || "");
      setShortName(globalSettings.short_name || "");
      setTagline(globalSettings.tagline || "");
      setAddress(globalSettings.address || "");
      setFacebook(globalSettings.facebook_url || "");
      setContactEmail(globalSettings.email || "");
      setContactPhone(globalSettings.phone || "");
    }
  }, [globalSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        site_name_bn: siteName,
        short_name: shortName,
        tagline,
        address,
        facebook_url: facebook,
        email: contactEmail,
        phone: contactPhone,
      };

      if (globalSettings?.id) {
        const { error } = await supabase.from("global_settings").update(payload).eq("id", globalSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("global_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("গ্লোবাল সেটিংস আপডেট হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
    },
    onError: (err: any) => toast.error(err.message || "আপডেট করতে সমস্যা হয়েছে।"),
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsUpdatingPassword(false);

    if (error) {
      toast.error("পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।");
    } else {
      toast.success("পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!");
      setPassword("");
    }
  };

  return (
    <AdminShell
      breadcrumb="সিস্টেম"
      current="সেটিংস"
      title="সেটিংস ও সিকিউরিটি"
      subtitle="আপনার প্রোফাইল এবং ওয়েবসাইটের মূল সেটিংস"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Global Web Settings */}
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:shadow-elegant md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold-bright">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">গ্লোবাল সেটিংস</h2>
                <p className="text-sm text-muted-foreground">ওয়েবসাইটের নাম, ঠিকানা ও যোগাযোগের তথ্য</p>
              </div>
            </div>
            <button
              onClick={() => updateSettingsMutation.mutate()}
              disabled={updateSettingsMutation.isPending || isLoadingSettings}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:shadow-elegant disabled:opacity-70"
            >
              {updateSettingsMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              সেভ করুন
            </button>
          </div>

          {isLoadingSettings ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">প্রতিষ্ঠানের পূর্ণ নাম</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">সংক্ষিপ্ত নাম</label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">স্লোগান / ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">যোগাযোগ নাম্বার</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">ইমেইল ঠিকানা</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">ফেসবুক পেজ লিংক</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Security Settings */}
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:shadow-elegant md:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">অ্যাকাউন্ট সিকিউরিটি</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">নতুন পাসওয়ার্ড সেট করুন</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="নতুন পাসওয়ার্ড দিন..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">পাসওয়ার্ড পরিবর্তন করলে পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করতে হবে।</p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-dark disabled:opacity-70"
            >
              {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUpdatingPassword ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড সেভ করুন"}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
