import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link2, Copy, Plus, Loader2, Link as LinkIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      const paths = url.pathname.split("/").filter(Boolean);
      if (paths.length > 0) {
        const lastSegment = paths[paths.length - 1];
        // Take first 5 alphanumeric chars of slug and add 3 random chars
        const cleanSlug = lastSegment.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5);
        const randomStr = Math.random().toString(36).substring(2, 5);
        setShortCode(`${cleanSlug}-${randomStr}`.toLowerCase());
      } else {
        setShortCode(Math.random().toString(36).substring(2, 8));
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
    const fullUrl = `${origin}/s/${code}`;
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        
        <form onSubmit={handleCreate} className="space-y-4 relative z-10">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/90">মূল লিংক (Long URL)</Label>
              <Input
                type="url"
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url..."
                className="bg-black/20 border-white/10 text-white focus:border-gold/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/90">শর্ট-কোড (Custom Short Code)</Label>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm bg-black/20 px-3 py-2 rounded-lg border border-white/10 hidden sm:inline-block">
                  /s/
                </span>
                <Input
                  type="text"
                  required
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  placeholder="custom-code"
                  className="bg-black/20 border-white/10 text-white focus:border-gold/50"
                />
              </div>
              <p className="text-xs text-white/40">শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহার করুন</p>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isGenerating}
            className="w-full sm:w-auto bg-gold hover:bg-gold-bright text-black font-bold"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
            শর্ট লিংক তৈরি করুন
          </Button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gold" />
            আপনার শর্ট লিংকসমূহ
          </h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-8 text-center text-white/50">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : shortLinks?.length === 0 ? (
            <div className="p-8 text-center text-white/50 text-sm">
              এখনো কোনো শর্ট লিংক তৈরি করা হয়নি।
            </div>
          ) : (
            shortLinks?.map((link) => (
              <div key={link.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-white/[0.02] transition">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gold text-lg">/s/{link.short_code}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/70 uppercase tracking-wider">
                      {link.clicks} Clicks
                    </span>
                  </div>
                  <p className="text-sm text-white/50 truncate max-w-xl" title={link.original_url}>
                    {link.original_url}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 sm:flex-none border-white/10 text-white/80 hover:bg-white/10"
                    onClick={() => copyToClipboard(link.short_code)}
                  >
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">কপি লিংক</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2"
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
    </AdminShell>
  );
}
