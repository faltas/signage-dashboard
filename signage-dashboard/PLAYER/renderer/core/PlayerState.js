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
  
  // Multi-screen support
  screenPlaylists: {},   // { screenId: { items, currentIndex, ... } }
  extendedContents: [],  // IDs of contents that should span across all screens
  wall: null,            // wall configuration
  mapping: null,         // screen mapping

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
    // Extract extended contents from display info
    if (displayInfo?.extended_contents) {
      this.extendedContents = displayInfo.extended_contents;
    }
  },

  setScreens(screens) {
    this.screens = screens;
  },

  setCurrentScreen(screenId) {
    this.currentScreenId = screenId;
  },
  
  setScreenPlaylists(playlists) {
    this.screenPlaylists = playlists;
  },
  
  setExtendedContents(contentIds) {
    this.extendedContents = contentIds || [];
  },
  
  isContentExtended(contentId) {
    return this.extendedContents.includes(contentId);
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

