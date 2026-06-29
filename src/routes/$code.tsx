import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link2Off, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$code")({
  component: ShortLinkRedirect,
});

function ShortLinkRedirect() {
  const { code } = Route.useParams();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    async function redirect() {
      try {
        // 1. Fetch the short link
        const { data, error: fetchError } = await supabase
          .from("short_links")
          .select("*")
          .eq("short_code", code)
          .single();

        if (fetchError || !data) {
          setError({
            title: "লিংক খুঁজে পাওয়া যায়নি",
            message: "দুঃখিত, এই লিংকটি আমাদের সিস্টেমে নেই অথবা ডিলিট করে দেওয়া হয়েছে।"
          });
          return;
        }

        // 2. Check active status
        if (data.is_active === false) {
          setError({
            title: "লিংক নিষ্ক্রিয়",
            message: "এই লিংকটি বর্তমানে অফ করে রাখা হয়েছে। পরবর্তীতে আবার চেষ্টা করুন।"
          });
          return;
        }

        // 3. Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError({
            title: "লিংকের মেয়াদ শেষ",
            message: "এই লিংকের নির্দিষ্ট মেয়াদ শেষ হয়ে গেছে। এটি আর কাজ করবে না।"
          });
          return;
        }

        // 4. Increment clicks (fire and forget)
        supabase
          .from("short_links")
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq("id", data.id)
          .then(); // ignoring result

        // 5. Redirect natively
        window.location.replace(data.original_url);

      } catch (err) {
        setError({
          title: "সার্ভার এরর",
          message: "লিংকটি লোড করতে কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।"
        });
      }
    }

    if (code) {
      redirect();
    }
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Link2Off className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{error.title}</h1>
          <p className="text-muted-foreground mb-8">
            {error.message}
          </p>
          <Button asChild className="w-full bg-[#1a1625] hover:bg-[#251f35] text-gold/90 hover:text-gold border border-gold/20">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              মূল ওয়েবসাইটে ফিরে যান
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">রিডাইরেক্ট করা হচ্ছে...</p>
      </div>
    </div>
  );
}
