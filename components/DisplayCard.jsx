"use client";

import { supabase } from "@/lib/supabaseClient";

export function DisplayCard({ display }) {
  async function sendCommand(type, payload = {}) {
    const { error } = await supabase
      .from("commands")
      .insert({
        display_id: display.id,
        type,
        payload,
      });

    if (error) {
      console.error("Errore comando:", error);
      alert("Errore: " + error.message);
    }
  }

  const isOnline = display.status === "online";

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-[0_18px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">
            {display.name || "Display senza nome"}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            ID: {display.id}
          </p>
        </div>
        <div
          className={
            "px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 " +
            (isOnline
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
              : "bg-rose-500/15 text-rose-300 border border-rose-500/40")
          }
        >
          <span
            className={
              "w-2 h-2 rounded-full " +
              (isOnline ? "bg-emerald-400" : "bg-rose-400")
            }
          />
          {isOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-slate-400">
          Ultimo contatto:{" "}
          {display.last_seen
            ? new Date(display.last_seen).toLocaleString()
            : "N/D"}
        </p>
        <p className="text-xs text-slate-400">
          Playlist attiva:{" "}
          <span className="text-slate-200">
            {display.active_playlist_name || "Nessuna"}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => sendCommand("run")}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors"
        >
          ▶ Run
        </button>
        <button
          onClick={() => sendCommand("stop")}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500 hover:bg-rose-400 text-rose-950 transition-colors"
        >
          ■ Stop
        </button>
        <button
          onClick={() =>
            sendCommand("updatePlaylist", {
              playlist_id: display.default_playlist_id || null,
            })
          }
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 transition-colors"
        >
          🔄 Cambia playlist
        </button>
      </div>
    </div>
  );
}
