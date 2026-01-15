// renderer/render/RenderEngine.js - Clean, Robust & Synchronized
import { ImageRenderer } from "./components/ImageRenderer.js";
import { VideoRenderer } from "./components/VideoRenderer.js";
import { logInfo, logError } from "../utils/logger.js";
import { SceneRenderer } from "./SceneRenderer.js";
import { getCachedAsset } from "../cache/assetCache.js";
import { WaitingScreen } from "./components/ScreenComponents.js";

// Registry dei loop per screen: { timerId, cancelled }
const screenLoops = new Map();

/**
 * Starts the rendering process for all screens managed by the player state.
 */
export function startRenderLoop(state, setPlayerContent) {
  state.clearRenderTimeout();

  const myScreenId = state.currentScreenId;
  const screens = state.screens || [];
  const screenPlaylists = state.screenPlaylists || {};

  // Se questa finestra ha uno screen specifico → usa solo quello
  const targetScreens = myScreenId
    ? screens.filter(s => String(s.id) === String(myScreenId))
    : screens;

  targetScreens.forEach(screen => {
    const playlistData = screenPlaylists[screen.id];
    const container = getOrCreateScreenContainer(screen);

    if (!playlistData?.items?.length) {
      logInfo(`Screen ${screen.screen_index}: No playlist. Showing WaitingScreen.`);
      container.innerHTML = WaitingScreen();
      stopScreenLoop(screen.id);
      return;
    }

    startIndependentLoop(screen, container, state);
  });
}

/**
 * Ensures a container exists for the given screen on the VirtualCanvas.
 */
function getOrCreateScreenContainer(screen) {
  const id = `screen-container-${screen.id}`;
  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement("div");
    container.id = id;
    container.className = "screen-container";
    container.style.cssText = `
      position: absolute;
      left: ${screen.viewport_x || 0}px;
      top: ${screen.viewport_y || 0}px;
      width: ${screen.viewport_width || screen.width}px;
      height: ${screen.viewport_height || screen.height}px;
      overflow: hidden;
      background: #000;
    `;
    window.VirtualCanvas.appendChild(container);
  }
  return container;
}

/**
 * Stoppa il loop di uno screen, se esiste.
 */
function stopScreenLoop(screenId) {
  const loop = screenLoops.get(screenId);
  if (!loop) return;
  loop.cancelled = true;
  if (loop.timerId) clearTimeout(loop.timerId);
  screenLoops.delete(screenId);
}

/**
 * Manages an independent, synchronized render loop for a specific screen.
 * Usa sempre lo stato corrente (state.screenPlaylists) per evitare reference vecchi.
 */
function startIndependentLoop(screen, container, state) {
  // fermiamo eventuale loop precedente
  stopScreenLoop(screen.id);

  const loopState = { cancelled: false, timerId: null };
  screenLoops.set(screen.id, loopState);

  async function loop() {
    if (loopState.cancelled) return;

    try {
      const screenPlaylists = state.screenPlaylists || {};
      const playlistData = screenPlaylists[screen.id];

      if (!playlistData?.items?.length) {
        container.innerHTML = WaitingScreen();
        return;
      }

      const { items } = playlistData;

      // Time-based synchronization logic
      const totalDuration =
        items.reduce((acc, item) => acc + (item.duration_seconds || 10), 0) * 1000;
      const now = Date.now();
      const timeInCycle = now % totalDuration;

      let elapsed = 0;
      let currentIndex = 0;

      for (let i = 0; i < items.length; i++) {
        const itemDuration = (items[i].duration_seconds || 10) * 1000;
        if (timeInCycle >= elapsed && timeInCycle < elapsed + itemDuration) {
          currentIndex = i;
          break;
        }
        elapsed += itemDuration;
      }

      const item = items[currentIndex];
      if (item?.contents) {
        await renderToContainer(container, item, item.contents, screen, state);
      }

      if (item.is_sticky) {
        // sticky: non avanzare automaticamente, mantieni il contenuto
        return;
      }

      const itemDuration = (item.duration_seconds || 10) * 1000;
      const remainingTime = itemDuration - (timeInCycle - elapsed);

      loopState.timerId = setTimeout(() => {
        if (!loopState.cancelled) loop();
      }, Math.max(50, remainingTime));
    } catch (err) {
      logError(`Screen ${screen.screen_index} Loop Error:`, err);
      loopState.timerId = setTimeout(() => {
        if (!loopState.cancelled) loop();
      }, 2000);
    }
  }

  loop();
}

/**
 * Renders a specific content item into a screen's container with smooth transitions.
 */
async function renderToContainer(container, item, content, screen, state) {
  const type = content.type?.toLowerCase();
  const isExtended = item.expand_to_all_screens || state.isContentExtended(content.id);

  const localPath = await getAssetPath(item, content);
  if (!localPath) return;

  const oldLayer = container.querySelector(".active-layer");
  const newLayer = createLayer();

  try {
    if (type === "scene") {
      await renderScene(newLayer, content, state);
    } else if (type === "immagine" || type === "image") {
      newLayer.innerHTML = ImageRenderer(localPath, isExtended ? "cover" : "contain");
    } else if (type === "video") {
      newLayer.innerHTML = VideoRenderer(localPath, isExtended ? "cover" : "contain");
    }

    // se è la prima volta che metti contenuto, pulisci eventuale WaitingScreen
    if (!oldLayer && container.innerHTML.trim()) {
      container.innerHTML = "";
    }

    container.appendChild(newLayer);
    transitionLayers(newLayer, oldLayer);
  } catch (err) {
    logError("Rendering Error:", err);
  }
}

async function getAssetPath(item, content) {
  try {
    return getCachedAsset(item.id) || (await window.supabaseAPI.getCachedContent(content));
  } catch (err) {
    logError("Asset Loading Error:", err);
    return null;
  }
}

function createLayer() {
  const layer = document.createElement("div");
  layer.className = "active-layer";
  layer.style.cssText =
    "position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; transition:opacity 0.8s ease-in-out;";
  return layer;
}

function transitionLayers(newLayer, oldLayer) {
  requestAnimationFrame(() => {
    newLayer.style.opacity = "1";
    if (oldLayer) {
      oldLayer.style.opacity = "0";
      setTimeout(() => oldLayer.remove(), 800);
    }
  });
}

async function renderScene(layer, content, state) {
  const sceneId = content.scene_id;
  const { data: scenes } = await window.supabaseAPI.getScenes(state.wall?.id);
  const scene = scenes?.find(s => s.id === sceneId);

  if (!scene) throw new Error(`Scene ${sceneId} not found`);

  const { data: regions } = await window.supabaseAPI.getSceneRegions(sceneId);
  layer.innerHTML = SceneRenderer(scene, regions, {});


}
