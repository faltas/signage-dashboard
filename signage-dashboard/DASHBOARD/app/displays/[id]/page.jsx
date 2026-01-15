"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/app/language-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Layers, 
  PlayCircle, 
  RefreshCw, 
  Power, 
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Clock,
  Camera,
  FileText,
  Maximize2,
  Check
} from "lucide-react";

export default function DisplayDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useSupabase();

  const [display, setDisplay] = useState(null);
  const [screens, setScreens] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistItems, setPlaylistItems] = useState({});
  const [logs, setLogs] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedScreens, setExpandedScreens] = useState({});
  const [extendedContents, setExtendedContents] = useState([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    // Load display info
    const { data: displayData, error: displayError } = await supabase
      .from("displays")
      .select("*")
      .eq("id", id)
      .single();

    if (displayError) {
      console.error("Error loading display:", displayError);
      setLoading(false);
      return;
    }

    setDisplay(displayData);

    // Load display screens
    const { data: screensData } = await supabase
      .from("display_screens")
      .select(`
        *,
        playlists:playlist_id ( id, name )
      `)
      .eq("display_id", id)
      .order("screen_index", { ascending: true });

    setScreens(screensData || []);

    // Load all playlists for selection
    const { data: playlistsData } = await supabase
      .from("playlists")
      .select("id, name")
      .order("created_at", { ascending: false });

    setPlaylists(playlistsData || []);

    // Load playlist items for screens with assigned playlists
    const screenPlaylistIds = (screensData || [])
      .map(s => s.playlist_id)
      .filter(Boolean);
    
    if (screenPlaylistIds.length > 0) {
      const uniquePlaylistIds = [...new Set(screenPlaylistIds)];
      const itemsMap = {};
      
      for (const plId of uniquePlaylistIds) {
        const { data: items } = await supabase
          .from("playlist_items")
          .select("*, contents(*)")
          .eq("playlist_id", plId)
          .order("position", { ascending: true });
        itemsMap[plId] = items || [];
      }
      
      setPlaylistItems(itemsMap);
    }

    // Load extended contents setting from display metadata
    if (displayData?.extended_contents) {
      setExtendedContents(displayData.extended_contents);
    }

    // Load logs
    const { data: logsData } = await supabase
      .from("display_logs")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    setLogs(logsData || []);

    // Load screenshots
    const { data: screenshotsData } = await supabase
      .from("display_screenshots")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(4);

    setScreenshots(screenshotsData || []);

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    if (!id) return;
    
    loadData();

    const channel = supabase
      .channel(`display-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "displays", filter: `id=eq.${id}` }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "display_screens", filter: `display_id=eq.${id}` }, loadData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, supabase, loadData]);

  const sendCommand = useCallback(async (cmd, targetId, targetType = "display") => {
    const cmdTargetId = targetId || id;
    
    await supabase.from("display_logs").insert({
      display_id: id,
      type: "command",
      message: `${cmd} sent to ${targetType} ${cmdTargetId}`,
    });

    await supabase.from("display_commands").insert({
      display_id: id,
      command_type: cmd,
      params: { target_id: cmdTargetId, target_type: targetType },
    });

    alert(`Comando "${cmd}" inviato!`);
  }, [id, supabase]);

  const updateScreenPlaylist = useCallback(async (screenId, playlistId) => {
    const { error } = await supabase
      .from("display_screens")
      .update({ playlist_id: playlistId || null })
      .eq("id", screenId);

    if (!error) {
      await sendCommand("reload_playlist", screenId, "screen");
      loadData();
    }
  }, [supabase, sendCommand, loadData]);

  const updateScreenSetting = useCallback(async (screenId, field, value) => {
    const { error } = await supabase
      .from("display_screens")
      .update({ [field]: value })
      .eq("id", screenId);

    if (!error) {
      loadData();
    }
  }, [supabase, loadData]);

  // Find duplicate contents across screen playlists
  const duplicateContents = useMemo(() => {
    const contentMap = new Map();
    
    screens.forEach(screen => {
      if (screen.playlist_id && playlistItems[screen.playlist_id]) {
        playlistItems[screen.playlist_id].forEach(item => {
          if (item.contents) {
            const contentId = item.contents.id;
            if (!contentMap.has(contentId)) {
              contentMap.set(contentId, {
                content: item.contents,
                screens: []
              });
            }
            contentMap.get(contentId).screens.push({
              screenId: screen.id,
              screenIndex: screen.screen_index,
              playlistItemId: item.id
            });
          }
        });
      }
    });

    return Array.from(contentMap.values()).filter(item => item.screens.length > 1);
  }, [screens, playlistItems]);

  const toggleExtendContent = useCallback(async (contentId) => {
    const newExtended = extendedContents.includes(contentId)
      ? extendedContents.filter(cid => cid !== contentId)
      : [...extendedContents, contentId];
    
    setExtendedContents(newExtended);
    
    await supabase
      .from("displays")
      .update({ extended_contents: newExtended })
      .eq("id", id);
    
    await sendCommand("reload_playlist");
  }, [extendedContents, id, supabase, sendCommand]);

  if (!id) return null;

  const online = display?.status === "online" || display?.status === "on";
  const hasMultipleScreens = screens.length > 1;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar
            title={display?.name || "Player"}
            subtitle="Gestione schermi collegati"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 space-y-8 max-w-[1400px] mx-auto w-full">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
            ) : !display ? (
              <Card className="p-12 text-center">
                <Monitor className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Player non trovato</h3>
                <Button onClick={() => router.push("/displays")}>Torna ai player</Button>
              </Card>
            ) : (
              <>
                {/* HEADER INFO - Solo Riavvia come comando */}
                <Card className="glass-premium p-6 border-none">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`p-5 rounded-3xl ${online ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        <Monitor className="w-10 h-10" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h1 className="text-2xl font-black">{display.name || "Player senza nome"}</h1>
                          <Badge className={online ? "bg-emerald-500" : "bg-rose-500"}>
                            {online ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                            {online ? "Online" : "Offline"}
                          </Badge>
                          {hasMultipleScreens && (
                            <div className="flex items-center gap-2 ml-4">
                              <input
                                type="checkbox"
                                id="extended_all"
                                checked={display.projection_mode === "extended"}
                                onChange={async (e) => {
                                  const newValue = e.target.checked ? "extended" : "contain";
                                  const { error } = await supabase
                                    .from("displays")
                                    .update({ projection_mode: newValue })
                                    .eq("id", id);
                                  if (!error) {
                                    setDisplay({ ...display, projection_mode: newValue });
                                    await sendCommand("reload_playlist");
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="extended_all" className="text-sm font-medium text-primary">
                                Modo Esteso (Multi-schermo)
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="w-4 h-4" /> {screens.length} {screens.length === 1 ? "schermo" : "schermi"}
                          </span>
                          {display.last_seen_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {new Date(display.last_seen_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="destructive" size="sm" onClick={() => sendCommand("reboot")}>
                        <Power className="w-4 h-4 mr-2" /> Riavvia Player
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* SEZIONE ESTENSIONE CONTENUTI - Solo se più schermi e contenuti duplicati */}
                {hasMultipleScreens && duplicateContents.length > 0 && (
                  <Card className="glass-premium p-6 border-none">
                    <div className="flex items-center gap-3 mb-4">
                      <Maximize2 className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black">Contenuti Estendibili</h2>
                      <Badge variant="outline" className="text-xs">{duplicateContents.length} contenuti condivisi</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      I seguenti contenuti sono presenti nelle playlist di più schermi. 
                      Puoi scegliere di estenderli su tutti i display come un unico contenuto grande.
                    </p>
                    
                    <div className="space-y-3">
                      {duplicateContents.map(({ content, screens: contentScreens }) => (
                        <div 
                          key={content.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            extendedContents.includes(content.id) 
                              ? "bg-primary/10 border-primary/30" 
                              : "bg-card/50 border-border hover:bg-card"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/40">
                              {content.type === "immagine" || content.type === "image" ? (
                                <img src={content.url} className="w-full h-full object-cover" alt={content.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PlayCircle className="w-5 h-5 text-primary/40" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{content.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Presente su schermi: {contentScreens.map(s => s.screenIndex + 1).join(", ")}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant={extendedContents.includes(content.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleExtendContent(content.id)}
                            className="gap-2"
                          >
                            {extendedContents.includes(content.id) ? (
                              <>
                                <Check className="w-4 h-4" />
                                Esteso
                              </>
                            ) : (
                              <>
                                <Maximize2 className="w-4 h-4" />
                                Estendi
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Nota:</strong> Quando un contenuto è esteso, verrà mostrato come un unica immagine/video 
                        che si estende su tutti gli schermi collegati al player, creando un effetto video wall.
                      </p>
                    </div>
                  </Card>
                )}

                {/* SCHERMI */}
                {screens.length > 0 && (
                  <Card className="glass-premium p-6 border-none">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-black">Schermi Collegati ({screens.length})</h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {screens.map((screen) => (
                        <ScreenCard
                          key={screen.id}
                          screen={screen}
                          playlists={playlists}
                          expanded={expandedScreens[screen.id]}
                          onToggle={() => setExpandedScreens(prev => ({
                            ...prev,
                            [screen.id]: !prev[screen.id]
                          }))}
                          onPlaylistChange={(playlistId) => updateScreenPlaylist(screen.id, playlistId)}
                          onSettingChange={(field, value) => updateScreenSetting(screen.id, field, value)}
                          onCommand={(cmd) => sendCommand(cmd, screen.id, "screen")}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {/* SCREENSHOTS */}
                {screenshots.length > 0 && (
                  <Card className="glass-premium p-6 border-none">
                    <div className="flex items-center gap-3 mb-4">
                      <Camera className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black">Screenshot recenti</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {screenshots.map((s) => (
                        <div key={s.id} className="rounded-xl overflow-hidden border bg-muted/50">
                          <img src={s.url} alt="Screenshot" className="w-full h-32 object-cover" />
                          <div className="text-xs text-muted-foreground p-2">
                            {new Date(s.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* LOGS */}
                <Card className="glass-premium p-6 border-none">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-black">Log eventi</h2>
                  </div>
                  {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessun log disponibile.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                          <Badge variant="outline" className="text-xs shrink-0">{log.type}</Badge>
                          <div className="flex-1">
                            <p className="text-foreground">{log.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ScreenCard({ screen, playlists, expanded, onToggle, onPlaylistChange, onSettingChange, onCommand }) {
  const [brightness, setBrightness] = useState(screen.brightness || 100);
  const [resolution, setResolution] = useState(screen.resolution || `${screen.width}x${screen.height}`);

  return (
    <div className="border rounded-xl overflow-hidden bg-card/50">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${screen.is_primary ? "bg-primary/10 text-primary" : "bg-muted"}`}>
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Schermo {screen.screen_index + 1}</span>
              {screen.is_primary && <Badge className="text-xs">Principale</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {screen.width}x{screen.height} • {screen.orientation || "landscape"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            <PlayCircle className="w-3 h-3 mr-1" />
            {screen.playlists?.name || "Nessuna playlist"}
          </Badge>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t bg-muted/20 space-y-6">
          {/* Playlist */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Playlist</label>
            <select
              className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
              value={screen.playlist_id || ""}
              onChange={(e) => onPlaylistChange(e.target.value)}
            >
              <option value="">— Nessuna playlist —</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Impostazioni schermo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Luminosità</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12">{brightness}%</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCommand(`set_brightness:${brightness}`)}
                >
                  Applica
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold mb-2 block">Risoluzione</label>
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="2560x1440">2560x1440 (2K)</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const [w, h] = resolution.split("x");
                    onCommand(`set_resolution:${w}:${h}`);
                  }}
                >
                  Applica
                </Button>
              </div>
            </div>
          </div>

          {/* Comandi schermo */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onCommand("refresh")}>
              <RefreshCw className="w-3 h-3 mr-1" /> Aggiorna
            </Button>
            <Button variant="outline" size="sm" onClick={() => onCommand("reload_playlist")}>
              <PlayCircle className="w-3 h-3 mr-1" /> Ricarica Playlist
            </Button>
          </div>

          {/* Info schermo */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground border-t">
            <div>
              <span className="font-semibold">Indice:</span>
              <p>Schermo {screen.screen_index + 1}</p>
            </div>
            <div>
              <span className="font-semibold">Dimensioni:</span>
              <p>{screen.viewport_width || screen.width}x{screen.viewport_height || screen.height}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
