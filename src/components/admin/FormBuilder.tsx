import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Type } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const addField = () => {
    onChange([
      ...fields,
      {
        id: crypto.randomUUID(),
        label: "নতুন প্রশ্ন",
        type: "text",
        required: false,
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<FormFieldSchema>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
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

  const needsOptions = (type: string) => ["dropdown", "radio", "checkbox"].includes(type);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">রেজিস্ট্রেশন ফর্ম বিল্ডার</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            গুগল ফর্মের মতো করে আপনার ইভেন্টের প্রশ্নপত্র তৈরি করুন।
          </p>
        </div>
        <button
          type="button"
          onClick={addField}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-dark"
        >
          <Plus size={16} /> নতুন প্রশ্ন যোগ করুন
        </button>
      </div>

      <div className="space-y-4 mt-4">
        {fields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            এখনও কোনো প্রশ্ন যোগ করা হয়নি।
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="group relative rounded-xl border-l-4 border-l-gold border-y border-r border-y-border border-r-border bg-card p-5 shadow-sm transition-all focus-within:ring-1 focus-within:ring-gold"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Label Input */}
                    <div className="flex-1 space-y-1.5">
                      <input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="h-12 w-full rounded-md bg-muted/30 px-3 text-base font-medium outline-none focus:bg-background focus:ring-1 focus:ring-gold placeholder:text-muted-foreground/60 transition-colors"
                        placeholder={field.type === "section_title" ? "সেকশন শিরোনাম" : "আপনার প্রশ্ন লিখুন"}
                      />
                    </div>

                    {/* Type Selector */}
                    <div className="w-full sm:w-56 space-y-1.5 shrink-0">
                      <Select
                        value={field.type}
                        onValueChange={(val: any) => updateField(field.id, { type: val })}
                      >
                        <SelectTrigger className="h-12 bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">ছোট উত্তর (Short Answer)</SelectItem>
                          <SelectItem value="longtext">বড় উত্তর (Paragraph)</SelectItem>
                          <SelectItem value="dropdown">ড্রপডাউন (Dropdown)</SelectItem>
                          <SelectItem value="radio">মাল্টিপল চয়েস (Radio)</SelectItem>
                          <SelectItem value="checkbox">চেকবক্স (Checkboxes)</SelectItem>
                          <SelectItem value="number">নাম্বার (Number)</SelectItem>
                          <SelectItem value="phone">মোবাইল নাম্বার (Phone)</SelectItem>
                          <SelectItem value="email">ইমেইল (Email)</SelectItem>
                          <SelectItem value="file">ফাইল আপলোড (File)</SelectItem>
                          <SelectItem value="section_title">সেকশন টাইটেল (Title Only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Hint Input */}
                  {field.type !== "section_title" && (
                    <div>
                      <input
                        value={field.hint || ""}
                        onChange={(e) => updateField(field.id, { hint: e.target.value })}
                        className="h-8 w-full border-b border-border bg-transparent px-1 text-xs text-muted-foreground outline-none focus:border-gold focus:text-foreground transition-colors"
                        placeholder="নির্দেশনা বা সাহায্যকারী টেক্সট (Optional Hint/Description)"
                      />
                    </div>
                  )}

                  {/* Options Editor for Dropdown, Radio, Checkbox - Google Forms Style */}
                  {needsOptions(field.type) && (
                    <div className="pl-0 sm:pl-2 pt-2 space-y-3">
                      {(field.options || []).map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3 group/opt">
                          {/* Icon depending on type */}
                          <div className="shrink-0 text-muted-foreground/50">
                            {field.type === "radio" ? (
                              <div className="h-4 w-4 rounded-full border-2 border-current" />
                            ) : field.type === "checkbox" ? (
                              <div className="h-4 w-4 rounded-sm border-2 border-current" />
                            ) : (
                              <span className="text-sm font-medium">{optIndex + 1}.</span>
                            )}
                          </div>
                          
                          <input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(field.options || [])];
                              newOpts[optIndex] = e.target.value;
                              updateField(field.id, { options: newOpts });
                            }}
                            className="flex-1 border-b border-transparent bg-transparent py-1 text-sm outline-none transition-colors hover:border-border focus:border-gold focus:border-b-2"
                            placeholder={`অপশন ${optIndex + 1}`}
                          />
                          
                          {/* Only show delete if more than 1 option */}
                          {(field.options?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = [...(field.options || [])];
                                newOpts.splice(optIndex, 1);
                                updateField(field.id, { options: newOpts });
                              }}
                              className="shrink-0 p-1 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover/opt:opacity-100 transition-opacity"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add New Option Button */}
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 text-muted-foreground/30">
                          {field.type === "radio" ? (
                            <div className="h-4 w-4 rounded-full border-2 border-current" />
                          ) : field.type === "checkbox" ? (
                            <div className="h-4 w-4 rounded-sm border-2 border-current" />
                          ) : (
                            <span className="text-sm font-medium">{(field.options?.length || 0) + 1}.</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = [...(field.options || []), `অপশন ${(field.options?.length || 0) + 1}`];
                              updateField(field.id, { options: newOpts });
                            }}
                            className="text-sm text-muted-foreground hover:border-b hover:border-muted-foreground pb-0.5 transition-all"
                          >
                            নতুন অপশন যোগ করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 mt-4">
                    <div className="flex items-center gap-2">
                      {field.type !== "section_title" && (
                        <>
                          <Switch
                            id={`req-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(val) => updateField(field.id, { required: val })}
                          />
                          <Label htmlFor={`req-${field.id}`} className="text-sm font-medium cursor-pointer">
                            বাধ্যতামূলক (Required)
                          </Label>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="উপরে নিন"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, "down")}
                        disabled={index === fields.length - 1}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="নিচে নিন"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <div className="w-px h-5 bg-border mx-1" />
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition"
                        title="ডিলিট করুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
