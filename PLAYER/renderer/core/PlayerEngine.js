// renderer/core/PlayerEngine.js - Multi-monitor Corrected Version
import { PlayerState } from "./PlayerState.js";
import { logInfo, logError } from "../utils/logger.js";
import { PairingScreen, WaitingScreen, ErrorScreen } from "../render/components/ScreenComponents.js";
import { createVirtualCanvas } from "../render/VirtualCanvas.js";
import { startRenderLoop } from "../render/RenderEngine.js";
import { preloadAssets } from "../cache/preloader.js";
import { savePlaylistToCache, loadPlaylistFromCache } from "../offline/cacheService.js";
import { isOffline } from "../offline/offlineGuard.js";

// Services
import { DisplayManager } from "../services/DisplayManager.js";
import { PlaylistManager } from "../services/PlaylistManager.js";
import { HealthManager } from "../services/HealthManager.js";
import { CommandManager } from "../services/CommandManager.js";
import { TokenManager } from "../services/TokenManager.js";

export function createPlayerEngine(env, setPlayerContent, currentDisplay) {
  const physicalDisplay = currentDisplay; // monitor fisico di QUESTA finestra
  let config = window.Config.loadConfig();

  const displayManager = new DisplayManager(env, config);
  const playlistManager = new PlaylistManager();
  const healthManager = new HealthManager(env);
  const commandManager = new CommandManager();
  const tokenManager = new TokenManager(env);

  // -------------------------------------------------------------
  // INIT
  // -------------------------------------------------------------
  async function init() {
    try {
      PlayerState.setMode("boot");
      logInfo("PlayerEngine initialization started");

      const displaySetup = await setupDisplay();
      if (!displaySetup.success) return;

      const displayInfo = displaySetup.displayInfo.display;

      if (displayInfo.wall_id) {
        const canvasSetup = await setupCanvas(displaySetup.displayInfo);
        if (!canvasSetup.success) return;
      }

      startSystemServices();
      await loadAndRenderContent();

      logInfo("PlayerEngine initialization complete");
    } catch (err) {
      logError("Critical error in PlayerEngine init:", err);
      PlayerState.setMode("error");
      setPlayerContent(ErrorScreen("Critical player error. Please restart."));
    }
  }

  async function InitSupabaseAuth(displayId) {
    const token = await tokenManager.getToken(displayId);
    await window.supabaseAPI.setAuthToken(token);
  }

  // -------------------------------------------------------------
  // DISPLAY SETUP
  // -------------------------------------------------------------
  async function setupDisplay() {
    try {
      const regResult = await displayManager.registerIfNeeded();
      if (!regResult.displayId_Found) config = regResult.config;

      await InitSupabaseAuth(config.displayId);

      const displayInfo = await displayManager.getDisplayInfo();
      PlayerState.setDisplayInfo(displayInfo);

      if (displayInfo?.offline === true) {
        setupOfflineMode();
        await loadAndRenderContent();
        return { success: false };
      }

      if (!displayInfo.exists) {
        setTimeout(() => location.reload(), 1000);
        return { success: false };
      }

      if (displayInfo.unpaired) {
        PlayerState.setMode("pairing");
        displayManager.setupRealtimeEvents({
          onPaired: () => setTimeout(() => location.reload(), 1000)
        });
        const pairingCode = displayInfo.pairing_code || config.pairingCode;
        setPlayerContent(await PairingScreen(pairingCode));
        return { success: false };
      }

      if (!displayInfo.display) {
        setPlayerContent(ErrorScreen("Display configuration error"));
        return { success: false };
      }

      await displayManager.syncScreens(displayInfo);

      const { data: initialScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
      PlayerState.setScreens(initialScreens);

      // -------------------------------------------------------------
      // MAPPA MONITOR FISICO → SCREEN LOGICO SUPABASE
      // -------------------------------------------------------------
      if (physicalDisplay) {
        const myScreen = (initialScreens || []).find(
          s => Number(s.hardware_id) === Number(physicalDisplay.id)
        );

        if (myScreen) {
          PlayerState.setCurrentScreen(myScreen.id);
          logInfo("Mapped physical display to logical screen:", {
            physicalId: physicalDisplay.id,
            logicalScreenId: myScreen.id
          });
        } else {
          logError("No logical screen mapped for this physical display", physicalDisplay.id);
        }
      }

      // -------------------------------------------------------------
      // REALTIME EVENTS
      // -------------------------------------------------------------
      displayManager.setupRealtimeEvents({
        onScreenPlaylistChanged: async (screenId, playlistId) => {
          logInfo(`Real-time playlist change: ${screenId} -> ${playlistId}`);

          const oldScreenPlaylist = PlayerState.screenPlaylists?.[screenId];

          if (!playlistId) {
            await cleanupScreenCache(oldScreenPlaylist);
            PlayerState.updateScreenPlaylist(screenId, null, []);
            startRenderLoop(PlayerState, setPlayerContent);
            return;
          }

          const { data: items, error } = await window.supabaseAPI.fetchPlaylist(playlistId);
          if (error) return;

          const processedItems = (items || []).map(item => ({
            ...item,
            syncEnabled: PlayerState.isContentExtended(item.content_id)
          }));

          await cleanupScreenCache(oldScreenPlaylist, processedItems);

          await preloadAssets(
            { screenPlaylists: { [screenId]: { playlistId, items: processedItems } } },
            screenId
          );

          PlayerState.updateScreenPlaylist(screenId, playlistId, processedItems);
          startRenderLoop(PlayerState, setPlayerContent);

          displayManager.setupPlaylistItemsListener(playlistId, {
            onPlaylistItemsChanged: async () => {
              await reloadPlaylistForScreensUsing(playlistId);
            }
          });
        },

        onScreensUpdated: async () => {
          const { data: freshScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
          PlayerState.setScreens(freshScreens);
          await loadAndRenderContent();
        },

        reloadPlaylist: loadAndRenderContent
      });

      return { success: true, displayInfo };
    } catch (err) {
      logError("Error in setupDisplay:", err);
      setPlayerContent(ErrorScreen("Display setup failed"));
      return { success: false };
    }
  }

  // -------------------------------------------------------------
  // CANVAS / WALL
  // -------------------------------------------------------------
  async function setupCanvas(displayInfo) {
    try {
      const display = displayInfo.display;
      const wallId = display.wall_id;

      if (!wallId) {
        setPlayerContent(WaitingScreen());
        return { success: false };
      }

      const mapping = await displayManager.getWallConfiguration(wallId);
      if (!mapping) {
        setPlayerContent(ErrorScreen("Wall configuration unavailable."));
        return { success: false };
      }

      PlayerState.wall = mapping.wall;
      PlayerState.screens = mapping.screens;
      PlayerState.mapping = mapping.mapping;

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

  // -------------------------------------------------------------
  // SYSTEM SERVICES
  // -------------------------------------------------------------
  function startSystemServices() {
    try {
      healthManager.startHeartbeat(config.displayId);

      commandManager.startListener(config.displayId, {
        reloadPlaylist: loadAndRenderContent,
        forceScene: handleForceScene
      });
    } catch (err) {
      logError("Error starting system services:", err);
    }
  }

  // -------------------------------------------------------------
  // OFFLINE MODE
  // -------------------------------------------------------------
  function setupOfflineMode() {
    if (!window.VirtualCanvas) {
      window.VirtualCanvas = document.getElementById("root");
    }
    startBackendRetry();
  }

  function startBackendRetry() {
    setInterval(async () => {
      try {
        const info = await displayManager.getDisplayInfo();
        if (!info.offline) location.reload();
      } catch {}
    }, 50000);
  }

  // -------------------------------------------------------------
  // PLAYLIST LOADING + RENDERING
  // -------------------------------------------------------------
  async function loadAndRenderContent() {
    let playlist = null;
    const offline = isOffline();

    try {
      if (offline) {
        playlist = loadPlaylistFromCache();
      } else {
        const { data: displayData } = await window.supabaseAPI.fetchDisplayInfo(config.displayId);
        if (displayData?.extended_contents) {
          PlayerState.setExtendedContents(displayData.extended_contents);
        }

        const { data: freshScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
        if (freshScreens) PlayerState.setScreens(freshScreens);

        playlist = await playlistManager.loadForDisplay(config.displayId, PlayerState.screens);

        if (playlist) savePlaylistToCache(playlist);
      }
    } catch {
      playlist = loadPlaylistFromCache();
    }

    if (!playlist || Object.keys(playlist.screenPlaylists || {}).length === 0) {
      setPlayerContent(offline ? ErrorScreen("Offline - No Cache Content Available") : WaitingScreen());
      setTimeout(() => loadAndRenderContent(), offline ? 30000 : 15000);
      return;
    }

    try {
      const screenIds = Object.keys(playlist.screenPlaylists || {});
      const myScreenId = PlayerState.currentScreenId;

      const targetScreenIds = myScreenId
        ? screenIds.filter(id => String(id) === String(myScreenId))
        : screenIds;

      if (targetScreenIds.length === 0) {
        setPlayerContent(WaitingScreen());
        return;
      }

      // -------------------------------------------------------------
      // 🔥 RIMUOVI TUTTI GLI SCREEN NON APPARTENENTI A QUESTA FINESTRA
      // -------------------------------------------------------------
      if (myScreenId) {
        Object.keys(PlayerState.screenPlaylists).forEach(id => {
          if (String(id) !== String(myScreenId)) {
            delete PlayerState.screenPlaylists[id];
          }
        });
      }

      // Preload + state update
      for (const screenId of targetScreenIds) {
        const screenPlaylist = playlist.screenPlaylists[screenId];
        if (!screenPlaylist?.items?.length) continue;

        await preloadAssets(playlist, screenId);
        PlayerState.screenPlaylists[screenId] = screenPlaylist;
      }

      // Playlist item listeners
      for (const screenId of targetScreenIds) {
        const playlistId = playlist.screenPlaylists[screenId].playlistId;

        displayManager.setupPlaylistItemsListener(playlistId, {
          onPlaylistItemsChanged: async () => {
            await reloadPlaylistForScreensUsing(playlistId);
          }
        });
      }

      startRenderLoop(PlayerState, setPlayerContent);
    } catch (err) {
      logError("Error during multi-screen rendering:", err);
    }
  }

  // -------------------------------------------------------------
  // PLAYLIST RELOAD HELPERS
  // -------------------------------------------------------------
  async function reloadPlaylistForScreensUsing(playlistId) {
    try {
      const screens = PlayerState.screens || [];
      const affectedScreenIds = screens
        .map(s => s.id)
        .filter(id => {
          const sp = PlayerState.screenPlaylists?.[id];
          return sp && sp.playlistId === playlistId;
        });

      if (!affectedScreenIds.length) return;

      const { data: items } = await window.supabaseAPI.fetchPlaylist(playlistId);
      const processedItems = (items || []).map(item => ({
        ...item,
        syncEnabled: PlayerState.isContentExtended(item.content_id)
      }));

      for (const screenId of affectedScreenIds) {
        const oldScreenPlaylist = PlayerState.screenPlaylists?.[screenId];

        await cleanupScreenCache(oldScreenPlaylist, processedItems);

        await preloadAssets(
          { screenPlaylists: { [screenId]: { playlistId, items: processedItems } } },
          screenId
        );

        PlayerState.updateScreenPlaylist(screenId, playlistId, processedItems);
      }

      startRenderLoop(PlayerState, setPlayerContent);
    } catch (err) {
      logError("Error in reloadPlaylistForScreensUsing:", err);
    }
  }

  async function cleanupScreenCache(oldScreenPlaylist, newItems) {
    if (!oldScreenPlaylist?.items) return;

    try {
      const oldIds = oldScreenPlaylist.items.map(it => it.contents?.id).filter(Boolean);
      const newIds = (newItems || []).map(it => it.contents?.id).filter(Boolean);

      const toDelete = oldIds.filter(id => !newIds.includes(id));

      for (const contentId of toDelete) {
        try {
          if (window.supabaseAPI.deleteCachedContent) {
            await window.supabaseAPI.deleteCachedContent(contentId);
          }
        } catch (err) {
          logError("Error deleting cached content for", contentId, err);
        }
      }
    } catch (err) {
      logError("Error in cleanupScreenCache:", err);
    }
  }

  // -------------------------------------------------------------
  // COMMANDS
  // -------------------------------------------------------------
  async function handleForceScene(sceneId) {
    try {
      PlayerState.clearRenderTimeout();
      setPlayerContent(`<div style="color:white;font-size:48px;">Scene ${sceneId}</div>`);
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
