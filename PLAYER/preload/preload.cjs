// preload/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

const configFile = require("./config.cjs");
const { Env } = require("./env.cjs");
const { initSupabase } = require("./supabaseClient.cjs");
const QRCode = require("qrcode");

// 1) ENV & Supabase (singleton)
const env = Env();
let supabase = initSupabase(env.SUPABASE_LINK, env.ANON_KEY, null);

// 2) CACHE (estratta in funzioni chiare)
const userDataPath = path.join(os.homedir(), "DigitalSignageCache");
const CACHE_DIR = path.join(userDataPath, "contents");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function cacheContent(url, id) {
  const filePath = path.join(CACHE_DIR, id);
  if (fs.existsSync(filePath)) return filePath;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return filePath;
}

async function getCachedContentInternal(content) {
  const filePath = path.join(CACHE_DIR, content.id);
  if (fs.existsSync(filePath)) return filePath;
  return cacheContent(content.url, content.id);
}

function deleteCachedContentInternal(contentId) {
  const filePath = path.join(CACHE_DIR, contentId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// 3) CONFIG
contextBridge.exposeInMainWorld("Config", {
  loadConfig: () => configFile.loadConfig(),
  saveConfig: (cfg) => configFile.saveConfig(cfg)
});

// 4) QR
contextBridge.exposeInMainWorld("QR", {
  Code: (pairingPayload) => QRCode.toDataURL(pairingPayload)
});


// 5) Supabase API
contextBridge.exposeInMainWorld("supabaseAPI", {
  getClient: () => supabase,


  setAuthToken: async (token) => {
		supabase = initSupabase(env.SUPABASE_LINK, env.ANON_KEY, token);
	
  },

 
  fetchDisplayInfo: async (displayId) => {
    return supabase.from("displays").select("*").eq("id", displayId).maybeSingle();
  },

  fetchScreensInfo: async (displayId) => {
    return supabase.from("display_screens").select("*").eq("display_id", displayId);
  },

  updateDisplayInfo: async (displayId, screen_count) => {
    const { error } = await supabase
      .from("displays")
      .update({ screen_count })
      .eq("id", displayId);
    return error;
  },

  fetchPlaylist: async (playlistId) => {
    return supabase.from("playlist_items")
      .select(`id, position, duration_seconds, playlist_id, expand_to_all_screens, is_sticky, contents:playlist_items_content_id_fkey(*)`)
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true });
  },

  // Fetch screens for a display
  fetchDisplayScreens: async (displayId) => {
    return supabase.from("display_screens")
      .select("*")
      .eq("display_id", displayId)
      .order("screen_index", { ascending: true });
  },

  // Fetch screens with their individual playlists
  fetchScreensWithPlaylists: async (displayId) => {
    return supabase.from("display_screens")
      .select(`*, playlists:playlist_id(id, name)`)
      .eq("display_id", displayId)
      .order("screen_index", { ascending: true });
  },

  InsertScreens: async (displayId, screenInfo) => {
    const { error } = await supabase
      .from("display_screens")
      .insert({
        display_id: displayId,
        hardware_id: screenInfo.hardware_id,
        width: screenInfo.width,
        height: screenInfo.height,
        is_primary: screenInfo.is_primary,
        resolution: screenInfo.resolution,
        orientation: screenInfo.orientation,
        windowindex: screenInfo.windowIndex
      });
    return { error };
  },

  updateHealth: async (displayId, payload) => {
    return supabase
      .from("display_health")
      .upsert({ 
        display_id: displayId, 
        ...payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'display_id' });
  },
  
  updateLastSeen: async (displayId) => {
	return supabase
		.from("displays")
		.update({ last_seen_at: new Date().toISOString() })
		.eq("id", displayId);
  },

  getSensors: async (displayId) => {
    return supabase
      .from("display_sensors")
      .select("*")
      .eq("display_id", displayId)
      .maybeSingle();
  },

  DeleteScreen: async (screenId) => {
    const { error } = await supabase
      .from("display_screens")
      .delete()
      .eq("id", screenId);
    return error;
  },
  
  getWallConfiguration: async (displayId) => {
    const { data, error } = await supabase.rpc("get_wall_configuration", {
      display_id: displayId
    });
    return { data, error };
   },

  getScenes: async (wallId) => {
    return supabase.from("scenes").select("*").eq("wall_id", wallId);
  },
  
  getSceneRegions: async (sceneId) => {
    return supabase.from("scene_regions").select("*").eq("scene_id", sceneId);
  },
  
  getCampaignsForDisplay: async (displayId) => {
          return supabase
                .from("campaigns")
                .select("*")
                .eq("display_id", displayId);
  },

  getCampaignPlaylists: async (campaignId) => {
    return supabase
      .from("campaign_playlists")
      .select("*")
      .eq("campaign_id", campaignId);
  },

  insertHealth: async (payload) => {
    return supabase
      .from("display_health")
      .insert(payload);
  },
  
  markCommandExecuted: async (commandId) => {
  return supabase
        .from("display_commands")
        .update({ executed: true, executed_at: new Date().ToISOString()})
        .eq("id", commandId);
 },


  Env: () => env,

  getCachedContent: (content) => getCachedContentInternal(content),
  deleteCachedContent: (contentId) => deleteCachedContentInternal(contentId)
});

// 6) REALTIME
contextBridge.exposeInMainWorld("SupaRT", {
  onDisplayRowChange: (displayId, callback) => {
    return supabase
      .channel(`display:${displayId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "displays", filter: `id=eq.${displayId}` },
        callback
      )
      .subscribe();
  },

  onScreenRowChange: (displayId, callback) => {
    return supabase
      .channel(`screen fro player:${displayId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "display_screens", filter: `display_id=eq.${displayId}` },
        callback
      )
      .subscribe();
  },

  onPlayListRowChange: (playlistId, callback) => {
    return supabase
      .channel(`playlist:${playlistId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "playlist_items", filter: `playlist_id=eq.${playlistId}` },
        callback
      )
      .subscribe();
  },

  listenCommands: (displayId, callback) => {
  return supabase
    .channel(`display_commands:${displayId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "display_commands", filter: `display_id=eq.${displayId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
        }

});

// 7) SYSTEM & EVENTS
contextBridge.exposeInMainWorld("System", {
  getDisplays: () => ipcRenderer.invoke("get-displays"),
  getMetrics: () => ipcRenderer.invoke("get-system-metrics"),
  setBrightness: (windowindex, level) => ipcRenderer.invoke("set-display-brightness", { windowindex, level }),
  setResolution: (hardware_id, width, height) => ipcRenderer.invoke("set-display-resolution", { hardware_id, width, height }),
  getCurrentDisplay: () => ipcRenderer.invoke("get-current-display")

});

contextBridge.exposeInMainWorld("SystemEvents", {
  onDisplayAdded: (cb) => ipcRenderer.on("display-added", (_, d) => cb(d)),
  onDisplayRemoved: (cb) => ipcRenderer.on("display-removed", (_, d) => cb(d)),
  onDisplayChanged: (cb) => ipcRenderer.on("display-changed", (_, payload) => cb(payload)),
  onTopologyChanged: (cb) => ipcRenderer.on("display-topology-changed", cb)
});

contextBridge.exposeInMainWorld("CursorAPI", {
  hideCursor: (displayId) => ipcRenderer.send("hide-cursor", displayId),
  showCursor: (displayId) => ipcRenderer.send("show-cursor", displayId)
});
