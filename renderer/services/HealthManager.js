// renderer/services/HealthManager.js - Modular Health Monitoring
import { logInfo, logError } from "../utils/logger.js";
import { collectHealthMetrics } from "./healthService.js";

export class HealthManager {
  constructor(env) {
    this.env = env;
    this.heartbeatInterval = null;
  }

  startHeartbeat(displayId) {
    const intervalMs = this.env.HEARBEAT_MS;

    const sendBeat = async () => {
      try {
        const health = await collectHealthMetrics(displayId);
        await window.supabaseAPI.updateHealth(displayId, health);
        logInfo("Heartbeat + Health updated");
      } catch (err) {
        logError("Error sending heartbeat:", err);
      }
    };

    sendBeat();
    this.heartbeatInterval = setInterval(sendBeat, intervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}