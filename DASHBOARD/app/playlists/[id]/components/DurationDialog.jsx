"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export default function DurationDialog({
  ModalContent,
  setModalContent,
  durationSeconds,
  setDurationSeconds,
  isSticky,
  setIsSticky,
  expandToAllScreens,
  setExpandToAllScreens,
  confirmAddContentToPlaylist,
}) {
  const { t } = useLanguage();

  const open = !!ModalContent;

  return (
    <Dialog open={open} onOpenChange={() => setModalContent(null)}>
      <DialogContent className="sm:max-w-md border border-border/40 shadow-lg rounded-xl p-6 md:p-7 max-w-[95vw]">
        <DialogHeader className="space-y-2">
          <div className="p-2.5 bg-primary/10 rounded-md w-fit">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-lg md:text-xl font-semibold text-foreground">
            {t("transmission_timing")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("set_active_duration")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 md:py-5 space-y-5">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-md border cursor-pointer transition-all ${
              isSticky
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-muted/10 border-border/60 hover:bg-muted/20"
            }`}
            onClick={() => setIsSticky(!isSticky)}
          >
            <div
              className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                isSticky ? "bg-amber-500 border-amber-500" : "border-muted-foreground/60"
              }`}
            >
              {isSticky && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Contenuto persistente</p>
              <p className="text-xs text-muted-foreground">
                Il contenuto rimane sempre in riproduzione senza passare al successivo (ideale per contenuto singolo)
              </p>
            </div>
          </div>

          <div className={`space-y-3 ${isSticky ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="text-xs font-medium text-muted-foreground ml-1">
              {t("seconds_loop")}
            </label>
            <div className="relative">
              <Input
                type="number"
                value={isSticky ? 0 : durationSeconds}
                onChange={(e) =>
                  setDurationSeconds(parseInt(e.target.value) || 10)
                }
                className="bg-card border-border h-10 md:h-11 rounded-md px-4 text-base md:text-lg"
                disabled={isSticky}
              />
              <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                {isSticky ? "∞" : t("sec")}
              </div>
            </div>
            {isSticky && (
              <p className="text-xs text-amber-600">
                La durata è ignorata per i contenuti persistenti
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Opzione video wall
            </label>
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-md border cursor-pointer transition-all ${
                expandToAllScreens
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/10 border-border/60 hover:bg-muted/20"
              }`}
              onClick={() => setExpandToAllScreens(!expandToAllScreens)}
            >
              <div
                className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                  expandToAllScreens
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/60"
                }`}
              >
                {expandToAllScreens && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Espandi su tutti gli schermi</p>
                <p className="text-xs text-muted-foreground">
                  Il contenuto verrà mostrato su tutti gli schermi del video wall come un unico grande schermo
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="h-10 md:h-11 px-5 md:px-6 w-full sm:w-auto"
            onClick={() => setModalContent(null)}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={confirmAddContentToPlaylist}
            className="h-10 md:h-11 px-5 md:px-6 w-full sm:w-auto"
          >
            {t("inject_asset")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
