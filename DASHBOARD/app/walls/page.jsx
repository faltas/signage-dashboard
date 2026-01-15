"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { WallManager } from "@/components/walls/WallManager";
import { useLanguage } from "@/app/language-provider";
import { LayoutGrid, ShieldCheck, Zap } from "lucide-react";

export default function WallsPage() {
  const supabase = useSupabase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    loadUser();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-80 transition-all duration-500">
          <TopBar
            title={t('video_walls') || 'Video Walls'}
            subtitle={t('multi_screen_config') || 'Multi-screen configurations'}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-8 md:px-12 py-10 space-y-12 max-w-[1700px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Network Infrastructure</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
                  Video <span className="text-primary">Walls</span>
                </h2>
              </div>
              
              <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-white/50 rounded-[1.5rem] border border-border/20 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cluster: Secure</span>
                </div>
                <div className="w-px h-6 bg-border/20" />
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync: 10ms</span>
                </div>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {userId && <WallManager userId={userId} />}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
