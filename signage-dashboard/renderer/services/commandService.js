import { logInfo } from "../utils/logger.js";

export function startCommandListener(config, engine) {
  window.supabaseAPI.listenCommands(config.displayId, async (cmd) => {
    logInfo("Comando remoto ricevuto:", cmd.type);

    if (cmd.type === "reload") {
      await engine.reloadPlaylistAndRender(config);
    }

    if (cmd.type === "restart") {
      location.reload();
    }

    if (cmd.type === "showScene") {
      const sceneId = cmd.payload?.scene_id;
      if (sceneId) {
        engine.forceScene(sceneId);
      }
    }

    if (cmd.type === "showMessage") {
      const msg = cmd.payload?.text || "";
      document.body.innerHTML = `<div style="color:white;font-size:48px;">${msg}</div>`;
    }

    if (cmd.type === "blackout") {
      document.body.innerHTML = `<div style="background:black;width:100vw;height:100vh;"></div>`;
    }

    if (cmd.type === "getHardwareStatus") {
      const metrics = await window.System.getMetrics();
      await window.supabaseAPI.updateHealth(config.displayId, {
        temp_c: metrics.temperature,
        brightness: metrics.brightness,
        last_query: new Date().toISOString()
      });
      logInfo("Hardware status sent to cloud on request");
    }

    if (cmd.type === "setBrightness") {
      const level = cmd.payload?.level || 100;
      await window.System.setBrightness(level);
      logInfo("Brightness set to:", level);
    }

    if (cmd.type === "setResolution") {
      const { width, height } = cmd.payload || {};
      if (width && height) {
        await window.System.setResolution(width, height);
        logInfo("Resolution set to:", width, "x", height);
      }
    }

    if (cmd.type === "instantAlert") {
      const alertMsg = cmd.payload?.message || "EMERGENCY ALERT";
      const duration = cmd.payload?.duration || 10000;
      
      const alertOverlay = document.createElement('div');
      alertOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(255, 0, 0, 0.9); color: white; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        font-size: 5rem; font-weight: bold; text-transform: uppercase;
        animation: blink 0.5s infinite alternate;
      `;
      alertOverlay.innerHTML = `
        <div style="text-align:center;">
          <div>⚠️ ATTENTION ⚠️</div>
          <div style="font-size:3rem; margin-top:20px;">${alertMsg}</div>
        </div>
        <style>@keyframes blink { from { opacity: 1; } to { opacity: 0.7; } }</style>
      `;
      document.body.appendChild(alertOverlay);
      setTimeout(() => alertOverlay.remove(), duration);
      logInfo("Killing Feature: Instant Emergency Alert triggered");
    }

    await window.supabaseAPI.markCommandExecuted(cmd.id);
  });
}
