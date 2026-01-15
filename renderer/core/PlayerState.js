// renderer/core/PlayerState.js
import { logInfo } from "../utils/logger.js";

export const PlayerState = {
  mode: "boot",          // "boot" | "pairing" | "waiting" | "playing" | "error"
  playlist: null,        // array di items (playlist_items + contents)
  displayInfo: null,     // info display dal backend
  screens: [],           // display_screens logici
  currentScreenId: null, // per futuro multi-display avanzato
  currentIndex: 0,
  renderTimeout: null,

  setMode(newMode) {
    logInfo(`[STATE] ${this.mode} → ${newMode}`);
    this.mode = newMode;
  },

  setPlaylist(playlistItems) {
    this.playlist = playlistItems;
    this.currentIndex = 0;
  },

  setDisplayInfo(displayInfo) {
    this.displayInfo = displayInfo;
  },

  setScreens(screens) {
    this.screens = screens;
  },

  setCurrentScreen(screenId) {
    this.currentScreenId = screenId;
  },

  clearRenderTimeout() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
  },

  nextItem() {
    if (!this.playlist || this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
  }
};
