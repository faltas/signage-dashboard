"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Cog } from "lucide-react";
import { SettingsOverview } from "@/components/settings/SettingsOverview";
import { SettingsActions } from "./components/SettingsActions";
import { useLanguage } from "@/app/language-provider";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar title={t('control_panel_title')} subtitle={t('system_admin_protocols')} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-8 py-10 space-y-12 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <Cog className="w-3 h-3" /> {t('control_panel')} / Configuration / Global
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-foreground">{t('settings_title')}</h2>
              </div>
            </div>
            <SettingsOverview />
            <SettingsActions />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
