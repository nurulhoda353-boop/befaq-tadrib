import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trainings, centers, siteInfo, type Training } from "@/lib/data";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock, Calendar, Clock, MapPin, Users,
  Wallet, UtensilsCrossed, GraduationCap, X, BadgeCheck,
  ShieldCheck, AlertCircle, Info
} from "lucide-react";

const searchSchema = z.object({
  training: z.string().optional(),
  batch: z.string().optional(),
});

export const Route = createFileRoute("/admission")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "অনলাইন ভর্তি আবেদন — বেফাক প্রশিক্ষণ শাখা" },
      { name: "description", content: "আগামী ২৫ দিনের আসন্ন ব্যাচসমূহে ভর্তির আবেদন করুন।" },
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
  
  // Dummy DB of upcoming batches (next 25 days)
  const upcomingBatches = useMemo(() => [
    { id: "b1", trainingId: "c1", num: 36, start: "২২ জুন, ২০২৬", end: "০২ জুলাই, ২০২৬", seats: 40, filled: 28, centerId: "c1", fee: 1500, food: 3000 },
    { id: "b2", trainingId: "r1", num: 12, start: "২৫ জুন, ২০২৬", end: "৩০ জুন, ২০২৬", seats: 30, filled: 5, centerId: "r1", fee: 0, food: 0 },
    { id: "b3", trainingId: "c2", num: 45, start: "৩০ জুন, ২০২৬", end: "৩০ জুলাই, ২০২৬", seats: 60, filled: 20, centerId: "c1", fee: 1000, food: 4000 },
    { id: "b4", trainingId: "s3", num: 1, start: "১০ জুলাই, ২০২৬", end: "০৪ আগস্ট, ২০২৬", seats: 50, filled: 10, centerId: "c1", fee: 2000, food: 3500 },
  ], []);

  // Flow State
  const initialBatchId = search.batch || (search.training ? upcomingBatches.find(b => b.trainingId === search.training)?.id : null);
  
  const [step, setStep] = useState<Step>(initialBatchId ? "agreement" : "select");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(initialBatchId || null);
  const [agreed, setAgreed] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const selectedBatch = upcomingBatches.find(b => b.id === selectedBatchId);
  const selectedTraining = trainings.find(t => t.id === selectedBatch?.trainingId);

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
        {step === "select" && (
          <SelectBatchStep 
            batches={upcomingBatches} 
            onPick={(bId) => { setSelectedBatchId(bId); setStep("agreement"); }} 
          />
        )}

        {step === "agreement" && selectedBatch && selectedTraining && (
          <AgreementStep 
            training={selectedTraining}
            batch={selectedBatch}
            agreed={agreed}
            setAgreed={setAgreed}
            onBack={() => setStep("select")}
            onAgree={() => setStep("form")}
          />
        )}

        {step === "form" && selectedBatch && selectedTraining && (
          <FormStep 
            training={selectedTraining}
            batch={selectedBatch}
            onBack={() => setStep("agreement")}
            onSubmit={() => {
              setAppId("BTW-26-" + Math.floor(10000 + Math.random() * 90000));
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
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Calendar size={12} /> আগামী ২৫ দিনের তালিকা
        </span>
        <h1 className="text-2xl font-extrabold text-primary-dark sm:text-3xl">আসন্ন প্রশিক্ষণ ব্যাচসমূহ</h1>
        <p className="mt-3 text-muted-foreground">আপনার কাঙ্ক্ষিত ব্যাচটি নির্বাচন করে আবেদন প্রক্রিয়া শুরু করুন।</p>
      </div>

      <div className="grid gap-4">
        {batches.map(b => {
          const t = trainings.find(tr => tr.id === b.trainingId);
          if (!t) return null;
          const c = centers.find(center => center.id === b.centerId);
          return (
            <div key={b.id} className="group flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-border bg-card p-5 transition hover:border-gold/40 hover:shadow-elegant cursor-pointer" onClick={() => onPick(b.id)}>
              <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-gold/10 text-gold-bright border border-gold/20 shrink-0">
                <span className="text-xl font-extrabold leading-none">{toBn(b.num)}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">তম ব্যাচ</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'special' ? 'bg-gold text-gold-foreground' : 'bg-primary/10 text-primary'}`}>
                    {t.typeLabel}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground"><Clock size={12} className="inline mr-1" />{t.duration}</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark group-hover:text-gold transition-colors">{t.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-primary"/> শুরু: {b.start}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-primary"/> {c?.name}</span>
                </div>
              </div>
              <div className="sm:border-l sm:border-border sm:pl-5 flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">আসন বাকি</div>
                  <div className="text-sm font-bold text-foreground">{toBn(b.seats - b.filled)} টি</div>
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
  const c = centers.find(center => center.id === batch.centerId);
  const totalFee = batch.fee + batch.food;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={14} /> ব্যাচ পরিবর্তন
      </button>

      <div className="overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-elegant mb-8">
        <div className="relative bg-dark-luxe p-6 sm:p-8 text-primary-foreground border-b border-gold/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-star-pattern opacity-[0.03] pointer-events-none"
            aria-hidden
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]"
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          
          <div className="relative z-10 flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-white/20 backdrop-blur-sm border border-white/20 text-white">
              ব্যাচ {toBn(batch.num)}
            </span>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-gold text-gold-foreground border border-gold/50">
              {training.typeLabel}
            </span>
          </div>
          <h2 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white leading-tight">{training.name}</h2>
          <p className="relative z-10 mt-3 text-primary-foreground/80 text-sm max-w-2xl leading-relaxed">{training.description}</p>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary-dark border-b border-border pb-3 mb-5">ব্যাচ ডিটেইলস</h3>
          <dl className="grid sm:grid-cols-2 gap-y-5 gap-x-10">
            <InfoRow icon={Calendar} label="ক্লাস শুরু ও শেষ" value={`${batch.start} — ${batch.end}`} />
            <InfoRow icon={MapPin} label="প্রশিক্ষণ কেন্দ্র" value={`${c?.name}, ${c?.district}`} />
            <InfoRow icon={Users} label="আসন সংখ্যা" value={`মোট ${toBn(batch.seats)} জন (খালি: ${toBn(batch.seats - batch.filled)})`} />
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
  const [phone, setPhone] = useState("");
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={14} /> শর্তাবলীতে ফিরুন
      </button>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <Info size={24} className="text-primary shrink-0" />
          <div>
            <h3 className="font-bold text-primary-dark text-sm">অটো-ফিল মোড সক্রিয়</h3>
            <p className="text-xs text-primary-dark/80 mt-1">আপনি <strong>{training.name}</strong> এর <strong>{toBn(batch.num)}তম ব্যাচ</strong> নির্বাচন করেছেন। আপনার নির্বাচিত কোর্সের তথ্য ফর্মে স্বয়ংক্রিয়ভাবে যুক্ত হয়ে গেছে। শুধুমাত্র ব্যক্তিগত তথ্যগুলো পূরণ করুন।</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4 mb-6">ব্যক্তিগত তথ্য</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="পূর্ণ নাম (বাংলায়)" required />
            <Field label="পিতার নাম" required />
            <Field label="মাতার নাম" required />
            <Field label="জন্ম তারিখ" type="date" required />
            <Field label="জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর" required />
            <Field label="বেফাক রেজিস্ট্রেশন নম্বর (যদি থাকে)" required={false} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary-dark border-b border-border pb-4 mb-6">যোগাযোগ ও শিক্ষা</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="মোবাইল নম্বর (সক্রিয়)" value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
            <Field label="বিকল্প মোবাইল নম্বর" required={false} />
            <div className="sm:col-span-2">
              <Field label="বর্তমান ঠিকানা" required />
            </div>
            <div className="sm:col-span-2">
              <Field label="মাদরাসার নাম ও পূর্ণ ঠিকানা" required />
            </div>
            <Field label="সর্বশেষ শিক্ষাগত যোগ্যতা" placeholder="যেমন: দাওরায়ে হাদীস" required />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4">
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-dark">
            আবেদন জমা দিন <CheckCircle2 size={18} />
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
            <dd className="font-bold text-foreground text-right">{training.name}</dd>
          </div>
          <div className="flex justify-between pb-1">
            <dt className="text-muted-foreground">ব্যাচ:</dt>
            <dd className="font-bold text-foreground">{toBn(batch.num)}তম</dd>
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

function Field({ label, required = true, type = "text", placeholder, value, onChange }: any) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-primary-dark">
        {label} {required && <span className="text-destructive">*</span>}
        {!required && <span className="text-xs font-normal text-muted-foreground ml-1">(ঐচ্ছিক)</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
