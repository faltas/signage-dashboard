"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Cog, ShieldAlert, Cpu, Database, Settings2 } from "lucide-react";
import { SettingsOverview } from "@/components/settings/SettingsOverview";
import { SettingsActions } from "./components/SettingsActions";
import { useLanguage } from "@/app/language-provider";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col md:pl-80 transition-all duration-500">
          <TopBar 
            title={t('control_panel_title')} 
            subtitle={t('system_admin_protocols')} 
            onMenuClick={() => setSidebarOpen(true)} 
          />
          
          <main className="flex-1 px-8 md:px-12 py-10 space-y-16 max-w-[1700px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-border/20 pb-12 animate-in fade-in slide-in-from-top-6 duration-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-primary">
                  <Settings2 className="w-4.5 h-4.5" /> 
                  {t('control_panel')} <span className="text-muted-foreground/30 mx-2">/</span> Configuration <span className="text-muted-foreground/30 mx-2">/</span> Global
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-none">
                  {t('settings_title')}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Admin Mode</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">v4.2.0-STABLE</span>
                </div>
              </div>
            </div>

            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <h3 className="text-2xl font-black tracking-tight uppercase">System Health</h3>
                </div>
                <SettingsOverview />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                  <h3 className="text-2xl font-black tracking-tight uppercase">Security Protocols</h3>
                </div>
                <SettingsActions />
              </div>

              <div className="pt-10 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-muted-foreground/40">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Storage Engine: Supabase Cloud</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">© 2026 SIGNAGECLOUD OS • SECURE CORE V4</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
