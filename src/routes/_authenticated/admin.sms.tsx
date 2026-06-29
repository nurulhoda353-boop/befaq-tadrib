import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Smartphone, MessageSquare, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { sendDirectSms } from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/admin/sms")({
  component: AdminSMS,
});

function AdminSMS() {
  const queryClient = useQueryClient();
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");

  // Fetch Settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["sms-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_settings").select("*").single();
      if (error && error.code !== "PGRST116") throw error; // Ignore not found initially
      return data || { api_key: "", device_id: "", is_active: true };
    },
  });

  // Fetch Logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["sms-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Update Settings Mutation
  const updateSettingsMut = useMutation({
    mutationFn: async (newSettings: any) => {
      // Upsert logic if id doesn't exist, we just rely on single row
      const { data: existing } = await supabase.from("sms_settings").select("id").maybeSingle();
      if (existing) {
        const { error } = await supabase.from("sms_settings").update(newSettings).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sms_settings").insert({ ...newSettings, provider: "textbee" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("SMS সেটিংস সফলভাবে আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Send Test SMS
  const sendTestMut = useMutation({
    mutationFn: async () => {
      const res = await sendDirectSms(testPhone, testMessage);
      if (!res.success) throw new Error(res.error || "Unknown error");
      return res;
    },
    onSuccess: () => {
      toast.success("টেস্ট SMS পাঠানো হয়েছে!");
      setTestPhone("");
      setTestMessage("");
      queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
    },
    onError: (e: any) => toast.error("SMS পাঠাতে ব্যর্থ: " + e.message),
  });

  const [formData, setFormData] = useState({
    api_key: "",
    device_id: "",
    is_active: true,
  });

  // Sync state when data loads
  useState(() => {
    if (settings) {
      setFormData({
        api_key: settings.api_key || "",
        device_id: settings.device_id || "",
        is_active: settings.is_active ?? true,
      });
    }
  });

  return (
    <AdminShell title="SMS সেটিংস (TextBee)">
      <div className="max-w-5xl space-y-6">
        
        {/* Settings Card */}
        <Card className="bg-card/50 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> TextBee API কনফিগারেশন
            </CardTitle>
            <CardDescription>
              আপনার লোকাল সিম থেকে SMS পাঠানোর জন্য <a href="https://textbee.dev" target="_blank" rel="noreferrer" className="text-primary hover:underline">TextBee</a> এর ডিভাইস আইডি এবং এপিআই কি দিন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device ID (ডিভাইস আইডি)</Label>
                <Input 
                  value={formData.device_id} 
                  onChange={e => setFormData({...formData, device_id: e.target.value})}
                  placeholder="e.g. 64b8f0..." 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key (এপিআই কি)</Label>
                <Input 
                  type="password"
                  value={formData.api_key} 
                  onChange={e => setFormData({...formData, api_key: e.target.value})}
                  placeholder="আপনার সিক্রেট API Key" 
                  className="bg-background"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="sms-active" 
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({...formData, is_active: c})}
                className="data-[state=checked]:bg-emerald-500"
              />
              <Label htmlFor="sms-active" className="cursor-pointer">SMS সার্ভিস চালু রাখুন (সিস্টেম অটোমেটিক SMS পাঠাবে)</Label>
            </div>

            <Button 
              onClick={() => updateSettingsMut.mutate(formData)}
              disabled={updateSettingsMut.isPending}
              className="mt-4 bg-gold hover:bg-gold/90 text-gold-foreground"
            >
              <Save className="w-4 h-4 mr-2" /> 
              {updateSettingsMut.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test SMS Card */}
          <Card className="bg-card/50 border-border shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500" /> টেস্ট SMS পাঠান
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>মোবাইল নাম্বার</Label>
                <Input 
                  placeholder="01XXXXXXXXX" 
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>মেসেজ</Label>
                <textarea 
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="আপনার মেসেজ..."
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => sendTestMut.mutate()}
                disabled={sendTestMut.isPending || !testPhone || !testMessage}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {sendTestMut.isPending ? "পাঠানো হচ্ছে..." : "এখনই পাঠান"}
              </Button>
            </CardContent>
          </Card>

          {/* SMS Logs */}
          <Card className="bg-card/50 border-border shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> সাম্প্রতিক SMS লগস
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
              ) : logs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">কোনো SMS লগ পাওয়া যায়নি।</div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {logs?.map(log => (
                    <div key={log.id} className="p-3 rounded-lg border border-border bg-background flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm tracking-widest">{log.phone_number}</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          {log.status === "sent" ? (
                            <span className="text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Sent</span>
                          ) : log.status === "failed" ? (
                            <span className="text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Failed</span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pending</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.message}</p>
                      <div className="text-[10px] text-muted-foreground/60 flex items-center gap-2 pt-1 border-t border-border/50">
                        {new Date(log.created_at).toLocaleString('bn-BD')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminShell>
  );
}
