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
  Layers,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDisplays } from "./hooks/useDisplays";
import { useLanguage } from "@/app/language-provider";
import { StatsHud } from "@/components/dashboard/StatsHud";
import { DisplayGrid } from "@/components/dashboard/DisplayGrid";
import { DisplayViewSwitcher } from "@/components/dashboard/DisplayViewSwitcher";
import { QRScanner } from "./add/components/QRScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DisplaysPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { displays, loading, loadDisplays, SavePlayerName } = useDisplays();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid2");
  const [showPairingDialog, setShowPairingDialog] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    loadDisplays();
  }, []);

  const onlineDisplays = displays.filter(d => {return d.status === "on" || d.status === "online"});

  const stats = [
    { label: t('online'), value: onlineDisplays.length, icon: Wifi, color: "text-emerald-500" },
    { label: t('offline'), value: displays.length - onlineDisplays.length, icon: Activity, color: "text-rose-500" },
    { label: "Players", value: displays.length, icon: Monitor, color: "text-primary" },
    { label: "Active", value: onlineDisplays.length, icon: Zap, color: "text-amber-500" },
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

      setPairingCode("");
      setShowPairingDialog(false);
      await loadDisplays();
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
    <div className="flex min-h-screen bg-background relative">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <TopBar
          title={t("overview")}
          subtitle={t("network_management")}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
          <StatsHud stats={stats} />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("network_fleet").split(" ")[0]}{" "}
                  <span className="text-primary">
                    {t("network_fleet").split(" ")[1] || "Fleet"}
                  </span>
                </h2>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-muted-foreground text-xs font-medium">
                    {t("real_time_status")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
                  <DisplayViewSwitcher mode={viewMode} setMode={setViewMode} />
                </div>

                <Button
                  onClick={() => setShowPairingDialog(true)}
                  className="shadow-sm"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {t("pair_display")}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("syncing")}...
                </p>
              </div>
            ) : displays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-muted/30 rounded-2xl border border-dashed border-border">
                <div className="p-6 bg-background rounded-full mb-6 shadow-sm">
                  <Monitor className="w-12 h-12 text-muted-foreground/50" />
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {t("fleet_empty")}
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-8">
                  {t("fleet_empty_desc")}
                </p>

                <Button
                  onClick={() => setShowPairingDialog(true)}
                  size="lg"
				          variant="ghost"
                  className="rounded-xl"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  {t("pair_display")}
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DisplayGrid
                  displays={displays}
                  SavePlayerName={SavePlayerName}
                  columns={viewMode === "grid2" ? 2 : 1}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    <Dialog open={showPairingDialog} onOpenChange={setShowPairingDialog}>
      <DialogContent className="sm:max-w-md p-0 bg-background overflow-hidden rounded-3xl border-border shadow-2xl">
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold tracking-tight leading-none">
              {t("pair_display")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-sm">
              {t("enter_pairing_code")}
            </DialogDescription>
          </div>

          <div className="space-y-6">
            <div 
              className="flex flex-col items-center gap-4 p-8 bg-muted/30 rounded-2xl border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsScannerOpen(true)}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-1 text-center">
                <p className="text-sm font-bold tracking-tight text-foreground">
                  {t("scan_qr")}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {t("or_enter_code")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="XXXX"
                value={pairingCode}
                onChange={(e) => {
                  setPairingCode(e.target.value.toUpperCase())
                  setPairingError("")
                }}
                maxLength={4}
                className="text-center text-3xl font-bold tracking-[0.5em] h-16 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 placeholder:text-muted-foreground/20"
                disabled={pairingLoading}
              />

              {pairingError && (
                <div className="p-3 bg-rose-50 rounded-lg flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    {pairingError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPairingDialog(false)
                    setPairingCode("")
                    setPairingError("")
                  }}
                  className="flex-1 h-12 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all"
                  disabled={pairingLoading}
                >
                  {t("cancel")}
                </Button>

                <Button
                  onClick={handlePairing}
                  disabled={!pairingCode.trim() || pairingLoading}
                  className="flex-1 h-12 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg text-black hover:bg-green-50 hover:text-green-500"
                >
                  {pairingLoading ? t("syncing") : t("confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <QRScanner 
      open={isScannerOpen} 
      onClose={() => setIsScannerOpen(false)} 
      onDetected={(code) => {
        setPairingCode(code);
        setIsScannerOpen(false);
      }} 
    />
  </ProtectedRoute>
 )
}