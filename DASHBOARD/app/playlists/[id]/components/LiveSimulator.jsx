"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Zap } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export default function LiveSimulator({ items, playerIndex, playerProgress }) {
  const { t } = useLanguage();

  const currentPlayerItem = items[playerIndex];
  const duration = currentPlayerItem?.duration_seconds || 0;
  const progressPercent = duration
    ? Math.min(100, (playerProgress / duration) * 100)
    : 0;

  const remaining = duration ? Math.max(0, duration - playerProgress) : 0;

  return (
    <div className="lg:col-span-5">
      <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
        <div className="px-2">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> {t("live_node_simulator")}
          </h3>
        </div>

        <Card className="overflow-hidden border border-border/40 rounded-xl p-0 group bg-card">
          <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
            {currentPlayerItem ? (
              currentPlayerItem.contents.type === "immagine" ? (
                <img
                  src={currentPlayerItem.contents.url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-xs font-semibold">
                  {t("broadcasting_signal")}
                </div>
              )
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-4">
                <Play className="w-12 h-12 md:w-16 md:h-16 opacity-10" />
                <span className="text-xs md:text-sm opacity-70">
                  {t("waiting_data")}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 w-full h-1.5 md:h-2 bg-white/10 z-20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-5 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-[10px]"
                  >
                    {t("transmitting")}
                  </Badge>
                </div>
                <h4 className="text-base md:text-lg font-semibold text-foreground">
                  {currentPlayerItem?.contents.name || "IDLE_STATE"}
                </h4>
              </div>

              <div className="sm:text-right w-full sm:w-auto flex sm:block items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                <div className="text-2xl md:text-3xl font-semibold text-primary">
                  {remaining}s
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {t("remaining")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <div className="bg-muted/20 rounded-lg p-4 border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("sequence_pos")}
                </p>
                <p className="text-base md:text-lg font-semibold">
                  {items.length > 0 ? playerIndex + 1 : 0} / {items.length}
                </p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4 border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">
                  {t("buffer_status")}
                </p>
                <p className="text-base md:text-lg font-semibold text-emerald-500">
                  {t("synced")}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
