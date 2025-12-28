"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { TopBar } from "@/components/TopBar";

export default function PlaylistsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">

      <Sidebar />
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Playlist"
          subtitle="Gestisci le playlist e assegnale ai display"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Tutte le playlist
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Funzionalità in arrivo
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40">
              + Nuova playlist
            </button>
          </div>

          <div className="text-center text-sm text-slate-500 mt-10">
            Qui potrai creare playlist, aggiungere contenuti e assegnarle ai display.
          </div>
        </main>
      </div>
    </div>
  );
}
