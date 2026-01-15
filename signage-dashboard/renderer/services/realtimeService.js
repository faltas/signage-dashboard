// renderer/services/realtimeService.js
import { logInfo } from "../utils/logger.js";

export function subscribeDisplayChanges(displayId, onChange) {
  logInfo("Sottoscrivo realtime display:", displayId);
  return window.SupaRT.onDisplayRowChange(displayId, onChange);
}

export function subscribePlaylistChanges(playlistId, onChange) {
  logInfo("Sottoscrivo realtime playlist:", playlistId);
  return window.SupaRT.onPlayListRowChange(playlistId, onChange);
}

