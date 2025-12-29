"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


export default function SettingsPage() {
  
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  if (checkingAuth) {
    return null; // nessun flash della pagina
  }

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">

      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Impostazioni"
          subtitle="Configura il sistema e le preferenze"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-4">
            Impostazioni generali
          </div>

          <div className="text-sm text-slate-500">
            Qui potrai configurare preferenze, account, API key e altre impostazioni.
          </div>
        </main>
      </div>
    </div>
  );
}
