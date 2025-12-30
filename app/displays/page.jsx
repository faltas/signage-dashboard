"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DisplaysPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  async function loadDisplays() {
    setLoading(true);

    const { data, error } = await supabase
      .from("displays")
      .select(`
        id,
        name,
        status,
        last_seen_at,
        playlist_id,
        playlists:playlist_id ( name )
      `)
      .not("user_id", "is", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("Errore caricamento displays:", error);
      setDisplays([]);
    } else {
      setDisplays(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDisplays();

    const channel = supabase
      .channel("displays-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "displays" },
        () => loadDisplays()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  function IsOnline(status) {
    if (status === "on") return "bg-green-500";
    if (status === "off") return "bg-red-500";
    if (status === "mgmt") return "bg-orange-500";
    return "bg-gray-400";
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))] text-slate-900 backdrop-blur-2xl">
        <Sidebar />
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col">
          <TopBar
            title="Display"
            subtitle="Gestisci i display connessi"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-8 space-y-10">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold uppercase tracking-[0.2em] text-slate-500">
                Tutti i display
              </div>

              <Link
                href="/displays/add"
                className="
                  px-6 py-2 rounded-xl text-m font-semibold
                  bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                  hover:bg-indigo-600 transition justify-between
                "
              >
                + Aggiungi Display
              </Link>
            </div>

            {/* LISTA DISPLAY */}
            {loading ? (
              <div className="text-sm text-slate-500">Caricamento...</div>
            ) : displays.length === 0 ? (
              <div className="text-sm text-slate-500 mt-10 text-center">
                Nessun display registrato.
              </div>
            ) : (
              <div>
                <div className="text-sm text-slate-500 mb-4">
                  {displays.length} Display
                </div>

                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {displays.map((d) => (
                    <div
                      key={d.id}
                      className="
                        rounded-2xl border border-slate-200 bg-white/90
                        p-6 flex flex-col gap-4
                        shadow-sm hover:shadow-xl hover:shadow-slate-200/70
                        transition-all
                      "
                    >
                      {/* HEADER CARD */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="/icons/display.png"
                            className="w-8 h-8 opacity-90"
                            alt="display"
                          />
                          <div className="text-lg font-bold text-slate-900">
                            {d.name}
                          </div>
                        </div>

                        <div
                          className={`w-3 h-3 rounded-full ${IsOnline(
                            d.status
                          )}`}
                        />
                      </div>

                      {/* INFO */}
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">
                          Playlist:
                        </span>{" "}
                        {d.playlists?.name || (
                          <span className="text-slate-400">Nessuna</span>
                        )}
                      </div>

                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">
                          Ultimo contatto:
                        </span>{" "}
                        {d.last_seen_at
                          ? new Date(d.last_seen_at).toLocaleString()
                          : "Mai"}
                      </div>

                      {/* BUTTON */}
                      <Link
                        href={`/displays/${d.id}`}
                        className="
                          mt-3 px-4 py-2 rounded-xl text-sm font-semibold
                          bg-white border border-slate-300 text-slate-700
                          hover:bg-slate-100 shadow-sm transition text-center
                        "
                      >
                        Dettagli
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
