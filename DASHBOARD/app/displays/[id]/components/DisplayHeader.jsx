import { Monitor, Wifi, WifiOff, Clock, Layers, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DisplayHeader({ display, online, hasMultipleScreens, screensCount, onCommand, onProjectionModeChange }) {
  return (
    <Card className="p-6 border border-border/40 shadow-sm bg-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-xl ${online ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{display.name || "Player senza nome"}</h1>
              <Badge variant={online ? "default" : "destructive"} className={online ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                {online ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {online ? "Online" : "Offline"}
              </Badge>
              {hasMultipleScreens && (
                <div className="flex items-center gap-2 ml-0 md:ml-4 bg-muted/30 px-3 py-1 rounded-md border border-border/40">
                  <input
                    type="checkbox"
                    id="extended_all"
                    checked={display.projection_mode === "extended"}
                    onChange={(e) => onProjectionModeChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="extended_all" className="text-sm font-medium text-foreground cursor-pointer select-none">
                    Modo Esteso
                  </label>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> {screensCount} {screensCount === 1 ? "schermo" : "schermi"}
              </span>
              {display.last_seen_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {new Date(display.last_seen_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" size="sm" onClick={() => onCommand("reboot")}>
            <Power className="w-4 h-4 mr-2" /> Riavvia Player
          </Button>
        </div>
      </div>
    </Card>
  );
}
