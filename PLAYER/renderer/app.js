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
	
	const currentDisplay = await window.System.getCurrentDisplay(); 
	logInfo("Current physical display:", currentDisplay)

    // Create and initialize player engine
    const engine = createPlayerEngine(env, setPlayerContent, currentDisplay);
    await engine.init();


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

