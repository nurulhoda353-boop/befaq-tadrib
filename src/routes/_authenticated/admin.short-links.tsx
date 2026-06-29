import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link2, Copy, Plus, Loader2, Link as LinkIcon, Trash2, HelpCircle, Link2Off, CalendarClock, Activity, Power, BarChart3, Clock, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/short-links")({
  component: AdminShortLinksPage,
});

function AdminShortLinksPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [origin, setOrigin] = useState("");

  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editDateValue, setEditDateValue] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Fetch short links
  const { data: shortLinks, isLoading, refetch } = useQuery({
    queryKey: ["short_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("short_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Suggest a short code when original URL changes
  useEffect(() => {
    if (!originalUrl) {
      setShortCode("");
      return;
    }
    try {
      const url = new URL(originalUrl);
      if (url) {
        // Generate a 4-character short code automatically
        setShortCode(Math.random().toString(36).substring(2, 6));
      }
    } catch (e) {
      // Invalid URL typed so far, just generate random
      setShortCode(Math.random().toString(36).substring(2, 6));
    }
  }, [originalUrl]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl || !shortCode) {
      toast.error("দয়া করে মূল লিংক এবং শর্ট-কোড দিন");
      return;
    }

    // Basic URL validation
    if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
      toast.error("মূল লিংকের শুরুতে http:// বা https:// থাকতে হবে");
      return;
    }

    setIsGenerating(true);
    try {
      const { error } = await supabase.from("short_links").insert({
        original_url: originalUrl,
        short_code: shortCode,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error("এই শর্ট-কোডটি আগে থেকেই ব্যবহৃত হচ্ছে! দয়া করে অন্য কোড দিন।");
        }
        throw error;
      }

      toast.success("শর্ট লিংক সফলভাবে তৈরি হয়েছে!");
      setOriginalUrl("");
      setShortCode("");
      setExpiresAt("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "লিংক তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("short_links")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(currentStatus ? "লিংকটি অফ করা হয়েছে" : "লিংকটি আবার অন করা হয়েছে");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("short_links")
        .update({ expires_at: editDateValue ? new Date(editDateValue).toISOString() : null })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("মেয়াদ আপডেট করা হয়েছে");
      setEditingDateId(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই লিংকটি ডিলিট করতে চান?")) return;
    try {
      const { error } = await supabase.from("short_links").delete().eq("id", id);
      if (error) throw error;
      toast.success("লিংক ডিলিট করা হয়েছে");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "ডিলিট করতে সমস্যা হয়েছে");
    }
  };

  const copyToClipboard = (code: string) => {
    const fullUrl = `${origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("শর্ট লিংক কপি করা হয়েছে!");
  };

  return (
    <AdminShell
      breadcrumb="টুলস"
      current="শর্ট লিংকস"
      title="লিংক সংক্ষিপ্তকরণ (URL Shortener)"
      subtitle="আপনার ওয়েবসাইটের বা বাইরের যেকোনো বড় লিংককে ছোট এবং শেয়ার করার উপযোগী করুন।"
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <form onSubmit={handleCreate} className="space-y-6 relative z-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Long URL Input */}
              <div className="space-y-2 lg:col-span-2">
                <Label className="text-foreground font-semibold">মূল লিংক (Long URL)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="url"
                    required
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url..."
                    className="pl-10 bg-background border-border text-foreground focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>

              {/* Short Code Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-foreground font-semibold">শর্ট-কোড</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করতে পারবেন।</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center">
                  <span className="flex items-center justify-center bg-muted text-muted-foreground border border-r-0 border-border rounded-l-md px-4 py-2 h-10 text-sm font-medium">
                    /
                  </span>
                  <Input
                    type="text"
                    required
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    placeholder="code"
                    className="bg-background border-border text-foreground focus:ring-gold focus:border-gold rounded-l-none h-10"
                  />
                </div>
              </div>
              
              {/* Expiration Date Input */}
              <div className="space-y-2 lg:col-span-1">
                <div className="flex items-center gap-1">
                  <Label className="text-foreground font-semibold">মেয়াদ (ঐচ্ছিক)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>এই নির্দিষ্ট তারিখ ও সময়ের পর লিংকটি অটোমেটিক অফ হয়ে যাবে।</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground focus:ring-gold focus:border-gold h-10"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isGenerating}
              className="w-full sm:w-auto bg-[#1a1625] hover:bg-[#251f35] text-gold/90 hover:text-gold border border-gold/20 hover:border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
              শর্ট লিংক তৈরি করুন
            </Button>
          </form>
        </div>

        {/* List Card / Progress Dashboard */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-gold" />
              লাইভ লিংক প্রগ্রেস
            </h3>
            <div className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold border border-gold/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Live System
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" />
              </div>
            ) : shortLinks?.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Link2Off className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-4">এখানে কোনো শর্ট লিংক তৈরি করা হয়নি।</h3>
                <Button 
                  onClick={() => document.querySelector('input[type="url"]')?.focus()}
                  className="bg-[#1a1625] hover:bg-[#251f35] text-gold/90 hover:text-gold border border-gold/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  আপনার প্রথম শর্ট লিংক তৈরি করুন
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                {shortLinks?.map((link) => {
                  const isExpired = link.expires_at ? new Date(link.expires_at) < new Date() : false;
                  const isActive = link.is_active && !isExpired;
                  
                  return (
                    <div key={link.id} className="group flex flex-col border border-border bg-background rounded-xl p-5 hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.05)] transition-all duration-300 relative overflow-hidden">
                      
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-lg tracking-tight group-hover:text-gold transition-colors">
                            /{link.short_code}
                          </span>
                        </div>
                        
                        {/* Status Toggle / Badge */}
                        <div className="flex items-center gap-3">
                          {isExpired ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                              Expired
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                {isActive ? 'Active' : 'Off'}
                              </span>
                              <Switch 
                                checked={link.is_active}
                                onCheckedChange={() => handleToggleStatus(link.id, link.is_active)}
                                className="data-[state=checked]:bg-gold"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* URL Display */}
                      <div className="mb-6 flex-1">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Destination</p>
                        <p className="text-sm text-foreground line-clamp-2 leading-relaxed" title={link.original_url}>
                          {link.original_url}
                        </p>
                      </div>

                      {/* Stats & Info */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-muted/30 rounded-lg p-3 flex flex-col items-start border border-border/50">
                          <BarChart3 className="w-4 h-4 text-gold mb-2 opacity-70" />
                          <span className="text-2xl font-bold text-foreground leading-none mb-1">{link.clicks || 0}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Clicks</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 flex flex-col items-start border border-border/50 relative group/date h-full">
                          <Clock className={`w-4 h-4 mb-2 opacity-70 ${isExpired ? 'text-destructive' : 'text-blue-500'}`} />
                          
                          {editingDateId === link.id ? (
                            <div className="flex items-center gap-1 w-full mt-auto pt-1">
                              <Input 
                                type="datetime-local" 
                                size="sm" 
                                className="h-6 text-[10px] px-1 py-0 w-full bg-background border-border" 
                                value={editDateValue}
                                onChange={(e) => setEditDateValue(e.target.value)}
                              />
                              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleUpdateDate(link.id)}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setEditingDateId(null)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-auto w-full">
                              <span className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                                {link.expires_at ? format(new Date(link.expires_at), "dd MMM yyyy, hh:mm a") : "Unlimited"}
                              </span>
                              <div className="flex items-center justify-between w-full mt-1">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Expiration</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 opacity-0 group-hover/date:opacity-100 transition-opacity absolute top-2 right-2"
                                  onClick={() => {
                                    setEditingDateId(link.id);
                                    // format correctly for datetime-local input YYYY-MM-DDThh:mm
                                    setEditDateValue(link.expires_at ? format(new Date(link.expires_at), "yyyy-MM-dd'T'HH:mm") : "");
                                  }}
                                  title="মেয়াদ পরিবর্তন করুন"
                                >
                                  <Pencil className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 border-border bg-background hover:bg-muted text-foreground"
                          onClick={() => copyToClipboard(link.short_code)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          কপি করুন
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 px-3"
                          onClick={() => handleDelete(link.id)}
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
