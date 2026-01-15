import { logInfo, logError } from "../utils/logger.js";
import { getActiveCampaignForDisplay } from "./schedulingService.js";

export async function loadPlaylistForDisplay(displayId) {
  try {
    // 1) Prima prova a ottenere la campagna attiva (scheduling)
    const active = await getActiveCampaignForDisplay(displayId);

    let playlistId = null;

    if (active && active.playlistId) {
      // Campagna attiva trovata con playlist
      logInfo("Active campaign found with playlist:", active.playlistId);
      playlistId = active.playlistId;
    } else {
      // 2) Nessuna campagna attiva - cerca la playlist assegnata direttamente al display
      logInfo("No active campaign, checking for direct playlist assignment...");
      
      const { data: display, error } = await window.supabaseAPI.fetchDisplayInfo(displayId);
      
      if (error) {
        logError("Error fetching display info:", error);
        return null;
      }
      
      if (display && display.playlist_id) {
        logInfo("Direct playlist found on display:", display.playlist_id);
        playlistId = display.playlist_id;
      } else {
        logInfo("No playlist assigned to display:", displayId);
        return null;
      }
    }

    // 3) Carica la playlist
    const { data, error } = await window.supabaseAPI.fetchPlaylist(playlistId);
    if (error) {
      logError("Error loading playlist:", error);
      return null;
    }

    const items = Array.isArray(data) ? data : [];

    if (items.length === 0) {
      logInfo("Playlist is empty:", playlistId);
      return null;
    }

    return items;
  } catch (err) {
    logError("Exception in loadPlaylistForDisplay:", err);
    return null;
  }
}
