// renderer/core/PlayerEngine.js - Refactored Modular Architecture
import { PlayerState } from "./PlayerState.js";
import { logInfo, logError } from "../utils/logger.js";
import { PairingScreen, WaitingScreen, ErrorScreen } from "../render/components/ScreenComponents.js";
import { createVirtualCanvas } from "../render/VirtualCanvas.js";
import { startRenderLoop } from "../render/RenderEngine.js";
import { preloadAssets } from "../cache/preloader.js";
import { savePlaylistToCache, loadPlaylistFromCache } from "../offline/cacheService.js";
import { isOffline } from "../offline/offlineGuard.js";

// Service imports
import { DisplayManager } from "../services/DisplayManager.js";
import { PlaylistManager } from "../services/PlaylistManager.js";
import { HealthManager } from "../services/HealthManager.js";
import { CommandManager } from "../services/CommandManager.js";

export function createPlayerEngine(env, initialConfig, setPlayerContent) {
  // Initialize managers
  const displayManager = new DisplayManager(env, initialConfig);
  const playlistManager = new PlaylistManager();
  const healthManager = new HealthManager(env);
  const commandManager = new CommandManager();

  let config = { ...initialConfig };

  async function init() {
    try {
      PlayerState.setMode("boot");
      logInfo("PlayerEngine initialization started");

      // Step 1: Handle display registration and pairing
      const displaySetup = await setupDisplay();
      if (!displaySetup.success) return;

      // Step 2: Setup virtual canvas and wall configuration
      const canvasSetup = await setupCanvas(displaySetup.displayInfo);
      if (!canvasSetup.success) return;

      // Step 3: Start health monitoring and command listening
      startSystemServices();

      // Step 4: Load and render content
      await loadAndRenderContent();

      logInfo("PlayerEngine initialization complete");
    } catch (err) {
      logError("Critical error in PlayerEngine init:", err);
      PlayerState.setMode("error");
      setPlayerContent(ErrorScreen("Critical player error. Please restart."));
    }
  }

  async function setupDisplay() {
    try {
      // Register display if needed
      const regResult = await displayManager.registerIfNeeded();
      
      if (!regResult.displayId_Found) {
        PlayerState.setMode("pairing");
        const html = await PairingScreen(regResult.pairingCode);
        setPlayerContent(html);
        return { success: false };
      }

      config = regResult.config;

      // Get display info from backend
      const displayInfo = await displayManager.getDisplayInfo();
      PlayerState.setDisplayInfo(displayInfo);

      // Handle offline mode
      if (displayInfo?.offline === true) {
        logInfo("Starting in offline mode (no backend)");
        setupOfflineMode();
        await loadAndRenderContent();
        return { success: false };
      }

      // Handle invalid display
      if (!displayInfo.exists) {
        logInfo("Invalid displayId, resetting and reloading in 1s");
        setTimeout(() => location.reload(), 1000);
        return { success: false };
      }

      // Handle unpaired display
      if (displayInfo.unpaired) {
        PlayerState.setMode("pairing");
        const pairingCode = displayInfo.pairing_code || config.pairingCode;
        const html = await PairingScreen(pairingCode);
        setPlayerContent(html);
        return { success: false };
      }

      // Validate display data
      if (!displayInfo.display) {
        logError("Missing display data despite exists=true, unpaired=false");
        setPlayerContent(ErrorScreen("Display configuration error"));
        return { success: false };
      }

      // Sync screens
      await displayManager.syncScreens(displayInfo);
      displayManager.setupRealtimeEvents();

      return { success: true, displayInfo };
    } catch (err) {
      logError("Error in setupDisplay:", err);
      setPlayerContent(ErrorScreen("Display setup failed"));
      return { success: false };
    }
  }

  async function setupCanvas(displayInfo) {
    try {
      const display = displayInfo.display;
      const wallId = display.wall_id;

      if (!wallId) {
        logError("Display without associated wall (wall_id null)");
        setPlayerContent(WaitingScreen());
        return { success: false };
      }

      // Get wall configuration
      const mapping = await displayManager.getWallConfiguration(wallId);
      if (!mapping) {
        setPlayerContent(ErrorScreen("Wall configuration unavailable. Please configure in backend."));
        return { success: false };
      }

      // Store mapping in PlayerState
      PlayerState.wall = mapping.wall;
      PlayerState.screens = mapping.screens;
      PlayerState.mapping = mapping.mapping;

      // Create virtual canvas
      const wallConfig = {
        pixel_width: mapping.wall?.pixel_width || 1920,
        pixel_height: mapping.wall?.pixel_height || 1080
      };

      const canvas = createVirtualCanvas(wallConfig);
      document.body.appendChild(canvas);
      window.VirtualCanvas = canvas;

      return { success: true };
    } catch (err) {
      logError("Error in setupCanvas:", err);
      setPlayerContent(ErrorScreen("Canvas setup failed"));
      return { success: false };
    }
  }

  function startSystemServices() {
    try {
      // Start health monitoring
      healthManager.startHeartbeat(config.displayId);

      // Start command listener
      commandManager.startListener(config.displayId, {
        reloadPlaylist: loadAndRenderContent,
        forceScene: handleForceScene
      });

      logInfo("System services started");
    } catch (err) {
      logError("Error starting system services:", err);
    }
  }

  function setupOfflineMode() {
    if (!window.VirtualCanvas) {
      const root = document.getElementById("root");
      window.VirtualCanvas = root;
    }
    startBackendRetry();
  }

  function startBackendRetry() {
    setInterval(async () => {
      try {
        const info = await displayManager.getDisplayInfo();
        if (!info.offline) {
          logInfo("Backend back online, reloading player");
          location.reload();
        }
      } catch (err) {
        // Backend still offline, silent
      }
    }, 50000); // Every 50 seconds
  }

  async function loadAndRenderContent() {
    let playlist = null;
    const offline = isOffline();

    try {
      if (offline) {
        logInfo("Offline mode detected, loading from cache...");
        playlist = loadPlaylistFromCache();
      } else {
        playlist = await playlistManager.loadForDisplay(config.displayId);
        if (playlist) {
          savePlaylistToCache(playlist);
          logInfo("Playlist saved to cache for offline robustness");
        }
      }
    } catch (err) {
      logError("Error during playlist loading, attempting fallback to cache:", err);
      playlist = loadPlaylistFromCache();
    }

    if (!playlist || playlist.length === 0) {
      // Differenzia tra online senza playlist e offline senza cache
      if (offline) {
        logError("Offline mode: No cached content available");
        setPlayerContent(ErrorScreen("Offline - No Cache Content Available"));
        // Retry logic if no content at all
        setTimeout(() => loadAndRenderContent(), 30000);
      } else {
        logInfo("Online but no playlist assigned - showing waiting screen");
        setPlayerContent(WaitingScreen());
        // Retry more frequently when online waiting for content
        setTimeout(() => loadAndRenderContent(), 15000);
      }
      return;
    }

    try {
      await preloadAssets(playlist);
      PlayerState.setPlaylist(playlist);
      startRenderLoop(PlayerState, setPlayerContent);
    } catch (err) {
      logError("Error during asset preloading/rendering:", err);
      // Even if preloading fails partly, try to start render loop as fallback
      PlayerState.setPlaylist(playlist);
      startRenderLoop(PlayerState, setPlayerContent);
    }
  }

  async function handleForceScene(sceneId) {
    try {
      PlayerState.clearRenderTimeout();
      const html = `<div style="color:white;font-size:48px;">Scene ${sceneId}</div>`;
      setPlayerContent(html);
    } catch (err) {
      logError("Error forcing scene:", err);
    }
  }

  return {
    init,
    reloadPlaylist: loadAndRenderContent,
    forceScene: handleForceScene
  };
}