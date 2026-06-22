import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold">পেজটি খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন সেটি সরিয়ে নেওয়া হয়েছে বা কখনো ছিল না।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            হোমপেজে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">পেজটি লোড করা যায়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা হোমপেজে ফিরুন।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark"
          >
            আবার চেষ্টা করুন
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            হোমপেজ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "বেফাক প্রশিক্ষণ শাখা — কওমী মাদ্রাসা শিক্ষাবোর্ড" },
      { name: "description", content: "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশের প্রশিক্ষণ শাখার অফিসিয়াল ওয়েবসাইট — প্রশিক্ষণ, ভর্তি, রেজাল্ট ও নোটিশ।" },
      { name: "author", content: "বেফাক প্রশিক্ষণ শাখা" },
      { property: "og:title", content: "বেফাক প্রশিক্ষণ শাখা — কওমী মাদ্রাসা শিক্ষাবোর্ড" },
      { property: "og:description", content: "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশের প্রশিক্ষণ শাখার অফিসিয়াল ওয়েবসাইট — প্রশিক্ষণ, ভর্তি, রেজাল্ট ও নোটিশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "বেফাক প্রশিক্ষণ শাখা — কওমী মাদ্রাসা শিক্ষাবোর্ড" },
      { name: "twitter:description", content: "বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশের প্রশিক্ষণ শাখার অফিসিয়াল ওয়েবসাইট — প্রশিক্ষণ, ভর্তি, রেজাল্ট ও নোটিশ।" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/79bbcba6-4689-4ef2-9148-c5a0649b3ec1/id-preview-bf4e9bc6--2cc2b458-782d-4607-b22c-fbf14dd8e9cd.lovable.app-1781949427376.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/79bbcba6-4689-4ef2-9148-c5a0649b3ec1/id-preview-bf4e9bc6--2cc2b458-782d-4607-b22c-fbf14dd8e9cd.lovable.app-1781949427376.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800&family=Amiri:wght@400;700&family=Amiri+Quran&family=Scheherazade+New:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
