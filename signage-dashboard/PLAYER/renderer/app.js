// renderer/app.js - Clean and Modular Entry Point
import { createPlayerEngine } from "./core/PlayerEngine.js";
import { logInfo, logError } from "./utils/logger.js";
import { applyScreenMask } from "./render/applyScreenMask.js";
import { onOffline, onOnline } from "./offline/offlineGuard.js";

window.PLAYER_VERSION = "1.0.0";

// Setup offline/online handlers
onOffline(() => {
  logInfo("OFFLINE MODE ACTIVATED");
});

onOnline(() => {
  logInfo("ONLINE MODE ACTIVATED");
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const root = document.getElementById("root");

    if (!root) {
      logError("Fatal: root element not found in DOM");
      return;
    }

    // Initialize VirtualCanvas
    window.VirtualCanvas = root;

    const setPlayerContent = (html) => {
      if (!root) return;
      root.innerHTML = html;
    };

    // Load configuration
    const env = window.supabaseAPI.Env();
    const config = window.Config.loadConfig();

    logInfo("Environment:", env);
    logInfo("Configuration:", config);

    // Create and initialize player engine
    const engine = createPlayerEngine(env, setPlayerContent);
    await engine.init();

    // Apply screen mask to primary display
    setupScreenMask();

  } catch (err) {
    logError("Fatal error in app initialization:", err);
    document.body.innerHTML = `
      <div style="background:#0a0a0a;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
        <div style="text-align:center;">
          <h1 style="font-size:24px;margin-bottom:20px;color:#ff6b6b;">Initialization Error</h1>
          <p style="color:#888;">Please restart the application</p>
        </div>
      </div>
    `;
  }
});

async function setupScreenMask() {
  try {
    const displays = await window.System.getDisplays();
    
    // Calculate total bounds to cover all displays
    const minX = Math.min(...displays.map(d => d.x));
    const minY = Math.min(...displays.map(d => d.y));
    const maxX = Math.max(...displays.map(d => d.x + d.width));
    const maxY = Math.max(...displays.map(d => d.y + d.height));

    applyScreenMask({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  } catch (err) {
    logError("Error setting up screen mask:", err);
  }
}
