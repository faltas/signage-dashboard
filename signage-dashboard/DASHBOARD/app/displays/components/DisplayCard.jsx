"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, ArrowUpRight, PlayCircle, Globe, Layers, LayoutGrid, Pencil } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export function DisplayCard({ d, SavePlayerName }) {
  const online = d.status === "online" || d.status === "on";
  const paired = d.pairing_code === null;
  const hasPlaylist = d.playlists?.name;
  const hasWall = d.walls?.name;
  const screenCount = d.display_screens?.length || d.screen_count || 1;
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(d.name || "");

  async function handleSave() {
    setEditing(false);
    const newName = tempName.trim();
    if (!newName || newName === d.name) return;
    await SavePlayerName(d.id, newName);
  }

  return (
    <Link href={`/displays/${d.id}`} className="block group">
      <Card className="glass-premium card-premium p-0 border-none overflow-hidden flex flex-col gap-0 relative">

        {/* GLOW */}
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 blur-[100px] rounded-full transition-all duration-700 ${online ? "bg-emerald-500/20" : "bg-rose-500/10"}`} />

        {/* HEADER */}
        <div className="p-8 pb-4 relative z-10 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-3xl transition-all duration-500 ${online ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"} group-hover:scale-110 shadow-lg`}>
                <Monitor className="w-8 h-8" />
              </div>

              <div className="space-y-1">

                {/* Editable Name */}
                <div className="flex items-center gap-2 group">
                  {editing ? (
                    <input
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      className="
                        text-xl font-black tracking-tight bg-transparent 
                        border-b border-primary/40 focus:border-primary 
                        outline-none px-1 pb-0.5
                        transition-all duration-300
                      "
                    />
                  ) : (
                    <h3
                      className="
                        text-xl font-black tracking-tight text-black 
                        group-hover:text-primary transition-colors
                      "
                    >
                      {d.name || t('display_no_name')}
                    </h3>
                  )}

                  {!editing && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditing(true);
                      }}
                      className="
                        opacity-70 hover:opacity-100 
                        transition-opacity duration-300
                      "
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* WALL INFO */}
                <div className="flex items-center gap-2">
                  {hasWall ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" /> {d.walls.name}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Single Display
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* STATUS BADGE */}
            <Badge
              className={`
                px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full border-none
                ${online 
                  ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                  : "bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]"}
              `}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {online ? "ATTIVO" : "OFFLINE"}
            </Badge>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 pb-8 pt-4 space-y-6 relative z-10">

          {/* PLAYLIST + SCREENS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <PlayCircle className="w-3 h-3" /> Playlist
              </p>
              <p className="text-sm font-black truncate">{hasPlaylist || "Non assegnata"}</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Schermi
              </p>
              <p className="text-sm font-black truncate">{screenCount} {screenCount === 1 ? "schermo" : "schermi"}</p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between group-hover:px-2 transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {paired ? t("last_seen_at") : "Status"}
              </span>
              <span className="text-xs font-black text-black/80 italic">
                {!paired
                  ? "In attesa di pairing"
                  : d.last_seen_at
                  ? new Date(d.last_seen_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "DISCONNECTED"}
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* SCANLINES */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      </Card>
    </Link>
  );
}
