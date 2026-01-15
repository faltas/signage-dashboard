import { useState } from "react";
import { Monitor, PlayCircle, ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ScreenCard({ screen, playlists, expanded, onToggle, onPlaylistChange, onSettingChange, onCommand }) {
  const [brightness, setBrightness] = useState(screen.brightness || 100);
  const [resolution, setResolution] = useState(screen.resolution || `${screen.width}x${screen.height}`);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${expanded ? "bg-card shadow-md border-primary/20" : "bg-card border-border/40 hover:border-border"}`}>
      <div 
        className="flex items-center justify-between p-5 md:p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div className={`p-3 rounded-lg transition-colors ${screen.is_primary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg text-foreground">Schermo {screen.screen_index + 1}</span>
              {screen.is_primary && <Badge variant="secondary" className="text-[10px] font-medium">Main</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {screen.width}x{screen.height} • {screen.orientation || "landscape"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden sm:flex rounded-md px-3 py-1 font-medium text-xs gap-2 border-border/60">
            <PlayCircle className="w-3.5 h-3.5 text-primary" />
            {screen.playlists?.name || "Nessuna playlist"}
          </Badge>
          <div className={`p-2 rounded-full hover:bg-muted/50 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 md:p-8 pt-0 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Playlist Assignment</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={screen.playlist_id || ""}
                onChange={(e) => onPlaylistChange(e.target.value)}
              >
                <option value="">— Nessuna playlist —</option>
                {playlists.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Brightness Calibration</label>
              <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-lg border border-border/40">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="flex-1 accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium w-12 text-center">{brightness}%</span>
                <Button 
                  size="sm"
                  onClick={() => onCommand(`set_brightness:${brightness}`)}
                  className="h-8 text-xs"
                >
                  Applica
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Resolution Protocol</label>
              <div className="flex items-center gap-3">
                <select
                  className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-10 px-4"
                  onClick={() => onCommand(`set_resolution:${resolution}`)}
                >
                  Set
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
