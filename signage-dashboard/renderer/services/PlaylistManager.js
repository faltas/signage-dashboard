// renderer/services/PlaylistManager.js - Modular Playlist Management
import { logInfo, logError } from "../utils/logger.js";
import { loadPlaylistForDisplay } from "./playlistService.js";

export class PlaylistManager {
  constructor() {
    this.currentPlaylist = null;
  }

  async loadForDisplay(displayId) {
    try {
      const playlist = await loadPlaylistForDisplay(displayId);
      this.currentPlaylist = playlist;
      return playlist;
    } catch (err) {
      logError("Error loading playlist:", err);
      throw err;
    }
  }

  getCurrentPlaylist() {
    return this.currentPlaylist;
  }

  clearPlaylist() {
    this.currentPlaylist = null;
  }
}