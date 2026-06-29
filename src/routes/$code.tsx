import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/$code")({
  component: ShortLinkRedirect,
});

function ShortLinkRedirect() {
  const { code } = Route.useParams();
  const [error, setError] = useState<string | null>(null);

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
          setError("দুঃখিত, এই লিংকটি আর কাজ করছে না বা মুছে ফেলা হয়েছে।");
          return;
        }

        // 2. Increment clicks (fire and forget)
        supabase
          .from("short_links")
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq("id", data.id)
          .then(); // ignoring result

        // 3. Redirect natively
        window.location.replace(data.original_url);

      } catch (err) {
        setError("লিংক লোড করতে সমস্যা হচ্ছে।");
      }
    }

    if (code) {
      redirect();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl">
            !
          </div>
          <h1 className="text-2xl font-bold text-white">লিংক পাওয়া যায়নি</h1>
          <p className="text-white/60">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto" />
          <p className="text-white/60 animate-pulse">আপনাকে রিডাইরেক্ট করা হচ্ছে...</p>
        </div>
      )}
    </div>
  );
}
