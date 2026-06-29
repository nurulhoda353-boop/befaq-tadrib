import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  Edit3,
  GripVertical,
  Save,
  Trash,
  Sparkles,
  FileText,
  PlusCircle,
  CheckCircle2,
  FolderOpen,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface FormFieldSchema {
  id: string;
  label: string;
  hint?: string;
  type: "text" | "longtext" | "number" | "phone" | "email" | "dropdown" | "radio" | "checkbox" | "file" | "section_title";
  required: boolean;
  options?: string[]; // Used for dropdowns, radio, checkbox
}

interface FormBuilderProps {
  fields: FormFieldSchema[];
  onChange: (fields: FormFieldSchema[]) => void;
}

const DEFAULT_TEMPLATES = [
  {
    name: "সাধারণ ভর্তি ফরম (Standard Admission)",
    fields: [
      { id: "p1", label: "পূর্ণ নাম (বাংলায়)", type: "text", required: true },
      { id: "p2", label: "পিতার নাম", type: "text", required: true },
      { id: "p3", label: "মোবাইল নাম্বার", type: "phone", required: true },
      { id: "p4", label: "ইমেইল ঠিকানা", type: "email", required: false },
      { id: "p5", label: "স্থায়ী ঠিকানা", type: "longtext", required: true },
      { id: "p6", label: "শিক্ষাগত যোগ্যতা", type: "dropdown", required: true, options: ["দাখিল/এসএসসি", "আলিম/এইচএসসি", "ফজিলত", "তাকমিল/মাস্টার্স"] },
    ]
  },
  {
    name: "ইভেন্ট রেজিস্ট্রেশন ফরম (Event Registration)",
    fields: [
      { id: "e1", label: "অংশগ্রহণকারীর নাম", type: "text", required: true },
      { id: "e2", label: "মোবাইল নাম্বার (হোয়াটসঅ্যাপ সহ)", type: "phone", required: true },
      { id: "e3", label: "আপনি কি পূর্বে অংশ নিয়েছেন?", type: "radio", required: true, options: ["হ্যাঁ", "না"] },
      { id: "e4", label: "মাদরাসা/প্রতিষ্ঠানের নাম", type: "text", required: true },
      { id: "e5", label: "থাকা ও খাওয়ার সুবিধা প্রয়োজন?", type: "dropdown", required: true, options: ["হ্যাঁ, প্রয়োজন", "না, প্রয়োজন নেই"] },
    ]
  },
  {
    name: "ফিডব্যাক ফরম (Feedback Form)",
    fields: [
      { id: "f1", label: "আপনার নাম", type: "text", required: false },
      { id: "f2", label: "প্রশিক্ষণের মান কেমন লেগেছে?", type: "radio", required: true, options: ["খুব ভালো", "ভালো", "মোটামুটি", "উন্নতি প্রয়োজন"] },
      { id: "f3", label: "যেকোনো পরামর্শ বা মন্তব্য", type: "longtext", required: false },
    ]
  }
];

