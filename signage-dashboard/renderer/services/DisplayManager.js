// renderer/services/DisplayManager.js - Modular Display Management
import { logInfo, logError } from "../utils/logger.js";
import { syncScreens, setupRealtimeScreenEvents } from "./screenService.js";
import { computeScreenMapping } from "./mappingService.js";

export class DisplayManager {
  constructor(env, config) {
    this.env = env;
    this.config = config;
  }

  async registerIfNeeded() {
    if (this.config.displayId) {
      logInfo("Found DisplayId:", this.config.displayId, "skipping registration");
      return { displayId_Found: true, config: this.config };
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

      const newConfig = {
        ...this.config,
        displayId,
        pairingCode: pairing_code,
      };

      window.Config.saveConfig(newConfig);
      this.config = newConfig;

      return {
        displayId_Found: false,
        config: null,
        pairingCode: pairing_code,
        newDisplayId: displayId
      };
    } catch (err) {
      logError("Error during display registration:", err);
      throw err;
    }
  }

  async getDisplayInfo() {
    logInfo("Loading display configuration from cloud");

    let resp;
    try {
      resp = await fetch(this.env.DISPLAY_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId: this.config.displayId }),
      });
    } catch (err) {
      logError("Backend offline, entering offline mode:", err);
      return { offline: true };
    }

    if (!resp.ok) {
      logError("Error getting display-token:", await resp.text());
      this.config.displayId = null;
      window.Config.saveConfig(this.config);
      return { exists: false, unpaired: true, screen_count: 0 };
    }

    const { token } = await resp.json();
    logInfo("Received token from backend, initializing authenticated communication");
    await window.supabaseAPI.setAuthToken(token);

    logInfo("Requesting my configuration from cloud");
    const { data: display, error } = await window.supabaseAPI.fetchDisplayInfo(this.config.displayId);

    if (error || !display) {
      logError("Display not found for id:", this.config.displayId);
      this.config.displayId = null;
      window.Config.saveConfig(this.config);
      return { exists: false, unpaired: false, screen_count: 0, token };
    }

    if (display.pairing_code) {
      logInfo("Display exists but NOT associated, pairing_code:", display.pairing_code);
      return {
        exists: true,
        unpaired: true,
        screen_count: display.screen_count || 0,
        token,
        pairing_code: display.pairing_code
      };
    }

    return {
      exists: true,
      unpaired: false,
      screen_count: display.screen_count || 0,
      token,
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

  setupRealtimeEvents() {
    try {
      setupRealtimeScreenEvents(this.config);
    } catch (err) {
      logError("Error setting up realtime events:", err);
    }
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