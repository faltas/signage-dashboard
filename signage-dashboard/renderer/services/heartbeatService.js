import { logInfo, logError } from "../utils/logger.js";
import { collectHealthMetrics } from "./healthService.js";

export function startHeartbeat(env, config) {
  const intervalMs = env.HEARBEAT_MS;

  const sendBeat = async () => {
    try {
      const health = await collectHealthMetrics(config);
      await window.supabaseAPI.updateHealth(config.displayId, health);
      logInfo("Heartbeat + Health upserted professionally");
    } catch (err) {
      logError("Errore heartbeat/health:", err);
    }
  };

  sendBeat();
  setInterval(sendBeat, intervalMs);
}
