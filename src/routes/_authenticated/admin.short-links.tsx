import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link2, Copy, Plus, Loader2, Link as LinkIcon, Trash2, HelpCircle, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/_authenticated/admin/short-links")({
  component: AdminShortLinksPage,
});

function AdminShortLinksPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [origin, setOrigin] = useState("");

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
      setShortCode(Math.random().toString(36).substring(2, 8));
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
      refetch();
    } catch (err: any) {
      toast.error(err.message || "লিংক তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsGenerating(false);
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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Long URL Input */}
              <div className="space-y-2">
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
                  <Label className="text-foreground font-semibold">শর্ট-কোড (Custom Short Code)</Label>
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
                  <span className="flex items-center justify-center bg-muted text-muted-foreground border border-r-0 border-border rounded-l-md px-4 py-2 h-10 text-sm">
                    /
                  </span>
                  <Input
                    type="text"
                    required
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    placeholder="custom-code"
                    className="bg-background border-border text-foreground focus:ring-gold focus:border-gold rounded-l-none h-10"
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

        {/* List Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
              <LinkIcon className="w-5 h-5 text-gold" />
              আপনার শর্ট লিংকসমূহ
            </h3>
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
              shortLinks?.map((link) => (
                <div key={link.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-muted/30 transition">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gold text-lg">/{link.short_code}</span>
                      <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {link.clicks} Clicks
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-2xl" title={link.original_url}>
                      {link.original_url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 sm:flex-none border-border bg-background hover:bg-muted text-foreground"
                      onClick={() => copyToClipboard(link.short_code)}
                    >
                      <Copy className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">কপি লিংক</span>
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
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
