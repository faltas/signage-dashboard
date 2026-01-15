"use client";

import { useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Monitor, Plus, ChevronLeft, QrCode, Globe, Cpu } from "lucide-react";
import { useLanguage } from "@/app/language-provider";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AddDisplayPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("displays").insert({
      name: name.trim(),
      user_id: user.id,
      status: "offline",
      last_seen_at: new Date().toISOString()
    });
    setLoading(false);
    if (!error) router.push("/displays");
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={false} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar title={t('register_node')} subtitle="Node Integration Protocol" onMenuClick={() => {}} />
          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-[1000px] mx-auto w-full">
            <Button variant="ghost" className="mb-8 font-black text-[10px] tracking-widest uppercase hover:bg-white/5" onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4 mr-2" /> {t('back')}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-8 md:space-y-10">
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-2xl w-fit">
                    <Monitor className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                    {t('register_node')}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-lg font-medium">
                    {t('register_node_desc') || 'Initialize a new node into the fleet network.'}
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Node Identification</label>
                    <Input 
                      placeholder="e.g. LOBBY_DISPLAY_01" 
                      className="bg-card/50 border-border h-14 md:h-16 rounded-2xl px-6 text-lg md:text-xl font-black text-foreground"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <Button disabled={loading || !name.trim()} className="w-full btn-premium h-14 md:h-16 rounded-2xl font-black shadow-2xl text-lg">
                    {loading ? t('syncing') : t('register_node')}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                 <Card className="glass-premium p-6 md:p-8 border-none space-y-6">
                    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">Deployment Strategies</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                        <QrCode className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">QR Authentication</p>
                          <p className="text-xs text-muted-foreground font-medium">Scan the code on the physical display to pair instantly.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                        <Globe className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">Cloud Provisioning</p>
                          <p className="text-xs text-muted-foreground font-medium">Remote deployment via serial number verification.</p>
                        </div>
                      </div>
                    </div>
                 </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
