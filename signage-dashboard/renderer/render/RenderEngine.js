// renderer/render/RenderEngine.js - Optimized and Robust
import { ImageRenderer } from "./components/ImageRenderer.js";
import { VideoRenderer } from "./components/VideoRenderer.js";
import { getFitMode } from "./fitMode.js";
import { logInfo, logError } from "../utils/logger.js";
import { SceneRenderer } from "./SceneRenderer.js";
import { getCachedAsset } from "../cache/assetCache.js";

export function startRenderLoop(state, setPlayerContent, projectionMode = "contain") {
  let isRunning = false;

  async function loop() {
    if (isRunning) return;
    isRunning = true;

    try {
      if (!state.playlist || state.playlist.length === 0) {
        logError("No playlist available for rendering");
        isRunning = false;
        return;
      }

      const item = state.playlist[state.currentIndex];
      if (!item) {
        logError("Invalid item at index:", state.currentIndex);
        state.nextItem();
        isRunning = false;
        return loop();
      }

      const content = item.contents;
      if (!content) {
        logInfo("Item has no content, skipping to next");
        state.nextItem();
        isRunning = false;
        return loop();
      }

      logInfo("Rendering item:", item.id, "Type:", content.type);

      await renderContent(item, content, projectionMode, state);

      // Schedule next item
      const duration = (item.duration_seconds || 10) * 1000;
      state.renderTimeout = setTimeout(() => {
        state.nextItem();
        isRunning = false;
        loop();
      }, duration);

    } catch (err) {
      logError("Error in render loop:", err);
      state.nextItem();
      isRunning = false;
      setTimeout(() => loop(), 1000); // Retry after 1s
    }
  }

  async function renderContent(item, content, projectionMode, state) {
    const type = content.type?.toLowerCase();

    // Get local path for content
    let localPath;
    try {
      const cached = getCachedAsset(item.id);
      localPath = cached || await window.supabaseAPI.getCachedContent(content);
    } catch (err) {
      logError("Error loading content from cache:", err);
      throw err;
    }

    // Create new layer for smooth transition
    const oldLayer = window.VirtualCanvas.querySelector('.active-layer');
    const newLayer = document.createElement('div');
    newLayer.className = 'active-layer';
    newLayer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; transition:opacity 0.8s ease-in-out;';
    
    // Render based on content type
    try {
      if (type === "scene") {
        await renderScene(newLayer, content, state);
      } else if (type === "immagine" || type === "image") {
        const fit = getFitMode(type, content, projectionMode);
        newLayer.innerHTML = ImageRenderer(localPath, fit);
      } else if (type === "video") {
        const fit = getFitMode(type, content, projectionMode);
        newLayer.innerHTML = VideoRenderer(localPath, fit);
      } else {
        logError("Unknown content type:", type);
        throw new Error(`Unsupported content type: ${type}`);
      }
    } catch (err) {
      logError("Error rendering content:", err);
      throw err;
    }

    // Append and fade in
    window.VirtualCanvas.appendChild(newLayer);
    
    // Smooth cross-fade transition
    setTimeout(() => {
      newLayer.style.opacity = '1';
      if (oldLayer) {
        oldLayer.style.opacity = '0';
        setTimeout(() => oldLayer.remove(), 800);
      }
    }, 50);
  }

  async function renderScene(layer, content, state) {
    const sceneId = content.scene_id;
    const { data: scenes } = await window.supabaseAPI.getScenes(state.wall?.id);
    const scene = scenes?.find(s => s.id === sceneId);
    
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    const { data: regions } = await window.supabaseAPI.getSceneRegions(sceneId);
    layer.innerHTML = SceneRenderer(scene, regions, {});
  }

  // Start the loop
  loop();
}
