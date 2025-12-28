"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { DisplayCard } from "@/components/DisplayCard";

export default function DisplaysPage() {
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadDisplays() {
    setLoading(true);
    const { data, error } = await supabase
      .from("displays")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Errore caricamento displays:", error);
    } else {
      setDisplays(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDisplays();

    const channel = supabase
      .channel("displays-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "displays",
        },
        () => {
          loadDisplays();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">

      {/* Sidebar desktop */}
      <Sidebar />

      {/* Sidebar mobile */}
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Contenuto */}
      <div className="flex-1 flex flex-col">
        <TopBar
          title="Display"
          subtitle="Gestisci i display connessi e invia comandi in tempo reale"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Tutti i display
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {loading
                  ? "Caricamento in corso..."
                  : `${displays.length} display trovati`}
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40">
              + Aggiungi display
            </button>
          </div>

          {/* Griglia card */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displays.map((d) => (
              <DisplayCard key={d.id} display={d} />
            ))}
          </div>

          {/* Nessun display */}
          {!loading && displays.length === 0 && (
            <div className="mt-10 text-center text-sm text-slate-500">
              Nessun display registrato. Aggiungine uno dalla UI
              o inseriscilo nella tabella <code>displays</code> di Supabase.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
