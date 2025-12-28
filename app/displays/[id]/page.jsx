"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";

export default function DisplayDetailPage() {
  const { id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const [display, setDisplay] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [logs, setLogs] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  function isOnline(lastSeen) {
    if (!lastSeen) return false;
    const diff = (Date.now() - new Date(lastSeen).getTime()) / 1000;
    return diff < 20;
  }

  async function loadData() {
    setLoading(true);

    // display
    const { data: d } = await supabase
      .from("displays")
      .select("*, playlists(*)")
      .eq("id", id)
      .single();

    setDisplay(d);
    setPlaylist(d?.playlists || null);

    // logs
    const { data: l } = await supabase
      .from("display_logs")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    setLogs(l || []);

    // screenshots
    const { data: s } = await supabase
      .from("display_screenshots")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    setScreenshots(s || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("display-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "displays" },
        () => loadData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  async function sendCommand(cmd) {
    await supabase.from("display_logs").insert({
      display_id: id,
      type: "command",
      message: cmd,
    });
    alert(`Comando inviato: ${cmd}`);
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title={display?.name || "Display"}
          subtitle="Controllo remoto e diagnostica"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6 space-y-8">
          {loading ? (
            <div className="text-sm text-slate-500">Caricamento...</div>
          ) : (
            <>
              {/* INFO DISPLAY */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{display.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Playlist assegnata:{" "}
                      {playlist ? playlist.name : "Nessuna"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Ultimo contatto:{" "}
                      {display.last_seen_at
                        ? new Date(display.last_seen_at).toLocaleString()
                        : "Mai"}
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isOnline(display.last_seen_at)
                        ? "bg-green-600/20 text-green-400 border border-green-700"
                        : "bg-red-600/20 text-red-400 border border-red-700"
                    }`}
                  >
                    {isOnline(display.last_seen_at) ? "Online" : "Offline"}
                  </div>
                </div>
              </section>

              {/* COMANDI */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="text-sm font-semibold mb-3">Comandi remoti</div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendCommand("refresh")}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  >
                    Refresh
                  </button>

                  <button
                    onClick={() => sendCommand("reloadPlaylist")}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  >
                    Ricarica playlist
                  </button>

                  <button
                    onClick={() => sendCommand("reboot")}
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-600/20 text-red-300 border border-red-700 hover:bg-red-600/30"
                  >
                    Riavvia display
                  </button>
                </div>
              </section>

              {/* SCREENSHOT */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="text-sm font-semibold mb-3">Screenshot</div>

                {screenshots.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    Nessuno screenshot disponibile.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {screenshots.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg overflow-hidden border border-slate-800"
                      >
                        <img src={s.url} className="w-full object-cover" />
                        <div className="text-[11px] text-slate-500 p-2">
                          {new Date(s.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* LOG */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="text-sm font-semibold mb-3">Log eventi</div>

                {logs.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    Nessun log disponibile.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {logs.map((l) => (
                      <div
                        key={l.id}
                        className="text-xs text-slate-400 border-b border-slate-800 pb-2"
                      >
                        <div className="text-[11px] text-slate-500">
                          {new Date(l.created_at).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-slate-300">{l.type}</span>:{" "}
                          {l.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