const PRESETS = [
  { label: "পূর্ণ নাম", type: "text" },
  { label: "মোবাইল নাম্বার", type: "phone" },
  { label: "ইমেইল", type: "email" },
  { label: "মাদরাসা/প্রতিষ্ঠান", type: "text" },
  { label: "জেলা", type: "dropdown", options: ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"] },
  { label: "জন্ম তারিখ", type: "text" },
  { label: "জাতীয় পরিচয়পত্র (NID)", type: "number" }
];

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Drag & drop index states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  // Template Manager States
  const [customTemplates, setCustomTemplates] = useState<{ name: string; fields: any[] }[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  // Bulk options input states
  const [bulkInputId, setBulkInputId] = useState<string | null>(null);
  const [bulkInputText, setBulkInputText] = useState("");

  // Load custom templates on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("befaq_form_templates");
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load templates from localStorage", e);
    }
  }, []);

  // Autofocus first field or keep selected field active
  useEffect(() => {
    if (fields.length > 0 && !activeId) {
      setActiveId(fields[0].id);
    }
  }, [fields, activeId]);

  // Close template dropdown on outside click
  useEffect(() => {
    if (!showTemplates) return;
    const handler = (e: MouseEvent) => {
      if (templateBtnRef.current && !templateBtnRef.current.closest(".template-dropdown-container")?.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTemplates]);

  const addField = () => {
    const newField: FormFieldSchema = {
      id: crypto.randomUUID(),
      label: "নতুন প্রশ্ন",
      type: "text",
      required: false,
    };
    onChange([...fields, newField]);
    setActiveId(newField.id);
  };

  const addPreset = (preset: typeof PRESETS[number]) => {
    const newField: FormFieldSchema = {
      id: crypto.randomUUID(),
      label: preset.label,
      type: preset.type as any,
      required: true,
      options: "options" in preset ? preset.options : undefined
    };
    onChange([...fields, newField]);
    setActiveId(newField.id);
    toast.success(`"${preset.label}" প্রিসেট যুক্ত করা হয়েছে`);
  };

  const updateField = (id: string, updates: Partial<FormFieldSchema>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string, label: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (activeId === id) {
      setActiveId(fields.length > 1 ? fields[fields.findIndex(f => f.id === id) === 0 ? 1 : 0].id : null);
    }
    toast.error(`"${label}" প্রশ্নটি মুছে ফেলা হয়েছে`);
  };

  const duplicateField = (field: FormFieldSchema, index: number) => {
    const duplicated: FormFieldSchema = {
      ...JSON.parse(JSON.stringify(field)),
      id: crypto.randomUUID(),
      label: `${field.label} (Copy)`
    };
    const newFields = [...fields];
    newFields.splice(index + 1, 0, duplicated);
    onChange(newFields);
    setActiveId(duplicated.id);
    toast.success("প্রশ্নটি ডুপ্লিকেট করা হয়েছে");
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    onChange(newFields);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setActiveId(fields[index].id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFields = [...fields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, removed);
    
    onChange(newFields);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  // Template Manager Operations
  const loadTemplate = (templateFields: any[]) => {
    if (fields.length > 0) {
      if (!window.confirm("আপনি কি এই টেমপ্লেটটি লোড করতে চান? আপনার বর্তমান সমস্ত প্রশ্ন ও পরিবর্তন মুছে যাবে।")) {
        return;
      }
    }
    const hydratedFields = templateFields.map(f => ({
      ...f,
      id: crypto.randomUUID()
    }));
    onChange(hydratedFields);
    if (hydratedFields.length > 0) {
      setActiveId(hydratedFields[0].id);
    }
    setShowTemplates(false);
    toast.success("টেমপ্লেট সফলভাবে লোড করা হয়েছে");
  };

  const saveCustomTemplate = () => {
    if (!templateNameInput.trim()) {
      toast.error("অনুগ্রহ করে টেমপ্লেটের একটি নাম দিন");
      return;
    }
    if (fields.length === 0) {
      toast.error("ফাঁকা ফর্ম টেমপ্লেট হিসেবে সেভ করা যাবে না");
      return;
    }
    const newTemplate = {
      name: templateNameInput.trim(),
      fields: JSON.parse(JSON.stringify(fields))
    };
    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem("befaq_form_templates", JSON.stringify(updated));
    setTemplateNameInput("");
    toast.success("টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে!");
  };

  const deleteCustomTemplate = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি এই কাস্টম টেমপ্লেটটি মুছে ফেলতে চান?")) return;
    const updated = customTemplates.filter((_, i) => i !== index);
    setCustomTemplates(updated);
    localStorage.setItem("befaq_form_templates", JSON.stringify(updated));
    toast.error("কাস্টম টেমপ্লেটটি মুছে ফেলা হয়েছে");
  };

  // Bulk options handling
  const handleApplyBulkOptions = (id: string) => {
    const lines = bulkInputText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast.error("অনুগ্রহ করে অন্তত ১টি অপশন লিখুন");
      return;
    }

    updateField(id, { options: lines });
    setBulkInputId(null);
    setBulkInputText("");
    toast.success(`${lines.length}টি অপশন সফলভাবে বাল্ক আপডেট করা হয়েছে`);
  };

  const addOtherOption = (id: string, options: string[] = []) => {
    if (options.includes("অন্যান্য (লিখুন)")) {
      toast.error("ইতোমধ্যে 'অন্যান্য' অপশন যোগ করা আছে");
      return;
    }
    updateField(id, { options: [...options, "অন্যান্য (লিখুন)"] });
    toast.success("'অন্যান্য' অপশন যুক্ত করা হয়েছে");
  };

  const needsOptions = (type: string) => ["dropdown", "radio", "checkbox"].includes(type);
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBn = (v: string | number) => String(v).replace(/\d/g, (d) => bnDigits[+d]);

  return (
    <div className="dark bg-dark-luxe text-foreground space-y-5 rounded-2xl border border-gold/30 shadow-soft relative overflow-visible p-[2px]">
      {/* Gold accent top stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent rounded-t-2xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-border px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Sparkles size={14} />
            </span>
            ইভেন্ট রেজিস্ট্রেশন ফর্ম বিল্ডার
          </h4>
          <p className="text-xs text-muted-foreground pl-9">
            আপনার ইভেন্টের জন্য কাস্টম প্রশ্ন ও রেজিস্ট্রেশন ফরম তৈরি করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted p-1 border border-border shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 size={12} /> প্রশ্ন এডিটর
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye size={12} /> প্রিভিউ ({toBn(fields.length)}টি)
            </button>
          </div>

          {/* Template Manager */}
          <div className="relative template-dropdown-container">
            <button
              ref={templateBtnRef}
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 hover:bg-gold/20 px-3 text-xs font-bold text-gold-foreground transition"
            >
              <FolderOpen size={13} className="text-gold" /> টেমপ্লেট
              <ChevronDown size={11} className={`text-gold transition-transform ${showTemplates ? "rotate-180" : ""}`} />
            </button>

            {showTemplates && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-card p-4 shadow-elegant animate-in fade-in slide-in-from-top-2 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <FolderOpen size={12} className="text-gold" /> টেমপ্লেট নির্বাচন
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    বন্ধ করুন ✕
                  </button>
                </div>

                {/* Save current as template */}
                <div className="space-y-2 pb-3 border-b border-border mb-3">
                  <Label className="text-[10px] text-muted-foreground font-bold">চলমান ডিজাইন কাস্টম টেমপ্লেট হিসেবে সেভ করুন:</Label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="টেমপ্লেটের নাম লিখুন..."
                      value={templateNameInput}
                      onChange={(e) => setTemplateNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveCustomTemplate()}
                      className="h-9 flex-1 rounded-lg bg-background px-3 text-xs text-foreground border border-border outline-none focus:border-gold transition-colors"
                    />
                    <button
                      type="button"
                      onClick={saveCustomTemplate}
                      className="h-9 rounded-lg bg-gold px-3 text-xs font-bold text-gold-foreground transition hover:brightness-110 flex items-center gap-1 shrink-0"
                    >
                      <Save size={12} /> সেভ
                    </button>
                  </div>
                </div>

                {/* Custom Templates */}
                {customTemplates.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] text-gold font-bold block tracking-wide uppercase">আমার সেভ করা টেমপ্লেট:</span>
                    {customTemplates.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadTemplate(t.fields)}
                        className="group/tmp flex items-center justify-between rounded-xl border border-border bg-muted/50 p-2.5 hover:bg-gold/10 hover:border-gold/40 transition-all cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-foreground truncate pr-2">{t.name}</span>
                        <button
                          type="button"
                          onClick={(e) => deleteCustomTemplate(e, idx)}
                          className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover/tmp:opacity-100 transition-opacity"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default Templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold block tracking-wide uppercase">ডিফল্ট টেমপ্লেট:</span>
                  {DEFAULT_TEMPLATES.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => loadTemplate(t.fields)}
                      className="rounded-xl border border-border bg-muted/30 p-2.5 hover:bg-gold/10 hover:border-gold/30 transition-all cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-foreground block">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{toBn(t.fields.length)}টি প্রশ্ন</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-5">
        {activeTab === "edit" ? (
          <>
            {/* QUICK PRESETS ROW */}
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <span className="text-[10px] text-gold font-bold block mb-2 tracking-wider uppercase">দ্রুত প্রশ্ন যোগ করুন</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPreset(p)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gold/25 bg-card hover:bg-gold/10 hover:border-gold/50 active:scale-95 text-[11px] font-semibold text-foreground px-3 transition-all shadow-sm cursor-pointer"
                  >
                    <PlusCircle size={11} className="text-gold" /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FIELDS LIST */}
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gold/20 bg-muted/20 p-12 text-center animate-in fade-in">
                  <FileText className="mx-auto text-gold/40 mb-3" size={36} />
                  <p className="text-sm font-semibold text-muted-foreground">এখনও কোনো প্রশ্ন যোগ করা হয়নি।</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">উপরের প্রিসেট বা নিচের বাটন থেকে শুরু করুন।</p>
                </div>
              ) : (
                fields.map((field, index) => {
                  const isActive = field.id === activeId;
                  
                  return (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setActiveId(field.id)}
                      className={`relative rounded-xl border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "border-l-4 border-l-gold border-y-gold/30 border-r-gold/30 bg-gold/5 shadow-sm ring-1 ring-gold/20"
                          : "border-border bg-card hover:bg-muted/30 hover:border-gold/20 shadow-sm"
                      } ${draggedIndex === index ? "opacity-40 border-dashed" : ""} ${
                        draggedOverIndex === index ? "border-t-2 border-t-gold" : ""
                      }`}
                    >
                      {/* Grip Handle */}
                      <div className="flex h-5 w-full items-center justify-center bg-muted/50 opacity-50 hover:opacity-100 transition-opacity select-none cursor-grab active:cursor-grabbing border-b border-border/50 rounded-t-xl">
                        <GripVertical size={13} className="text-muted-foreground" />
                      </div>

                      <div className="p-4 pt-2">
                        {isActive ? (
                          /* ACTIVE (EDIT) CARD */
                          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              {/* Label Input */}
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">প্রশ্নের শিরোনাম</Label>
                                <input
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  className="h-10 w-full rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/50 px-3 text-sm font-semibold outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                                  placeholder={field.type === "section_title" ? "সেকশন শিরোনাম" : "আপনার প্রশ্ন লিখুন"}
                                />
                              </div>

                              {/* Type Selector */}
                              <div className="w-full sm:w-52 space-y-1 shrink-0">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">উত্তরের ধরন</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(val: any) => updateField(field.id, { type: val })}
                                >
                                  <SelectTrigger className="h-10 bg-background border-border text-foreground text-xs font-bold focus:ring-gold/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="text" className="focus:bg-gold/10">ছোট উত্তর (Short Answer)</SelectItem>
                                    <SelectItem value="longtext" className="focus:bg-gold/10">বড় উত্তর (Paragraph)</SelectItem>
                                    <SelectItem value="dropdown" className="focus:bg-gold/10">ড্রপডাউন (Dropdown)</SelectItem>
                                    <SelectItem value="radio" className="focus:bg-gold/10">মাল্টিপল চয়েস (Radio)</SelectItem>
                                    <SelectItem value="checkbox" className="focus:bg-gold/10">চেকবক্স (Checkboxes)</SelectItem>
                                    <SelectItem value="number" className="focus:bg-gold/10">নাম্বার (Number)</SelectItem>
                                    <SelectItem value="phone" className="focus:bg-gold/10">মোবাইল নাম্বার (Phone)</SelectItem>
                                    <SelectItem value="email" className="focus:bg-gold/10">ইমেইল (Email)</SelectItem>
                                    <SelectItem value="file" className="focus:bg-gold/10">ফাইল আপলোড (File)</SelectItem>
                                    <SelectItem value="section_title" className="focus:bg-gold/10">সেকশন টাইটেল (Title Only)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Hint Input */}
                            {field.type !== "section_title" && (
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">সাহায্যকারী হিন্ট (ঐচ্ছিক)</Label>
                                <input
                                  value={field.hint || ""}
                                  onChange={(e) => updateField(field.id, { hint: e.target.value })}
                                  className="h-9 w-full rounded-lg bg-background border border-border px-3 text-xs text-foreground outline-none focus:border-gold/50 transition-colors placeholder-muted-foreground/40"
                                  placeholder="যেমন: পাসপোর্ট অনুযায়ী নাম লিখুন"
                                />
                              </div>
                            )}

                            {/* Options Editor */}
                            {needsOptions(field.type) && (
                              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5 animate-in fade-in-50 duration-200">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                  <Label className="text-xs font-bold text-gold">অপশন সেটিংস</Label>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBulkInputId(field.id);
                                        setBulkInputText((field.options || []).join("\n"));
                                      }}
                                      className="text-[10px] font-bold text-primary hover:underline"
                                    >
                                      বাল্ক ইনপুট
                                    </button>
                                    {field.type !== "dropdown" && (
                                      <>
                                        <span className="text-border text-xs">|</span>
                                        <button
                                          type="button"
                                          onClick={() => addOtherOption(field.id, field.options)}
                                          className="text-[10px] font-bold text-primary hover:underline"
                                        >
                                          + অন্যান্য
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {bulkInputId === field.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full text-xs font-mono p-3 border border-border bg-background text-foreground rounded-lg focus:border-gold outline-none h-24 resize-none"
                                      placeholder={"প্রতিটি লাইনে একটি অপশন লিখুন:\nঅপশন ১\nঅপশন ২\nঅপশন ৩"}
                                      value={bulkInputText}
                                      onChange={(e) => setBulkInputText(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setBulkInputId(null)}
                                        className="h-7 px-3 rounded-lg border border-border bg-background text-[10px] font-bold text-foreground transition hover:bg-muted"
                                      >
                                        বাতিল
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleApplyBulkOptions(field.id)}
                                        className="h-7 px-3 rounded-lg bg-gold text-[10px] font-bold text-gold-foreground transition hover:brightness-110"
                                      >
                                        আপডেট করুন
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {(field.options || []).map((opt, optIndex) => (
                                      <div key={optIndex} className="flex items-center gap-2 group/opt">
                                        <span className="text-xs text-gold font-bold w-5 shrink-0 text-right">
                                          {optIndex + 1}.
                                        </span>
                                        <input
                                          value={opt}
                                          onChange={(e) => {
                                            const newOpts = [...(field.options || [])];
                                            newOpts[optIndex] = e.target.value;
                                            updateField(field.id, { options: newOpts });
                                          }}
                                          className="flex-1 border-b border-border bg-transparent py-1.5 text-xs text-foreground outline-none focus:border-gold focus:border-b-2 transition-all"
                                          placeholder={`অপশন ${optIndex + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOpts = [...(field.options || [])];
                                            newOpts.splice(optIndex, 1);
                                            updateField(field.id, { options: newOpts });
                                          }}
                                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition opacity-0 group-hover/opt:opacity-100"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOpts = [...(field.options || []), `অপশন ${(field.options?.length || 0) + 1}`];
                                        updateField(field.id, { options: newOpts });
                                      }}
                                      className="text-[11px] text-gold/80 hover:text-gold hover:underline font-bold mt-1 flex items-center gap-1 pl-7"
                                    >
                                      + নতুন অপশন যোগ করুন
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                              {/* Required Switch */}
                              <div className="flex items-center gap-2">
                                {field.type !== "section_title" && (
                                  <>
                                    <Switch
                                      id={`req-${field.id}`}
                                      checked={field.required}
                                      onCheckedChange={(val) => updateField(field.id, { required: val })}
                                    />
                                    <Label htmlFor={`req-${field.id}`} className="text-xs font-semibold cursor-pointer text-foreground">
                                      বাধ্যতামূলক
                                    </Label>
                                  </>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => duplicateField(field, index)}
                                  className="h-8 w-8 grid place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                  title="ডুপ্লিকেট করুন"
                                >
                                  <Copy size={13} />
                                </button>
                                <div className="w-px h-4 bg-border mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => moveField(index, "up")}
                                  disabled={index === 0}
                                  className="h-8 w-8 grid place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition"
                                  title="উপরে নিন"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveField(index, "down")}
                                  disabled={index === fields.length - 1}
                                  className="h-8 w-8 grid place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition"
                                  title="নিচে নিন"
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <div className="w-px h-4 bg-border mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => removeField(field.id, field.label)}
                                  className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/30 bg-destructive/5 text-destructive/70 hover:bg-destructive/15 hover:text-destructive transition"
                                  title="মুছে দিন"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* INACTIVE (COMPACT) CARD */
                          <div
                            className="flex items-center justify-between gap-4 py-1"
                            onClick={() => setActiveId(field.id)}
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-gold/80">প্রশ্ন {toBn(index + 1)}:</span>
                                <h5 className="text-sm font-bold text-foreground truncate max-w-sm">
                                  {field.label || "শিরোনামহীন প্রশ্ন"}
                                </h5>
                                {field.required && (
                                  <span className="text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded font-bold border border-gold/20">
                                    বাধ্যতামূলক
                                  </span>
                                )}
                                <span className="text-[9px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                                  {field.type === "text" && "ছোট উত্তর"}
                                  {field.type === "longtext" && "প্যারাগ্রাফ"}
                                  {field.type === "dropdown" && "ড্রপডাউন"}
                                  {field.type === "radio" && "মাল্টিপল চয়েস"}
                                  {field.type === "checkbox" && "চেকবক্স"}
                                  {field.type === "number" && "নাম্বার"}
                                  {field.type === "phone" && "মোবাইল নাম্বার"}
                                  {field.type === "email" && "ইমেল"}
                                  {field.type === "file" && "ফাইল আপলোড"}
                                  {field.type === "section_title" && "সেকশন টাইটেল"}
                                </span>
                              </div>

                              {field.hint && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-md pl-0.5">
                                  {field.hint}
                                </p>
                              )}

                              {needsOptions(field.type) && field.options && field.options.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {field.options.slice(0, 4).map((opt, idx) => (
                                    <span key={idx} className="text-[10px] border border-border rounded bg-muted px-2 py-0.5 text-muted-foreground font-medium">
                                      {opt}
                                    </span>
                                  ))}
                                  {field.options.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground font-bold pt-0.5">
                                      (+ আরও {toBn(field.options.length - 4)}টি)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setActiveId(field.id); }}
                              className="p-2 text-muted-foreground hover:text-gold shrink-0 bg-muted hover:bg-gold/10 border border-border hover:border-gold/30 rounded-lg transition"
                              title="এডিট করুন"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ADD QUESTION BUTTON */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={addField}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={15} /> নতুন প্রশ্ন যোগ করুন
              </button>
            </div>
          </>
        ) : (
          /* LIVE PREVIEW MODE */
          <div className="space-y-5 bg-muted/30 border border-border rounded-2xl p-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary tracking-wide">
              <CheckCircle2 size={12} /> লাইভ প্রিভিউ (ব্যবহারকারী যেভাবে দেখবেন)
            </div>

            <div className="space-y-5">
              {fields.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm font-semibold border-2 border-dashed border-border rounded-2xl">
                  কোনো প্রশ্ন নেই — এডিটর ট্যাবে ফিরে যান।
                </div>
              ) : (
                fields.map((field) => {
                  if (field.type === "section_title") {
                    return (
                      <div key={field.id} className="pt-4 pb-2 border-b-2 border-gold/30">
                        <h4 className="text-base font-extrabold text-gold">{field.label}</h4>
                        {field.hint && <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-foreground font-bold text-xs sm:text-sm">
                        {field.label} {field.required && <span className="text-gold ml-0.5">*</span>}
                      </Label>
                      {field.hint && <p className="text-[11px] text-muted-foreground">{field.hint}</p>}

                      {field.type === "longtext" ? (
                        <textarea
                          disabled
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none resize-none"
                          placeholder="আপনার উত্তর..."
                        />
                      ) : field.type === "dropdown" ? (
                        <div className="relative">
                          <select
                            disabled
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-muted-foreground outline-none appearance-none"
                          >
                            <option>নির্বাচন করুন</option>
                            {field.options?.map((opt, i) => (
                              <option key={i} disabled>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-3 text-muted-foreground pointer-events-none" />
                        </div>
                      ) : field.type === "radio" ? (
                        <div className="space-y-2 mt-1">
                          {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2.5 bg-background border border-border p-2.5 rounded-xl">
                              <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                              <span className="text-xs text-foreground font-medium">{opt}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <div className="space-y-2 mt-1">
                          {field.options && field.options.length > 0 ? (
                            field.options.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2.5 bg-background border border-border p-2.5 rounded-xl">
                                <div className="h-4 w-4 rounded border-2 border-border shrink-0" />
                                <span className="text-xs text-foreground font-medium">{opt}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2.5 bg-background border border-border p-2.5 rounded-xl">
                              <div className="h-4 w-4 rounded border-2 border-border shrink-0" />
                              <span className="text-xs text-muted-foreground font-medium">আমি একমত</span>
                            </div>
                          )}
                        </div>
                      ) : field.type === "file" ? (
                        <div className="border-2 border-dashed border-border bg-background p-5 rounded-xl text-center cursor-not-allowed">
                          <Upload className="mx-auto text-muted-foreground/50 mb-2" size={22} />
                          <p className="text-xs text-muted-foreground font-semibold">ফাইল সিলেক্ট করুন</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">ছবি, পিডিএফ ইত্যাদি</p>
                        </div>
                      ) : (
                        <input
                          type="text"
                          disabled
                          className="h-10 w-full rounded-xl border border-border bg-background px-4 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
                          placeholder={
                            field.type === "phone" ? "01XXXXXXXXX"
                            : field.type === "email" ? "example@email.com"
                            : field.type === "number" ? "সংখ্যা লিখুন"
                            : "আপনার উত্তর..."
                          }
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
