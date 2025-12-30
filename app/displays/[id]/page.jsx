"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DisplayDetailPage() {
  const { id } = useParams();
  if (!id) return null;
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [display, setDisplay] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [logs, setLogs] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  function isOnline(status) {
    if (status === "on") return "bg-green-500";
    if (status === "off") return "bg-red-500";
    if (status === "mgmt") return "bg-orange-500";
    return "bg-gray-500";
  }

  async function loadData() {
    setLoading(true);

    const { data: d } = await supabase
      .from("displays")
      .select(`
        id,
        name,
        status,
        last_seen_at,
        playlist_id,
        playlists:playlist_id ( name )
      `)
      .eq("id", id)
      .single();

    setDisplay(d);
    setPlaylist(d?.playlists || null);

    const { data: l } = await supabase
      .from("display_logs")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    setLogs(l || []);

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
    if (!id) return;
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
  
  async function assignPlaylist(playlistId) {
    if (!playlistId) return;
  
    // 1) aggiorna display
    const { error: err1 } = await supabase
      .from("displays")
      .update({
        playlist_id: playlistId,
        pairing_code: null, // rimuove pairing se ancora presente
      })
      .eq("id", id);
  
    if (err1) {
      alert("Errore aggiornamento display");
      return;
    }
  
    // 2) invia comando remoto
    const { error: err2 } = await supabase.from("commands").insert({
      display_id: id,
      type: "assignPlaylist",
      status: "pending",
      payload: { playlist_id: playlistId },
    });
  
    if (err2) {
      alert("Errore invio comando remoto");
      return;
    }
  
    alert("Playlist assegnata!");
    loadData();
  }


  return (
    <ProtectedRoute>
      <div
        className="
          flex min-h-screen
          bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))]
          text-slate-900 backdrop-blur-2xl
        "
      >
        <Sidebar />
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col">
          <TopBar
            title={display?.name || "Display"}
            subtitle="Controllo remoto e diagnostica"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-10 space-y-10">

            {loading ? (
              <div className="text-sm text-slate-500">Caricamento...</div>
            ) : (
              <>
                {/* INFO DISPLAY */}
                <section
                  className="
                    rounded-2xl border border-slate-200 bg-white/90 p-6
                    shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src="/icons/display.png"
                        className="w-10 h-10 opacity-90"
                      />
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {display.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          Playlist assegnata:{" "}
                          {playlist ? playlist.name : "Nessuna"}
                        </div>
                        <div className="text-sm text-slate-500">
                          Ultimo contatto:{" "}
                          {display.last_seen_at
                            ? new Date(display.last_seen_at).toLocaleString()
                            : "Mai"}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`
                        px-4 py-2 rounded-xl text-sm font-semibold border
                        ${
                          display.status === "on"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }
                      `}
                    >
                      {display.status === "on" ? "Online" : "Offline"}
                    </div>
                  </div>
                </section>
				{/* ASSEGNAZIONE PLAYLIST */}
				<section
				className="
					rounded-2xl border border-slate-200 bg-white/90 p-6
					shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
				"
				>
				<div className="text-lg font-bold text-slate-900 mb-4">
					Assegna Playlist
				</div>
				
				<PlaylistSelector
					supabase={supabase}
					displayId={id}
					currentPlaylistId={display?.playlist_id}
					onAssigned={() => loadData()}
				/>
				</section>

                {/* COMANDI */}
                <section
                  className="
                    rounded-2xl border border-slate-200 bg-white/90 p-6
                    shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
                  "
                >
                  <div className="text-lg font-bold text-slate-900 mb-4">
                    Comandi remoti
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => sendCommand("refresh")}
                      className="
                        px-4 py-2 rounded-xl text-sm font-semibold
                        bg-white border border-slate-300 text-slate-700
                        hover:bg-slate-100 shadow-sm transition
                      "
                    >
                      Refresh
                    </button>

                    <button
                      onClick={() => sendCommand("reloadPlaylist")}
                      className="
                        px-4 py-2 rounded-xl text-sm font-semibold
                        bg-white border border-slate-300 text-slate-700
                        hover:bg-slate-100 shadow-sm transition
                      "
                    >
                      Ricarica playlist
                    </button>

                    <button
                      onClick={() => sendCommand("reboot")}
                      className="
                        px-4 py-2 rounded-xl text-sm font-semibold
                        bg-red-500 text-white shadow-md shadow-red-200/50
                        hover:bg-red-600 transition
                      "
                    >
                      Riavvia display
                    </button>
                  </div>
                </section>

                {/* SCREENSHOT */}
                <section
                  className="
                    rounded-2xl border border-slate-200 bg-white/90 p-6
                    shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
                  "
                >
                  <div className="text-lg font-bold text-slate-900 mb-4">
                    Screenshot recenti
                  </div>

                  {screenshots.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Nessuno screenshot disponibile.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {screenshots.map((s) => (
                        <div
                          key={s.id}
                          className="
                            rounded-xl overflow-hidden border border-slate-200
                            bg-white shadow-sm hover:shadow-md transition
                          "
                        >
                          <img
                            src={s.url}
                            className="w-full h-48 object-cover"
                          />
                          <div className="text-xs text-slate-500 p-3">
                            {new Date(s.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* LOG */}
                <section
                  className="
                    rounded-2xl border border-slate-200 bg-white/90 p-6
                    shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
                  "
                >
                  <div className="text-lg font-bold text-slate-900 mb-4">
                    Log eventi
                  </div>

                  {logs.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Nessun log disponibile.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {logs.map((l) => (
                        <div
                          key={l.id}
                          className="
                            border-b border-slate-200 pb-3
                            text-sm text-slate-700
                          "
                        >
                          <div className="text-xs text-slate-500">
                            {new Date(l.created_at).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">
                              {l.type}
                            </span>
                            : {l.message}
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
    </ProtectedRoute>
  );
}

function PlaylistSelector({ supabase, displayId, currentPlaylistId, onAssigned }) {
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState(currentPlaylistId || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadPlaylists() {
    setLoading(true);

    const { data } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    setPlaylists(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function assign() {
    if (!selected) return;

    setSaving(true);

    // 1) aggiorna display
    const { error: err1 } = await supabase
      .from("displays")
      .update({
        playlist_id: selected,
        pairing_code: null,
      })
      .eq("id", displayId);

    if (err1) {
      alert("Errore aggiornamento display");
      setSaving(false);
      return;
    }

    // 2) invia comando remoto
    const { error: err2 } = await supabase.from("commands").insert({
      display_id: displayId,
      type: "assignPlaylist",
      status: "pending",
      payload: { playlist_id: selected },
    });

    if (err2) {
      alert("Errore invio comando remoto");
      setSaving(false);
      return;
    }

    setSaving(false);
    onAssigned();
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-sm text-slate-500">Caricamento playlist...</div>
      ) : (
        <>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">— Nessuna playlist —</option>
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={assign}
            disabled={saving || !selected}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 text-white shadow-md shadow-indigo-200/50 hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {saving ? "Assegnazione..." : "Assegna playlist"}
          </button>
        </>
      )}
    </div>
  );
}
