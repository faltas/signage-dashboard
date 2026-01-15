"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Monitor, 
  Activity, 
  Wifi, 
  Plus, 
  QrCode,
  Zap,
  Globe,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDisplays } from "./hooks/useDisplays";
import { useLanguage } from "@/app/language-provider";
import { StatsHud } from "@/components/dashboard/StatsHud";
import { DisplayGrid } from "@/components/dashboard/DisplayGrid";
import { DisplayViewSwitcher } from "@/components/dashboard/DisplayViewSwitcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DisplaysPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { displays, loading, loadDisplays, SavePlayerName } = useDisplays();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid3");
  const [showPairingDialog, setShowPairingDialog] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    loadDisplays();
  }, []);

  const onlineDisplays = displays.filter(d => {return d.status === "on" || d.status === "online"});

  const stats = [
    { label: t('online'), value: onlineDisplays.length, icon: Wifi, color: "text-emerald-400" },
    { label: t('offline'), value: displays.length - onlineDisplays.length, icon: Activity, color: "text-rose-400" },
    { label: "Players", value: displays.length, icon: Monitor, color: "text-blue-400" },
    { label: "Active", value: onlineDisplays.length, icon: Zap, color: "text-amber-400" },
  ];

  async function handlePairing() {
    if (!pairingCode.trim()) {
      setPairingError(t('enter_pairing_code'));
      return;
    }

    setPairingLoading(true);
    setPairingError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch("/api/pair-display", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairing_code: pairingCode.toUpperCase(),
          user_id: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Pairing failed");
      }

      // Success!
      setPairingCode("");
      setShowPairingDialog(false);
      await loadDisplays();
      
      // Show success message
      alert(t('pairing_success'));
    } catch (error) {
      console.error("Pairing error:", error);
      setPairingError(error.message || t('pairing_error'));
    } finally {
      setPairingLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar
            title={t('overview')}
            subtitle={t('network_management')}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-12 max-w-[1600px] mx-auto w-full">
            
            <StatsHud stats={stats} />

            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
                    {t('network_fleet').split(' ')[0]} <span className="text-primary">{t('network_fleet').split(' ')[1] || 'Fleet'}</span>
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">{t('real_time_status')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-xl border border-border backdrop-blur-sm flex-1 lg:flex-initial justify-between md:justify-start">
                    <DisplayViewSwitcher mode={viewMode} setMode={setViewMode} />
                  </div>
                  <Button
                    onClick={() => setShowPairingDialog(true)}
                    className="btn-premium flex-1 lg:flex-initial px-6 md:px-8 h-12 rounded-xl font-black shadow-lg text-sm"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    {t('pair_display')}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-lg font-bold tracking-widest text-muted-foreground uppercase">{t('syncing')}</p>
                </div>
              ) : displays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 glass-premium rounded-[3rem] border-dashed border-2 border-white/10">
                  <div className="p-8 bg-primary/10 rounded-full mb-8 relative">
                    <Monitor className="w-16 h-16 text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  </div>
                  <h3 className="text-3xl font-black mb-2">{t('fleet_empty')}</h3>
                  <p className="text-muted-foreground font-medium mb-10 max-w-sm text-center">{t('fleet_empty_desc')}</p>
                  <Button onClick={() => setShowPairingDialog(true)} size="lg" className="rounded-2xl px-12 font-black btn-premium">
                    <QrCode className="w-5 h-5 mr-2" />
                    {t('pair_display')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-10">
                   <DisplayGrid displays={displays} SavePlayerName={SavePlayerName} columns={viewMode === "grid3" ? 3 : 5} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Pairing Dialog */}
      <Dialog open={showPairingDialog} onOpenChange={setShowPairingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{t('pair_display')}</DialogTitle>
            <DialogDescription>
              {t('enter_pairing_code')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-2xl">
              <QrCode className="w-16 h-16 text-primary" />
              <p className="text-sm text-center text-muted-foreground">
                {t('scan_qr')}<br/>
                <span className="text-xs">{t('or_enter_code')}</span>
              </p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="XXXX"
                value={pairingCode}
                onChange={(e) => {
                  setPairingCode(e.target.value.toUpperCase());
                  setPairingError("");
                }}
                maxLength={4}
                className="text-center text-2xl font-bold tracking-[1em] h-16 bg-background"
                disabled={pairingLoading}
              />
              
              {pairingError && (
                <p className="text-sm text-rose-500 text-center">{pairingError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPairingDialog(false);
                    setPairingCode("");
                    setPairingError("");
                  }}
                  className="flex-1 h-12 rounded-xl font-black"
                  disabled={pairingLoading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handlePairing}
                  disabled={!pairingCode.trim() || pairingLoading}
                  className="flex-1 h-12 rounded-xl font-black btn-premium"
                >
                  {pairingLoading ? t('syncing') : t('confirm')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}