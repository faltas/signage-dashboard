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
const supabase = initSupabase(env.SUPABASE_LINK, env.ANON_KEY, null);

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
    supabase.rest.headers["x-player-token"] = token;
    supabase.realtime.headers["x-player-token"] = token;
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
      .select(`id, position, duration_seconds, playlist_id, expand_to_all_screens, contents:playlist_items_content_id_fkey(*)`)
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true });
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
        screen_index: screenInfo.screen_index,
        resolution: screenInfo.resolution,
        orientation: screenInfo.orientation
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
        .update({ executed: true })
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

  onPlayListDelete: (callback) => {
    return supabase
      .channel("playlist_items_delete")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "playlist_items" },
        callback
      )
      .subscribe();
  },
  
  listenCommands: (displayId, callback) => {
  return supabase
    .channel(`display_commands:${displayId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "display_commands", filter: `display_id=eq.${displayId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
        }

});

// 7) SYSTEM & EVENTS
contextBridge.exposeInMainWorld("System", {
  getDisplays: () => ipcRenderer.invoke("get-displays"),
  getMetrics: () => ipcRenderer.invoke("get-system-metrics"),
  setBrightness: (level) => ipcRenderer.invoke("set-display-brightness", level),
  setResolution: (width, height) => ipcRenderer.invoke("set-display-resolution", { width, height })
});

contextBridge.exposeInMainWorld("SystemEvents", {
  onDisplayAdded: (cb) => ipcRenderer.on("display-added", (_, d) => cb(d)),
  onDisplayRemoved: (cb) => ipcRenderer.on("display-removed", (_, d) => cb(d)),
  onDisplayChanged: (cb) => ipcRenderer.on("display-changed", (_, payload) => cb(payload)),
});