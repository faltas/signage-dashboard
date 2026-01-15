"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  ArrowUpRight,
  PlayCircle,
  Globe,
  Layers,
  LayoutGrid,
  Pencil,
} from "lucide-react";
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
      <Card className="h-full border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-border transition-all duration-200 overflow-hidden flex flex-col">
        
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                  p-2.5 rounded-lg transition-colors duration-200 
                  ${online ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"} 
                `}
              >
                <Monitor className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 group/edit">
                  {editing ? (
                    <input
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      onClick={(e) => e.preventDefault()}
                      className="text-base font-semibold bg-transparent border-b border-primary focus:border-primary outline-none px-0 py-0 min-w-[150px]"
                    />
                  ) : (
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {d.name || t("display_no_name")}
                    </h3>
                  )}

                  {!editing && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditing(true);
                      }}
                      className="opacity-0 group-hover/edit:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasWall ? (
                    <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                      <LayoutGrid className="w-3 h-3" /> {d.walls.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Single Display
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`
                px-2.5 py-0.5 text-[10px] font-medium rounded-full border
                ${online 
                  ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" 
                  : "bg-rose-500/5 text-rose-600 border-rose-500/20"}
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${online ? "bg-emerald-500" : "bg-rose-500"}`} />
              {online ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <PlayCircle className="w-3 h-3" /> Playlist
              </p>
              <p className="text-sm font-medium truncate text-foreground">{hasPlaylist || "None assigned"}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Screens
              </p>
              <p className="text-sm font-medium truncate text-foreground">
                {screenCount} {screenCount === 1 ? "screen" : "screens"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border/50 bg-muted/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium">
              {paired ? t("last_seen_at") : "Status"}
            </span>
            <span className="text-xs font-medium text-foreground">
              {!paired
                ? "Pending Pairing"
                : d.last_seen_at
                ? new Date(d.last_seen_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Disconnected"}
            </span>
          </div>

          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
