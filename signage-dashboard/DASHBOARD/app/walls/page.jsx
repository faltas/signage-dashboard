"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { WallManager } from "@/components/walls/WallManager";
import { useLanguage } from "@/app/language-provider";

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
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar
            title={t('video_walls') || 'Video Walls'}
            subtitle={t('multi_screen_config') || 'Multi-screen configurations'}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-[1600px] mx-auto w-full">
            {userId && <WallManager userId={userId} />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
