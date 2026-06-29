import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteInfo } from "@/lib/data";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock, Calendar, Clock, MapPin, Users,
  Wallet, UtensilsCrossed, GraduationCap, X, BadgeCheck,
  ShieldCheck, AlertCircle, Info, Upload, Loader2
} from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  training: z.string().optional(),
  batch: z.string().optional(),
});

export const Route = createFileRoute("/admission")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "অনলাইন ভর্তি আবেদন — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "আসন্ন ব্যাচসমূহে ভর্তির আবেদন করুন।" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdmissionWindow,
});

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (v: string | number) => String(v).replace(/\d/g, (d) => bnDigits[+d]);

type Step = "select" | "agreement" | "form" | "success";

function AdmissionWindow() {
  const search = Route.useSearch();
  
  // Fetch Upcoming Batches from DB
  const { data: upcomingBatches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ["admission-upcoming-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_batches")
        .select(`
          *,
          trainings(*),
          centers(*)
        `)
        .eq("status", "upcoming")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Flow State
  const initialBatchId = search.batch || (search.training ? upcomingBatches.find((b:any) => b.trainings?.id === search.training)?.id : null);
  
  const [step, setStep] = useState<Step>(initialBatchId ? "agreement" : "select");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(initialBatchId || null);
  const [agreed, setAgreed] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const selectedBatch = upcomingBatches.find((b:any) => b.id === selectedBatchId);
  const selectedTraining = selectedBatch?.trainings;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* WINDOW HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-dark-luxe text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold-bright border border-gold/30">
              <GraduationCap size={20} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{siteInfo.shortName}</div>
              <div className="truncate text-[11px] text-primary-foreground/70 uppercase tracking-wider font-semibold">ভর্তি আবেদন উইন্ডো</div>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
          >
            <X size={14} /> বন্ধ করুন
          </button>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <Stepper step={step} />
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 sm:py-12">
        {loadingBatches && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>ব্যাচ তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {!loadingBatches && step === "select" && (
          <SelectBatchStep 
            batches={upcomingBatches} 
            onPick={(bId) => { setSelectedBatchId(bId); setStep("agreement"); }} 
          />
        )}

        {!loadingBatches && step === "agreement" && selectedBatch && selectedTraining && (
          <AgreementStep 
            training={selectedTraining}
            batch={selectedBatch}
            agreed={agreed}
            setAgreed={setAgreed}
            onBack={() => setStep("select")}
            onAgree={() => setStep("form")}
          />
        )}

        {!loadingBatches && step === "form" && selectedBatch && selectedTraining && (
          <FormStep 
            training={selectedTraining}
            batch={selectedBatch}
            onBack={() => setStep("agreement")}
            onSubmit={(newAppId: string) => {
              setAppId(newAppId);
              setStep("success");
            }}
          />
        )}

        {step === "success" && appId && selectedBatch && selectedTraining && (
          <SuccessStep 
            appId={appId} 
            training={selectedTraining} 
            batch={selectedBatch} 
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Stepper ---------------- */
function Stepper({ step }: { step: Step }) {
  const items: { id: Step; label: string }[] = [
    { id: "select", label: "ব্যাচ নির্বাচন" },
    { id: "agreement", label: "বিস্তারিত ও সম্মতি" },
    { id: "form", label: "ফরম পূরণ" },
    { id: "success", label: "সম্পন্ন" },
  ];
  const currentIdx = items.findIndex((i) => i.id === step);
  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {items.map((it, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={it.id} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
              done ? "bg-primary text-primary-foreground" : 
              active ? "bg-gold text-gold-foreground ring-2 ring-gold/20" : 
              "bg-muted text-muted-foreground"
            }`}>
              {done ? <CheckCircle2 size={12} /> : toBn(i + 1)}
            </div>
            <span className={`hidden text-xs font-bold sm:inline ${active ? "text-primary-dark" : done ? "text-foreground" : "text-muted-foreground"}`}>{it.label}</span>
            {i < items.length - 1 && <div className={`h-[2px] flex-1 rounded-full ${done ? "bg-primary/50" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Steps ---------------- */
function SelectBatchStep({ batches, onPick }: { batches: any[], onPick: (id: string) => void }) {
  if (batches.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>বর্তমানে কোনো নতুন ব্যাচের ভর্তি চলছে না।</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Calendar size={12} /> আসন্ন তালিকা
        </span>
        <h1 className="text-2xl font-extrabold text-primary-dark sm:text-3xl">প্রশিক্ষণ ব্যাচসমূহ</h1>
        <p className="mt-3 text-muted-foreground">আপনার কাঙ্ক্ষিত ব্যাচটি নির্বাচন করে আবেদন প্রক্রিয়া শুরু করুন।</p>
      </div>

      <div className="grid gap-4">
        {batches.map(b => {
          const t = b.trainings;
          const c = b.centers;
          const filled = 0; // Temporarily 0, later fetch actual count
          return (
            <div key={b.id} className="group flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-border bg-card p-5 transition hover:border-gold/40 hover:shadow-elegant cursor-pointer" onClick={() => onPick(b.id)}>
              <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-gold/10 text-gold-bright border border-gold/20 shrink-0">
                <span className="text-xl font-extrabold leading-none">{toBn(b.batch_number)}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">তম ব্যাচ</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary capitalize">
                    {t?.type}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground"><Clock size={12} className="inline mr-1" />{t?.duration}</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark group-hover:text-gold transition-colors">{t?.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-primary"/> শুরু: {b.start_date || 'অপেক্ষমান'}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-primary"/> {c?.name}</span>
                </div>
              </div>
              <div className="sm:border-l sm:border-border sm:pl-5 flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">আসন বাকি</div>
                  <div className="text-sm font-bold text-foreground">{toBn(b.total_seats - filled)} টি</div>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm group-hover:bg-primary-dark transition">
                  নির্বাচন করুন
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgreementStep({ training, batch, agreed, setAgreed, onBack, onAgree }: any) {
  const c = batch.centers;
  const totalFee = (batch.fee || 0) + (batch.food_fee || 0);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={14} /> ব্যাচ পরিবর্তন
      </button>

      <div className="overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-elegant mb-8">
        <div className="relative bg-dark-luxe p-6 sm:p-8 text-primary-foreground border-b border-gold/20 overflow-hidden">
          <div className="relative z-10 flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-white/20 backdrop-blur-sm border border-white/20 text-white">
              ব্যাচ {toBn(batch.batch_number)}
            </span>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-gold text-gold-foreground border border-gold/50 capitalize">
              {training.type}
            </span>
          </div>
          <h2 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white leading-tight">{training.title}</h2>
          <p className="relative z-10 mt-3 text-primary-foreground/80 text-sm max-w-2xl leading-relaxed">{training.description}</p>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary-dark border-b border-border pb-3 mb-5">ব্যাচ ডিটেইলস</h3>
          <dl className="grid sm:grid-cols-2 gap-y-5 gap-x-10">
            <InfoRow icon={Calendar} label="ক্লাস শুরু ও শেষ" value={`${batch.start_date || '-'} — ${batch.end_date || '-'}`} />
            <InfoRow icon={MapPin} label="প্রশিক্ষণ কেন্দ্র" value={`${c?.name || '-'}`} />
            <InfoRow icon={Users} label="আসন সংখ্যা" value={`মোট ${toBn(batch.total_seats)} জন`} />
            <InfoRow icon={Wallet} label="মোট ফি (ভর্তি + খোরাকি)" value={totalFee === 0 ? "সম্পূর্ণ বিনামূল্যে" : `${toBn(totalFee)} টাকা`} />
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck size={24} className="text-primary shrink-0" />
          <div>
            <h3 className="font-bold text-primary-dark text-lg">শর্তাবলী ও সম্মতি</h3>
            <p className="text-sm text-muted-foreground mt-1">আবেদন করার পূর্বে অবশ্যই নিচের শর্তাবলী পড়ে সম্মতি প্রদান করুন।</p>
          </div>
        </div>
        
        <ul className="space-y-2 mb-6 text-sm text-foreground bg-muted/40 p-5 rounded-xl border border-border">
          <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5"/> প্রদত্ত সকল তথ্য সঠিক ও নির্ভুল হতে হবে।</li>
          <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5"/> ভর্তি অনুমোদনের পর কেন্দ্রে এসে ফি (যদি থাকে) পরিশোধ করতে হবে।</li>
          <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5"/> প্রশিক্ষণে শতভাগ উপস্থিতি এবং শৃঙ্খলা বজায় রাখা বাধ্যতামূলক।</li>
          <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5"/> অসম্পূর্ণ বা ভুয়া তথ্য প্রদান করলে আবেদন বাতিল বলে গণ্য হবে।</li>
        </ul>

        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="h-5 w-5 rounded border-primary text-primary accent-primary" />
          <span className="font-bold text-primary-dark text-sm">আমি উপরোক্ত শর্তসমূহ পড়েছি এবং সম্পূর্ণ সম্মত আছি।</span>
        </label>

        <div className="mt-8 flex justify-end">
          <button
            disabled={!agreed}
            onClick={onAgree}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-bold text-gold-foreground shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            সম্মতি দিন ও ফরম পূরণ করুন <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormStep({ training, batch, onBack, onSubmit }: any) {
  const isHuffazul = training.title.includes("হুফফাযুল") || training.title.includes("নূরানী");
  const isDarseyat = training.title.includes("দরসিয়াত");
  const isHastalipi = training.title.includes("হস্তলিপি");

  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  
  // Common Fields
  const [formData, setFormData] = useState<any>({
    applicant_name: "",
    phone: "",
    father_name: "",
    dob: "",
    nid_no: "",
    present_address: "",
    permanent_address: "",
    current_madrasa: "",
    madrasa_address: "",
    muhtamim_name: "",
    muhtamim_mobile: "",
    guardian_mobile: "",
    // Dynamic
    highest_education: "",
    faragat_year: "",
    division: "",
    graduated_madrasa: "",
    graduated_madrasa_address: "",
    current_designation: "",
    teaching_experience: "",
    board: "",
    darseyat_kitabs: "",
    profession_type: "teacher",
    current_class: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let photoPath = null;
      
      // 1. Upload Photo if selected
      if (photo) {
        const ext = photo.name.split('.').pop();
        const filename = `admissions/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("cms-attachments")
          .upload(filename, photo, { contentType: photo.type });
          
        if (uploadError) throw uploadError;
        photoPath = uploadData.path;
      }

      // 2. Prepare Payload
      const payload = {
        training_batch_id: batch.id,
        applicant_name: formData.applicant_name,
        phone: formData.phone,
        madrasa_name: formData.current_madrasa,
        application_status: "pending",
        payment_status: "unpaid",
        form_data: {
          ...formData,
          profile_photo_path: photoPath
        }
      };

      // 3. Insert Admission
      const { data, error } = await supabase
        .from("training_admissions")
        .insert(payload)
        .select("id")
        .single();
        
      if (error) throw error;
      
      // Success
      toast.success("আবেদন সফলভাবে সাবমিট হয়েছে");
      onSubmit(data.id.substring(0, 8).toUpperCase());

    } catch (err: any) {
      toast.error(err.message || "আবেদন সাবমিট করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={14} /> শর্তাবলীতে ফিরুন
      </button>

      <form onSubmit={handleSubmitForm} className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <Info size={24} className="text-primary shrink-0" />
          <div>
            <h3 className="font-bold text-primary-dark text-sm">ভর্তি ফরম: {training.title}</h3>
            <p className="text-xs text-primary-dark/80 mt-1">দয়া করে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন। আপনার প্রদত্ত তথ্যের ভিত্তিতেই ভর্তি নিশ্চিত করা হবে।</p>
          </div>
        </div>

        {/* Common Info Section */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4">ব্যক্তিগত তথ্য</h2>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
               <label className="block text-sm font-bold text-primary-dark mb-2">প্রোফাইল ছবি (ঐচ্ছিক)</label>
               <div className="h-32 w-32 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-muted/50 transition">
                  {photo ? (
                    <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={24} className="text-muted-foreground mb-2 group-hover:text-primary transition" />
                      <span className="text-[10px] text-muted-foreground font-medium text-center px-2">ছবি আপলোড করুন</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <Field label="পূর্ণ নাম (বাংলায়)" name="applicant_name" value={formData.applicant_name} onChange={handleChange} required />
              <Field label="মোবাইল নম্বর (সক্রিয়)" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXXXXXXXX" required />
              <Field label="পিতার নাম" name="father_name" value={formData.father_name} onChange={handleChange} required />
              <Field label="জন্ম তারিখ" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              <Field label="জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর" name="nid_no" value={formData.nid_no} onChange={handleChange} required={false} />
              <Field label="অভিভাবকের মোবাইল" name="guardian_mobile" value={formData.guardian_mobile} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4">ঠিকানা ও বর্তমান মাদরাসা</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="বর্তমান ঠিকানা" name="present_address" value={formData.present_address} onChange={handleChange} required />
            <Field label="স্থায়ী ঠিকানা (গ্রাম, ডাকঘর, উপজেলা, জেলা)" name="permanent_address" value={formData.permanent_address} onChange={handleChange} required />
            <Field label="যে মাদরাসা থেকে এসেছেন (নাম)" name="current_madrasa" value={formData.current_madrasa} onChange={handleChange} required />
            <Field label="উক্ত মাদরাসার ঠিকানা" name="madrasa_address" value={formData.madrasa_address} onChange={handleChange} required />
            <Field label="মুহতামিমের নাম" name="muhtamim_name" value={formData.muhtamim_name} onChange={handleChange} required />
            <Field label="মুহতামিমের মোবাইল" name="muhtamim_mobile" value={formData.muhtamim_mobile} onChange={handleChange} required />
          </div>
        </div>

        {/* Dynamic Sections Based on Course */}
        {(isHuffazul || isDarseyat) && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4">শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="সর্বোচ্চ শিক্ষাগত যোগ্যতা" name="highest_education" value={formData.highest_education} onChange={handleChange} placeholder="যেমন: দাওরায়ে হাদীস" required />
              <Field label="ফারাগত সন" name="faragat_year" value={formData.faragat_year} onChange={handleChange} required />
              <Field label="বিভাগ/ফলাফল" name="division" value={formData.division} onChange={handleChange} required />
              
              {isDarseyat && (
                <Field label="বোর্ড" name="board" value={formData.board} onChange={handleChange} required />
              )}
              
              <Field label="যে মাদরাসা থেকে ফারেগ হয়েছেন" name="graduated_madrasa" value={formData.graduated_madrasa} onChange={handleChange} required />
              <Field label="ফারেগ হওয়া মাদরাসার ঠিকানা" name="graduated_madrasa_address" value={formData.graduated_madrasa_address} onChange={handleChange} required />
              <Field label="যে দায়িত্বে আছেন (বর্তমান পেশা)" name="current_designation" value={formData.current_designation} onChange={handleChange} required />
              <Field label="শিক্ষকতার অভিজ্ঞতা (বছর)" name="teaching_experience" value={formData.teaching_experience} onChange={handleChange} required />
            </div>

            {isDarseyat && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-primary-dark mb-2">দরসিয়াতের কী কী কিতাব পড়িয়েছেন/পড়াচ্ছেন? <span className="text-destructive">*</span></label>
                <textarea 
                  name="darseyat_kitabs"
                  value={formData.darseyat_kitabs}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>
            )}
          </div>
        )}

        {isHastalipi && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4">পেশাগত তথ্য</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary-dark mb-2">পেশার ধরন <span className="text-destructive">*</span></label>
                <select name="profession_type" value={formData.profession_type} onChange={handleChange} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="teacher">শিক্ষক</option>
                  <option value="student">ছাত্র</option>
                </select>
              </div>
              
              {formData.profession_type === "student" && (
                <Field label="কোন জামাতে পড়ছেন?" name="current_class" value={formData.current_class} onChange={handleChange} required />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-4">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-70">
            {submitting ? <><Loader2 className="animate-spin" size={18} /> সাবমিট হচ্ছে...</> : <>আবেদন জমা দিন <CheckCircle2 size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessStep({ appId, training, batch }: any) {
  return (
    <div className="animate-in zoom-in-95 duration-500 rounded-3xl border-2 border-gold/30 bg-card p-8 sm:p-12 text-center shadow-2xl">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-6 border-2 border-green-500/20">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-2xl sm:text-4xl font-extrabold text-primary-dark mb-4">আলহামদুলিল্লাহ! আবেদন সফল হয়েছে।</h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
        আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। যাচাইকরণ শেষে আপনার মোবাইল নম্বরে এস.এম.এস এর মাধ্যমে ভর্তি নিশ্চিত করা হবে।
      </p>

      <div className="mt-8 mx-auto max-w-sm rounded-xl border border-border bg-muted/30 p-5 text-left">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-4">আবেদন সারাংশ</div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">আবেদন আইডি:</dt>
            <dd className="font-bold text-primary">{appId}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">প্রশিক্ষণ:</dt>
            <dd className="font-bold text-foreground text-right">{training.title}</dd>
          </div>
          <div className="flex justify-between pb-1">
            <dt className="text-muted-foreground">ব্যাচ:</dt>
            <dd className="font-bold text-foreground">{toBn(batch.batch_number)}তম</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10">
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-bold text-foreground hover:bg-muted transition">
          হোমপেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-primary mt-0.5 shrink-0" />
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-1 font-bold text-foreground text-sm">{value}</dd>
      </div>
    </div>
  );
}

function Field({ label, name, required = true, type = "text", placeholder, value, onChange }: any) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-sm font-bold text-primary-dark">
        {label} {required && <span className="text-destructive">*</span>}
        {!required && <span className="text-xs font-normal text-muted-foreground ml-1">(ঐচ্ছিক)</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
