import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Tag, Share2, CalendarPlus, CheckCircle2, Loader2, Clock, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";
import { FormFieldSchema } from "@/components/admin/FormBuilder";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { id } = Route.useParams();

  // Fetch Event details
  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event", id],
    queryFn: async () => {
      // Try to fetch by slug first, if fails try id
      let { data, error } = await (supabase as any)
        .from("events")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (!data) {
        // Only try to query by id if it's a valid UUID to prevent Postgres syntax errors
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const res = await (supabase as any)
            .from("events")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          data = res.data;
          error = res.error;
        } else {
          // Not found by slug, and not a valid UUID -> just return null
          return null;
        }
      }

      if (error && error.code !== "PGRST116") throw error;
      if (data && data.status === "draft") return null;
      return data;
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || "ইভেন্ট",
        text: event?.subtitle || "বেফাক প্রশিক্ষণ শাখার এই ইভেন্টটিতে অংশগ্রহণ করুন।",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("লিংক কপি করা হয়েছে!");
    }
  };

  const handleGoogleCalendar = () => {
    if (!event) return;
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.subtitle || "");
    const loc = encodeURIComponent(event.location || "");
    let dates = "";
    if (event.date) {
      // Format as YYYYMMDDTHHmmSSZ
      const d = new Date(event.date);
      const end = new Date(d.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours approx
      const fmt = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
      dates = `${fmt(d)}/${fmt(end)}`;
    }
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${loc}&dates=${dates}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">ইভেন্টটি পাওয়া যায়নি</h1>
            <p className="mt-2 text-muted-foreground">লিংকটি ভুল হতে পারে অথবা ইভেন্টটি মুছে ফেলা হয়েছে।</p>
            <Link to="/events" className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-gold px-6 font-bold text-gold-foreground transition hover:brightness-110">
              সব ইভেন্ট দেখুন
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const d = event.date ? new Date(event.date) : null;
  const isValidDate = d && !isNaN(d.getTime());
  const dateStr = isValidDate ? d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" }) : "শীঘ্রই";
  const isPast = isValidDate ? d.getTime() < Date.now() : false;

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      {/* 1. Hero Section (Dark Theme - Standard Layout) */}
      <section className="relative overflow-hidden bg-hero-luxe pb-24 pt-24 sm:pt-32">
        <SiteHeader overlay />
        
        {/* Background Visuals (No Featured Image here) */}
        <div className="absolute inset-0 bg-star-pattern opacity-[0.03] z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjwvc3ZnPg==')] opacity-40 z-0" />
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gold/10 blur-[150px] pointer-events-none z-0 translate-x-1/3 -translate-y-1/3 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[120px] pointer-events-none z-0 -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDuration: '6s' }} />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/[0.15] mb-8 sm:mb-12 animate-fade-in-up"
          >
            <ArrowLeft size={14} /> সব ইভেন্টে ফিরুন
          </Link>
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 xl:col-span-7 text-left lg:pr-8">
              <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up delay-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
                  <Calendar size={13} /> ইভেন্ট
                </span>
                {event.status === "completed" || (event.status === "upcoming" && isPast) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                    <CheckCircle2 size={13} /> সম্পন্ন
                  </span>
                ) : event.status === "cancelled" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 ring-1 ring-red-500/30">
                    বাতিল
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
                    আসন্ন
                  </span>
                )}
              </div>
              
              <h1 className="font-display text-4xl font-extrabold leading-[1.25] text-white sm:text-5xl lg:text-6xl tracking-tight animate-fade-in-up delay-200">
                {event.title}
              </h1>
              
              {event.subtitle && (
                <p className="mt-6 text-lg sm:text-xl font-medium text-white/70 max-w-2xl leading-relaxed animate-fade-in-up delay-300">
                  {event.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up delay-400">
                <button 
                  onClick={() => document.getElementById("details")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
                >
                  বিস্তারিত পড়ুন
                </button>
                {event.has_registration && event.status === "upcoming" && !isPast && (
                  <button 
                    onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-gold-foreground shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:bg-gold/90 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                  >
                    রেজিস্ট্রেশন করুন
                  </button>
                )}
              </div>
            </div>

            {/* Right Info Card */}
            <div className="lg:col-span-6 xl:col-span-5 animate-fade-in-up delay-200">
              <div className="animate-float">
                <div className="rounded-3xl border border-white/20 border-t-gold/40 border-b-black/50 bg-white/5 backdrop-blur-md p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold/20 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
                
                <h4 className="text-sm font-bold text-gold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                  ইভেন্টের সময়সূচী ও স্থান
                </h4>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold border border-gold/20 shadow-inner">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">তারিখ</div>
                      <div className={`text-base font-semibold ${!isValidDate ? "text-white/40 italic" : "text-white"}`}>{dateStr}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold border border-gold/20 shadow-inner">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">সময়</div>
                      <div className={`text-base font-semibold ${!(event.time || (isValidDate ? d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) : null)) ? "text-white/40 italic" : "text-white"}`}>
                        {event.time || (isValidDate ? d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) : "—")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold border border-gold/20 shadow-inner">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">স্থান</div>
                      <div className={`text-base font-semibold leading-snug ${!event.location ? "text-white/40 italic" : "text-white"}`}>{event.location || "নির্ধারিত নয়"}</div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Light Theme Details Section */}
      <main id="details" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        
        {/* Description body */}
        <div className="mb-16 rounded-3xl bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gold/10 relative overflow-hidden flex flex-col">
          {/* Dark Header Area for Details */}
          <div className="bg-primary-dark text-white px-8 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-gold/80" />
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  ইভেন্ট বিস্তারিত
                </h3>
                <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-gold/80" />
              </div>
            </div>
          </div>

          {/* Light Body Area for Details */}
          <div className="p-8 sm:p-12 relative bg-[#FAFAFA]">
            {/* Subtle decorative background for details */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10">
              {event.featured_image && (
                <div className="mb-10 overflow-hidden rounded-2xl border border-border/50 shadow-sm">
                  <img src={event.featured_image} alt={event.title} className="w-full max-h-[500px] object-cover" />
                </div>
              )}
              
              {event.description ? (
                <div 
                  className="prose prose-lg prose-headings:text-primary-dark prose-a:text-gold prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-gold prose-ul:my-2 prose-ol:my-2 max-w-none text-muted-foreground leading-[2] font-medium"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-muted-foreground italic bg-muted/30 p-8 rounded-2xl border border-dashed border-gold/20 text-center font-medium">কোনো বিস্তারিত বিবরণ দেওয়া হয়নি।</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Registration Section (Centered at the bottom) */}
        <div id="registration" className="max-w-3xl mx-auto pt-16">
          {event.has_registration ? (
            event.status === "upcoming" && !isPast ? (
              <RegistrationPanel event={event} />
            ) : (
              <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
                <CheckCircle2 size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-2xl font-bold text-foreground">রেজিস্ট্রেশন বন্ধ</h3>
                <p className="mt-2 text-muted-foreground font-medium">
                  {isPast ? "এই ইভেন্টের সময়সীমা শেষ হয়ে গেছে, তাই রেজিস্ট্রেশন বন্ধ আছে।" : "এই ইভেন্টের রেজিস্ট্রেশন আর চালু নেই।"}
                </p>
              </div>
            )
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-gold/30 bg-gold/[0.02] p-12 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-primary-dark">সরাসরি অংশগ্রহণ</h3>
              <p className="mt-3 text-muted-foreground font-medium leading-relaxed max-w-lg mx-auto">এই ইভেন্টে অংশগ্রহণের জন্য কোনো পূর্ব-রেজিস্ট্রেশনের প্রয়োজন নেই। নির্ধারিত স্থান ও সময়ে সরাসরি উপস্থিত হয়ে অংশগ্রহণ করুন।</p>
            </div>
          )}
        </div>

        {/* Action Buttons (Moved to the very bottom) */}
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap items-center justify-center gap-4">
          <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-gold/20 px-8 py-3.5 text-sm font-bold text-primary-dark shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] hover:border-gold/50 hover:bg-gold/5 transition hover:-translate-y-0.5">
            <Share2 size={16} className="text-gold" /> ইভেন্ট শেয়ার করুন
          </button>
          <button onClick={handleGoogleCalendar} className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-gold/20 px-8 py-3.5 text-sm font-bold text-primary-dark shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] hover:border-gold/50 hover:bg-gold/5 transition hover:-translate-y-0.5">
            <CalendarPlus size={16} className="text-gold" /> ক্যালেন্ডারে যুক্ত করুন
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-card p-4 sm:p-5 flex flex-col justify-center">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        <Icon size={14} className="text-gold" /> {label}
      </div>
      <div className="mt-2 font-semibold text-foreground line-clamp-2">{value}</div>
    </div>
  );
}


/* ---------- User Facing Dynamic Registration Panel ---------- */

function RegistrationPanel({ event }: { event: any }) {
  let formSchema: FormFieldSchema[] = [];
  try {
    if (Array.isArray(event.form_schema)) {
      formSchema = event.form_schema;
    } else if (typeof event.form_schema === "string") {
      const parsed = JSON.parse(event.form_schema);
      if (Array.isArray(parsed)) formSchema = parsed;
    }
  } catch (e) {
    console.error("Failed to parse form schema", e);
  }
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await (supabase as any).from("event_registrations").insert({
        event_id: event.id,
        form_data: formData,
        status: "pending",
        created_by_admin: false,
      });

      if (error) throw error;
      
      setSuccess(true);
      toast.success("রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "কোথাও কোনো সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 p-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-foreground">রেজিস্ট্রেশন সফল!</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          আপনার রেজিস্ট্রেশনটি গ্রহণ করা হয়েছে। যাচাই বাছাই শেষে খুব শীঘ্রই কনফার্মেশন মেসেজ পাঠানো হবে ইনশাআল্লাহ্‌।
        </p>
      </div>
    );
  }

  const formatWhatsAppLink = (phone: string, eventTitle: string) => {
    let cleanNumber = phone.replace(/\D/g, "");
    if (cleanNumber.startsWith("0") && cleanNumber.length === 11) {
      cleanNumber = "88" + cleanNumber;
    }
    const msg = `আসসালামু আলাইকুম, আমি "${eventTitle || "ইভেন্ট"}"-এর রেজিস্ট্রেশন করতে চাচ্ছি। ফরম পূরণে আমার কিছু সহায়তার প্রয়োজন।`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const renderContactPill = (phone: string, eventTitle: string) => {
    return (
      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 pr-3 hover:bg-white/10 transition group">
        <a 
          href={`tel:${phone}`} 
          className="flex items-center gap-2 px-2.5 py-1 text-xs font-bold text-white transition hover:text-gold"
          title="সরাসরি কল করুন"
        >
          <Phone size={12} className="text-gold" />
          <span>{phone}</span>
        </a>
        <span className="h-4 w-px bg-white/20" />
        <a 
          href={formatWhatsAppLink(phone, eventTitle)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-emerald-400 hover:text-emerald-300 transition"
          title="হোয়াটসঅ্যাপে চ্যাট করুন"
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.419 1.451 5.626 0 10.201-4.577 10.205-10.203.002-2.727-1.058-5.29-2.99-7.224C17.35 1.246 14.79.186 12.067.186 6.438.186 1.863 4.762 1.859 10.39c0 1.93.503 3.81 1.457 5.413L2.348 21.6l5.964-1.564L8.31 20c-1.562.928-3.41 1.417-5.288 1.417h-.002c-5.114 0-9.27-4.159-9.27-9.278 0-1.77.502-3.49 1.45-4.965L1.836 2.19l4.811 1.26c1.474-.906 3.167-1.385 4.89-1.385.006 0 .012 0 .018 0 5.12 0 9.279 4.158 9.284 9.278.002 2.474-.96 4.8-2.71 6.556-1.748 1.758-4.072 2.726-6.547 2.728-.006 0-.012 0-.018 0zM17.15 14.15c-.28-.14-1.65-.815-1.91-.91-.25-.09-.43-.14-.62.14-.18.28-.7 1-.86 1.18-.16.18-.32.2-.6.06-2.58-1.294-4.225-3.606-4.9-4.78-.18-.32-.02-.49.12-.63.13-.13.28-.32.42-.48.14-.16.18-.28.28-.48.1-.2.05-.38-.02-.52-.07-.14-.62-1.49-.85-2.03-.22-.53-.47-.46-.62-.46-.15-.01-.32-.01-.5-.01-.17 0-.46.06-.7.33-.24.27-.92.9-1.22 1.76-.3.86-.42 2.22.42 3.32 1.25 1.63 3.1 2.8 5.82 3.82.9.34 1.62.54 2.17.72.63.2 1.2.17 1.65.1.5-.07 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
          </svg>
        </a>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-gold/20 bg-dark-luxe shadow-2xl relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 bg-star-pattern opacity-[0.02] pointer-events-none" />

      {/* Header Area */}
      <div className="px-8 pt-12 pb-8 relative z-10 text-center border-b border-gold/10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 text-gold mb-5 border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          অংশগ্রহণ নিশ্চিত করুন
        </h3>
        <p className="text-white/60 font-medium max-w-md mx-auto leading-relaxed">
          নিচের ফর্মটি নির্ভুলভাবে পূরণ করে ইভেন্টের জন্য আপনার আসন নিশ্চিত করুন।
        </p>
      </div>

      {/* Form Area */}
      <div className="p-8 sm:p-10 relative z-10 bg-primary-dark/30">
        {event.show_emergency_contact && (event.emergency_contact_phone1 || event.emergency_contact_phone2) && (
          <div className="mb-8 p-4 rounded-2xl border border-gold/20 bg-white/[0.03] backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
            <div className="text-left space-y-1 flex-1">
              <h4 className="text-sm font-bold text-gold flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
                {event.emergency_contact_title || "রেজিস্ট্রেশন ফর্ম পূরণ করতে সমস্যা হচ্ছে?"}
              </h4>
              <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                {event.emergency_contact_description || "যেকোনো জরুরি প্রয়োজনে সরাসরি যোগাযোগ করুন:"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {event.emergency_contact_phone1 && renderContactPill(event.emergency_contact_phone1, event.title)}
              {event.emergency_contact_phone2 && renderContactPill(event.emergency_contact_phone2, event.title)}
            </div>
          </div>
        )}

        {formSchema.length === 0 ? (
          <div className="text-center p-6 bg-white/5 rounded-xl text-sm font-medium border border-dashed border-white/10 text-white/70">
            ফর্ম সেটআপ করা হয়নি।
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formSchema.map((field) => {
            if (field.type === "section_title") {
              return (
                <div key={field.id} className="pt-6 pb-2 border-b border-gold/20">
                  <h4 className="text-lg font-bold text-gold">{field.label}</h4>
                  {field.hint && <p className="text-sm text-white/50 mt-1">{field.hint}</p>}
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-2">
                <Label className="text-white/90 font-bold text-[15px]">
                  {field.label} {field.required && <span className="text-gold">*</span>}
                </Label>
                {field.hint && <p className="text-xs text-white/50 font-medium">{field.hint}</p>}
                
                {field.type === "longtext" ? (
                  <textarea
                    required={field.required}
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-gold/50 focus:ring-1 focus:ring-gold/50 focus:bg-white/10"
                    placeholder="আপনার উত্তর..."
                  />
                ) : field.type === "dropdown" ? (
                  <Select
                    required={field.required}
                    value={formData[field.label] || ""}
                    onValueChange={(v) => setFormData({ ...formData, [field.label]: v })}
                  >
                    <SelectTrigger className="w-full bg-white/5 text-white border-white/10 rounded-xl h-12 focus:ring-gold/50 focus:border-gold/50">
                      <SelectValue placeholder="নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-luxe border-white/10 text-white">
                      {Array.isArray(field.options) && field.options.map((opt) => (
                        <SelectItem key={opt} value={opt} className="focus:bg-white/10 focus:text-white">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "radio" ? (
                  <div className="space-y-2 mt-2">
                    {Array.isArray(field.options) && field.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm font-medium hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5">
                        <input
                          type="radio"
                          name={field.label}
                          required={field.required && !formData[field.label]}
                          checked={formData[field.label] === opt}
                          onChange={() => setFormData({ ...formData, [field.label]: opt })}
                          className="h-4 w-4 border-white/20 bg-white/5 text-gold focus:ring-gold/50"
                        />
                        <span className="text-white/80">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2 mt-2">
                    {Array.isArray(field.options) && field.options.length > 0 ? (
                      // Multi-checkbox with options
                      field.options.map((opt) => {
                        const currentValues = formData[field.label] || [];
                        return (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm font-medium hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5">
                            <input
                              type="checkbox"
                              checked={currentValues.includes(opt)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...currentValues, opt]
                                  : currentValues.filter((v: string) => v !== opt);
                                setFormData({ ...formData, [field.label]: newValues });
                              }}
                              className="h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50"
                            />
                            <span className="text-white/80">{opt}</span>
                          </label>
                        );
                      })
                    ) : (
                      // Fallback for single boolean checkbox if no options are defined
                      <label className="flex items-center gap-3 mt-2 p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer">
                        <input
                          type="checkbox"
                          required={field.required}
                          checked={formData[field.label] || false}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.checked })}
                          className="h-5 w-5 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50"
                        />
                        <span className="text-sm font-medium text-white/90">হ্যাঁ, আমি একমত</span>
                      </label>
                    )}
                    {/* Add a hidden input if required but array is empty */}
                    {field.required && field.options && field.options.length > 0 && (!formData[field.label] || formData[field.label].length === 0) && (
                      <input type="checkbox" required className="opacity-0 absolute -z-10" />
                    )}
                  </div>
                ) : field.type === "file" ? (
                  <div className="mt-2">
                    <input
                      type="file"
                      required={field.required}
                      onChange={(e) => {
                        // Normally this would upload to storage and save URL.
                        // For now we just store the file name to pretend it worked.
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, [field.label]: file.name });
                        }
                      }}
                      className="w-full text-sm text-white/70 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 transition cursor-pointer border border-white/10 bg-white/5 p-2 rounded-xl"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                    required={field.required}
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-gold/50 focus:ring-1 focus:ring-gold/50 focus:bg-white/10"
                    placeholder={field.type === "phone" ? "01XXXXXXXXX" : field.type === "email" ? "example@email.com" : "আপনার উত্তর..."}
                  />
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={loading}
            className="mt-10 flex w-full h-14 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-base font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "রেজিস্ট্রেশন সম্পন্ন করুন"}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}