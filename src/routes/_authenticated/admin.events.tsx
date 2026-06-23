import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ensureAdmin } from "@/lib/admin-guard";
import { AdminRegistrationsView } from "@/components/admin/AdminRegistrationsView";
import { EventListView } from "@/components/admin/EventListView";
import { Database, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  beforeLoad: ensureAdmin,
  component: AdminEventsWrapper,
});

function AdminEventsWrapper() {
  const [activeTab, setActiveTab] = useState<"registrations" | "events">("registrations");

  const Tabs = (
    <div className="mb-6 mt-2 flex justify-center w-full">
      <div className="inline-flex items-center rounded-full bg-muted/60 p-1.5 backdrop-blur-md border border-border shadow-inner">
        <button
          onClick={() => setActiveTab("registrations")}
          className={`px-6 py-2.5 text-sm font-bold transition-all duration-300 rounded-full flex items-center gap-2 ${
            activeTab === "registrations" 
              ? "bg-foreground text-background shadow-lg scale-100" 
              : "text-muted-foreground hover:text-foreground scale-[0.98] hover:bg-muted/80"
          }`}
        >
          <Database size={16} /> ইভেন্ট ডাটা ম্যানেজমেন্ট
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2.5 text-sm font-bold transition-all duration-300 rounded-full flex items-center gap-2 ${
            activeTab === "events" 
              ? "bg-foreground text-background shadow-lg scale-100" 
              : "text-muted-foreground hover:text-foreground scale-[0.98] hover:bg-muted/80"
          }`}
        >
          <CalendarPlus size={16} /> ইভেন্ট ক্রিয়েট
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {activeTab === "registrations" ? <AdminRegistrationsView tabs={Tabs} /> : <EventListView tabs={Tabs} />}
    </div>
  );
}
