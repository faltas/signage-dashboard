import { PlayerState } from "../core/PlayerState.js";

export async function collectHealthMetrics(config) {
  const sysMetrics = await window.System.getMetrics();
  const displays = await window.System.getDisplays();
  
  return {
    display_id: config.displayId,
    mode: PlayerState.mode,
    playlist_id: PlayerState.displayInfo?.display?.playlist_id || null,
    version: window.PLAYER_VERSION || "1.1.0",
    cache_ok: true,
    cpu_usage: sysMetrics.cpu.percentUsage,
    memory_free: sysMetrics.memory.free,
    memory_total: sysMetrics.memory.total,
    temp_c: sysMetrics.temperature || 0,
    brightness: sysMetrics.brightness || 100,
    screen_info: JSON.stringify(displays),
    notes: `Platform: ${sysMetrics.platform} ${sysMetrics.arch}`
  };
}
