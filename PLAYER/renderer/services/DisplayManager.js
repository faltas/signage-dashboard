// renderer/services/DisplayManager.js - Complete Real-time Events
import { logInfo, logError } from "../utils/logger.js";
import { syncScreens } from "./screenService.js";
import { computeScreenMapping } from "./mappingService.js";

export class DisplayManager {
  constructor(env) {
    this.env = env;

    this.config = null;
    this.realtimeChannels = [];
  }

  async registerIfNeeded() {
          
    this.config = window.Config.loadConfig();

    if (this.config.displayId) {
      logInfo("Found DisplayId:", this.config.displayId, "skipping registration");
      return {displayId_Found: true};
    }

    logInfo("DisplayId is null → requesting registration from backend");

    try {
      const resp = await fetch(this.env.REGISTER_DISPLAY_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceInfo: {} })
      });

      if (!resp.ok) {
        throw new Error("Failed to register display");
      }

      const { displayId, pairing_code } = await resp.json();
      logInfo("Registered with backend, displayID:", displayId, "pairing code:", pairing_code);

      this.config.displayId = displayId;
          this.config.pairingCode = pairing_code;

      window.Config.saveConfig(this.config);

      return { config: this.config};
          
    } catch (err) {
      logError("Error during display registration:", err);
      throw err;
    }
  }

  async getDisplayInfo() {
        this.config = window.Config.loadConfig();
        
    logInfo("Requesting my configuration from cloud");
    const { data: display, error } = await window.supabaseAPI.fetchDisplayInfo(this.config.displayId);

    if (error || !display) {
      logError("Display not found for id:", this.config.displayId);
      this.config.displayId = null;
      window.Config.saveConfig(this.config);
      return { exists: false, unpaired: false, screen_count: 0 };
    }

    if (display.pairing_code) {
      logInfo("Display exists but NOT associated, pairing_code:", display.pairing_code);
      return {
        exists: true,
        unpaired: true,
        screen_count: display.screen_count || 0,
        pairing_code: display.pairing_code,
                display
      };
    }

    return {
      exists: true,
      unpaired: false,
      screen_count: display.screen_count || 0,
      display
    };
  }

  async syncScreens(displayInfo) {
    try {
      await syncScreens(this.config, displayInfo);
    } catch (err) {
      logError("Error syncing screens:", err);
      throw err;
    }
  }
  

  async ScreenRealTime(displayInfo) {
    let pending = false;
    let lastRun = 0;
    const DEBOUNCE_MS = 1000;
  
    const runSync = async () => {
      const now = Date.now();
      if (pending && now - lastRun < DEBOUNCE_MS) return;
      pending = true;
      lastRun = now;
  
      try {
        logInfo("Topologia schermi cambiata → syncScreens() debounced");
        window.dispatchEvent(new Event("resize"));
        await this.syncScreens(displayInfo);
      } catch (err) {
        logError("Errore in ScreenRealTime sync:", err);
      } finally {
        pending = false;
      }
    };
  
    await window.SystemEvents.onTopologyChanged(runSync);
  }
  

  /**
   * Setup complete real-time event listeners
   * @param {Object} callbacks - Callbacks for different events
   *   - onPaired: Called when display gets paired
   *   - onScreenPlaylistChanged: Called when playlist_id changes
   *   - OnScreenChange: Called when 
   *   - onPlaylistItemsChanged: Called when playlist items change
   *   - onCommandReceived: Called when remote command received
   */
  async setupRealtimeEvents(callbacks = {}) {
    try {
      const displayId = this.config.displayId;
      
      logInfo("Setting up complete real-time events for display:", displayId);

      // 1. Listen to display row changes (pairing, playlist assignment, etc.)
      const displayChannel = window.SupaRT.onDisplayRowChange(displayId, (payload) => {
        logInfo("Display row changed:", payload);
        
        const newRecord = payload.new;
        const oldRecord = payload.old;

        // Check if display got paired (pairing_code removed, user_id set)
        if (!newRecord?.pairing_code != oldRecord?.paring_code && newRecord?.user_id != oldRecord?.user_id) {
          logInfo(" Display has been PAIRED! User ID:", newRecord.user_id);
          if (callbacks.onPaired)
            callbacks.onPaired(newRecord);
        }
		
	
        if (oldRecord?.status !== newRecord?.status) {
          logInfo("Status changed:", oldRecord?.status, "→", newRecord?.status);
        }
      });
      this.realtimeChannels.push(displayChannel);

      // 2. Listen to screen-specific playlist changes
      const screensChannel = window.SupaRT.onScreenRowChange(displayId, async (payload) => {
        logInfo("Screen record changed:", payload.eventType, payload);
        const newScreen = payload.new;
        const oldScreen = payload.old;

        if (payload.eventType === 'UPDATE') {
          if (newScreen.playlist_id !== oldScreen.playlist_id) {
            logInfo(`Playlist change for screen ${newScreen.screen_index}`);
            if (callbacks.onScreenPlaylistChanged) {
              callbacks.onScreenPlaylistChanged(newScreen.id, newScreen.playlist_id);
            }
          } 
          else if (newScreen?.brightness != oldScreen?.brightness) {
            await window.System.setBrightness(newScreen.windowindex, newScreen.brightness);
          } 
        } 
        
        else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          if (callbacks.onScreensUpdated) 
            callbacks.onScreensUpdated();
        }
      });
      this.realtimeChannels.push(screensChannel);


      logInfo("✅ Real-time events setup complete");
      
    } catch (err) {
      logError("Error setting up realtime events:", err);
    }
  }
  
  setupPlaylistItemsListener(playlistId, callbacks = {}) {
    if (!playlistId) return;

    logInfo("Setting up playlist items listener for:", playlistId);

    // Unico listener: qualsiasi UPDATE/INSERT/DELETE → reload playlist
    const playlistChannel = window.SupaRT.onPlayListRowChange(playlistId, (payload) => {
      logInfo("Playlist items changed:", payload);

      if (callbacks.onPlaylistItemsChanged) {
        callbacks.onPlaylistItemsChanged(playlistId, payload);
      } else if (callbacks.reloadPlaylist) {
        setTimeout(() => callbacks.reloadPlaylist(), 500);
      } else {
        setTimeout(() => location.reload(), 500);
      }
    });

    this.realtimeChannels.push(playlistChannel);
  }


  /**
   * Cleanup all real-time subscriptions
   */
  cleanupRealtimeEvents() {
    logInfo("Cleaning up real-time subscriptions...");
    this.realtimeChannels.forEach(channel => {
      try {
        channel.unsubscribe();
      } catch (err) {
        logError("Error unsubscribing channel:", err);
      }
    });
    this.realtimeChannels = [];
  }
  async getWallConfiguration(wallId) {
    try {
      return await computeScreenMapping(wallId);
    } catch (err) {
      logError("Error getting wall configuration:", err);
      return null;
    }
  }
}