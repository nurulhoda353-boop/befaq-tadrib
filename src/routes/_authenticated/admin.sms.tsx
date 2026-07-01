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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Smartphone, Plus, Trash2, ArrowUp, ArrowDown, Settings2, BarChart2 } from "lucide-react";
import { sendDirectSms } from "@/lib/notifications";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/sms")({
  component: AdminSMS,
});

function AdminSMS() {
  const queryClient = useQueryClient();
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGateway, setNewGateway] = useState({
    name: "",
    provider: "textbee",
    api_key: "",
    device_id: "",
    sender_id: "",
    is_active: true,
  });

  // Fetch Settings (Multiple Gateways)
  const { data: gateways = [], isLoading: settingsLoading } = useQuery({
    queryKey: ["sms-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_settings").select("*").order("priority", { ascending: true });
      if (error) throw error;
      return data;
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

  // Add Gateway Mutation
  const addGatewayMut = useMutation({
    mutationFn: async (gateway: any) => {
      const nextPriority = gateways.length > 0 ? Math.max(...gateways.map(g => g.priority || 0)) + 1 : 1;
      const { error } = await supabase.from("sms_settings").insert({ ...gateway, priority: nextPriority });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("নতুন গেটওয়ে যুক্ত করা হয়েছে");
      setIsAddOpen(false);
      setNewGateway({ name: "", provider: "textbee", api_key: "", device_id: "", sender_id: "", is_active: true });
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Update Gateway Mutation
  const updateGatewayMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase.from("sms_settings").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("আপডেট সফল হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Delete Gateway Mutation
  const deleteGatewayMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sms_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("গেটওয়ে ডিলিট করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Change Priority Mutation
  const movePriorityMut = useMutation({
    mutationFn: async ({ id, direction, currentPriority }: { id: string, direction: "up" | "down", currentPriority: number }) => {
      const index = gateways.findIndex(g => g.id === id);
      if (direction === "up" && index > 0) {
        const other = gateways[index - 1];
        await supabase.from("sms_settings").update({ priority: other.priority }).eq("id", id);
        await supabase.from("sms_settings").update({ priority: currentPriority }).eq("id", other.id);
      } else if (direction === "down" && index < gateways.length - 1) {
        const other = gateways[index + 1];
        await supabase.from("sms_settings").update({ priority: other.priority }).eq("id", id);
        await supabase.from("sms_settings").update({ priority: currentPriority }).eq("id", other.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
    },
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

  return (
    <AdminShell title="SMS সেটিংস ও গেটওয়ে">
      <div className="max-w-6xl space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">এখানে আপনি একাধিক SMS গেটওয়ে যুক্ত করতে পারেন। সিস্টেম অটোমেটিকভাবে সিরিয়াল অনুযায়ী SMS পাঠাবে।</p>
          <Button onClick={() => setIsAddOpen(true)} className="bg-gold hover:bg-gold-dark text-black">
            <Plus className="w-4 h-4 mr-2" /> নতুন গেটওয়ে
          </Button>
        </div>

        {/* Gateways List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsLoading ? <p>Loading...</p> : gateways.map((gateway, idx) => (
            <Card key={gateway.id} className={`border-2 transition-all ${gateway.is_active ? 'border-primary/20 bg-card/50' : 'border-muted opacity-60'}`}>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" /> {gateway.name || "Unknown Gateway"}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => movePriorityMut.mutate({ id: gateway.id, direction: "up", currentPriority: gateway.priority || 0 })}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={idx === gateways.length - 1} onClick={() => movePriorityMut.mutate({ id: gateway.id, direction: "down", currentPriority: gateway.priority || 0 })}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-7 w-7 ml-2" onClick={() => deleteGatewayMut.mutate(gateway.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  Provider: {gateway.provider?.toUpperCase()} | Priority: {gateway.priority}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>API Key / Token</Label>
                  <Input type="password" defaultValue={gateway.api_key || ""} onBlur={(e) => updateGatewayMut.mutate({ id: gateway.id, updates: { api_key: e.target.value } })} className="bg-background h-8" />
                </div>
                {gateway.provider === "textbee" && (
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <Input defaultValue={gateway.device_id || ""} onBlur={(e) => updateGatewayMut.mutate({ id: gateway.id, updates: { device_id: e.target.value } })} className="bg-background h-8" />
                  </div>
                )}
                {gateway.provider !== "textbee" && (
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input defaultValue={gateway.sender_id || ""} onBlur={(e) => updateGatewayMut.mutate({ id: gateway.id, updates: { sender_id: e.target.value } })} className="bg-background h-8" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-muted/10 border-t border-border/50 py-3">
                <div className="flex items-center gap-2">
                  <Switch checked={gateway.is_active} onCheckedChange={(c) => updateGatewayMut.mutate({ id: gateway.id, updates: { is_active: c } })} />
                  <span className="text-sm font-medium">{gateway.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  <BarChart2 className="w-4 h-4" /> Total Sent: {gateway.usage_count || 0}
                </div>
              </CardFooter>
            </Card>
          ))}
          {gateways.length === 0 && !settingsLoading && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card/30 rounded-lg border border-dashed">
              কোনো SMS গেটওয়ে নেই। "নতুন গেটওয়ে" বাটনে ক্লিক করে যুক্ত করুন।
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">টেস্ট SMS পাঠান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>মোবাইল নাম্বার</Label>
                <Input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="01XXXXXXXXX" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>মেসেজ</Label>
                <textarea 
                  value={testMessage} 
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background focus:border-gold outline-none"
                  placeholder="আপনার মেসেজ..."
                />
              </div>
              <Button onClick={() => sendTestMut.mutate()} disabled={sendTestMut.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {sendTestMut.isPending ? "পাঠানো হচ্ছে..." : "এখনই পাঠান"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">সাম্প্রতিক SMS লগস</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto space-y-3 pr-2">
              {logsLoading ? <p>Loading...</p> : logs?.map(log => (
                <div key={log.id} className="p-3 bg-background border border-border rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{log.phone_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 
                      log.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{log.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Gateway Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>নতুন SMS গেটওয়ে</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>প্রোভাইডার</Label>
              <Select value={newGateway.provider} onValueChange={(v) => setNewGateway({...newGateway, provider: v})}>
                <SelectTrigger><SelectValue placeholder="সিলেক্ট প্রোভাইডার" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="textbee">TextBee (Android Phone)</SelectItem>
                  <SelectItem value="owntext">OwnText (Android Phone)</SelectItem>
                  <SelectItem value="bulksmsbd">BulkSMS BD</SelectItem>
                  <SelectItem value="greenweb">GreenWeb SMS</SelectItem>
                  <SelectItem value="smsnetbd">SMS.net.bd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={newGateway.api_key} onChange={e => setNewGateway({...newGateway, api_key: e.target.value})} placeholder="API Key or Token" />
            </div>
            {(newGateway.provider === "textbee" || newGateway.provider === "owntext") && (
              <div className="space-y-2">
                <Label>Device ID</Label>
                <Input value={newGateway.device_id} onChange={e => setNewGateway({...newGateway, device_id: e.target.value})} placeholder="e.g. 64b8f0..." />
              </div>
            )}
            {newGateway.provider !== "textbee" && newGateway.provider !== "owntext" && (
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input value={newGateway.sender_id} onChange={e => setNewGateway({...newGateway, sender_id: e.target.value})} placeholder="Sender ID (যদি প্রয়োজন হয়)" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => addGatewayMut.mutate({...newGateway, name: newGateway.name || newGateway.provider.toUpperCase()})} 
              disabled={addGatewayMut.isPending || !newGateway.api_key}
            >
              {addGatewayMut.isPending ? "অ্যাড হচ্ছে..." : "অ্যাড করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
