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
  Camera, 
  FileText
} from "lucide-react";

import { DisplayHeader } from "./components/DisplayHeader";
import { ExtendedContentSection } from "./components/ExtendedContentSection";
import { ScreenCard } from "./components/ScreenCard";

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

    const { data: displayData, error: displayError } = await supabase
      .from("displays")
      .select("*")
      .eq("id", id)
      .single();

    if (displayError) {
      setLoading(false);
      return;
    }

    setDisplay(displayData);

    const { data: screensData } = await supabase
      .from("display_screens")
      .select(`
        *,
        playlists:playlist_id ( id, name )
      `)
      .eq("display_id", id)
      .order("windowindex", { ascending: true });

    setScreens(screensData || []);

    const { data: playlistsData } = await supabase
      .from("playlists")
      .select("id, name")
      .order("created_at", { ascending: false });

    setPlaylists(playlistsData || []);

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

    if (displayData?.extended_contents) {
      setExtendedContents(displayData.extended_contents);
    }

    const { data: logsData } = await supabase
      .from("display_logs")
      .select("*")
      .eq("display_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    setLogs(logsData || []);

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
  
    loadData(); // primo caricamento
  
    const channel = supabase.channel(`display-detail-${id}`);
  
    // 1. Cambi nel record del display
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "displays", filter: `id=eq.${id}` },
      (payload) => {
        setDisplay(payload.new);
      }
    );
  
    // 2. Cambi negli screen (aggiunta, rimozione, update)
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "display_screens", filter: `display_id=eq.${id}` },
      async () => {
        const { data } = await supabase
          .from("display_screens")
          .select("*, playlists:playlist_id (id, name)")
          .eq("display_id", id)
          .order("windowindex", { ascending: true });
  
        setScreens(data || []);
      }
    );
  
    // 3. Cambi negli items delle playlist
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "playlist_items" },
      async (payload) => {
        const plId = payload.new?.playlist_id || payload.old?.playlist_id;
        if (!plId) return;
  
        const { data } = await supabase
          .from("playlist_items")
          .select("*, contents(*)")
          .eq("playlist_id", plId)
          .order("position", { ascending: true });
  
        setPlaylistItems(prev => ({ ...prev, [plId]: data || [] }));
      }
    );
  
    // 4. Nuovi log
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "display_logs", filter: `display_id=eq.${id}` },
      (payload) => {
        setLogs(prev => [payload.new, ...prev.slice(0, 19)]);
      }
    );
  
    // 5. Nuovi screenshot
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "display_screenshots", filter: `display_id=eq.${id}` },
      (payload) => {
        setScreenshots(prev => [payload.new, ...prev.slice(0, 3)]);
      }
    );
  
    channel.subscribe();
  
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
      type: cmd,
      params: { target_id: cmdTargetId, target_type: targetType },
    });
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
    if (!error) loadData();
  }, [supabase, loadData]);

  const duplicateContents = useMemo(() => {
    const contentMap = new Map();
    screens.forEach(screen => {
      if (screen.playlist_id && playlistItems[screen.playlist_id]) {
        playlistItems[screen.playlist_id].forEach(item => {
          if (item.contents) {
            const contentId = item.contents.id;
            if (!contentMap.has(contentId)) {
              contentMap.set(contentId, { content: item.contents, screens: [] });
            }
            contentMap.get(contentId).screens.push({
              screenId: screen.id,
              screenIndex: screen.windowindex,
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
    await supabase.from("displays").update({ extended_contents: newExtended }).eq("id", id);
    await sendCommand("reload_playlist");
  }, [extendedContents, id, supabase, sendCommand]);

  const updateProjectionMode = async (isExtended) => {
    const newValue = isExtended ? "extended" : "contain";
    const { error } = await supabase.from("displays").update({ projection_mode: newValue }).eq("id", id);
    if (!error) {
      setDisplay({ ...display, projection_mode: newValue });
      await sendCommand("reload_playlist");
    }
  };

  if (!id) return null;
  const online = display?.status === "online" || display?.status === "on";
  const hasMultipleScreens = screens.length > 1;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
          <TopBar title={display?.name || "Player"} subtitle="Gestione player e schermi" onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-8 space-y-6 max-w-[1400px] mx-auto w-full">
            {loading ? (
              <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
            ) : !display ? (
              <Card className="p-12 text-center border-dashed border-border/60 bg-muted/10 shadow-none">
                <Monitor className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Player non trovato</h3>
                <Button onClick={() => router.push("/displays")}>Torna ai player</Button>
              </Card>
            ) : (
              <>
                <DisplayHeader 
                  display={display} 
                  online={online} 
                  hasMultipleScreens={hasMultipleScreens} 
                  screensCount={screens.length} 
                  onCommand={sendCommand} 
                  onProjectionModeChange={updateProjectionMode}
                />

                {hasMultipleScreens && duplicateContents.length > 0 && (
                  <ExtendedContentSection 
                    duplicateContents={duplicateContents} 
                    extendedContents={extendedContents} 
                    onToggleExtend={toggleExtendContent}
                  />
                )}

                <div className="grid grid-cols-1 gap-4">
                  {screens.map((screen) => (
                    <ScreenCard
                      key={screen.id}
                      screen={screen}
                      playlists={playlists}
                      expanded={expandedScreens[screen.id]}
                      onToggle={() => setExpandedScreens(p => ({ ...p, [screen.id]: !p[screen.id] }))}
                      onPlaylistChange={(plId) => updateScreenPlaylist(screen.id, plId)}
                      onSettingChange={(f, v) => updateScreenSetting(screen.id, f, v)}
                      onCommand={(cmd) => sendCommand(cmd, screen.id, "screen")}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
