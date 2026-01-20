// renderer/core/ScreenRenderController.js
import { logError, logInfo } from "../utils/logger.js";

export class ScreenRenderController {
  constructor(screenId, renderFn, getPlaylistFn) {
    this.screenId = screenId;
    this.renderFn = renderFn;           // (item, playlistContext) => Promise<void>
    this.getPlaylistFn = getPlaylistFn; // () => { items: [...] } | null

    this.currentIndex = 0;
    this.timer = null;
    this.lock = false;
  }

  start() {
    if (this.timer) return;
    logInfo(`ScreenRenderController start for screen ${this.screenId}`);
    this.scheduleNext(0);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  scheduleNext(delayMs) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.tick(), delayMs);
  }

  async tick() {
    if (this.lock) return;
    this.lock = true;

    try {
      const playlist = this.getPlaylistFn();
      if (!playlist || !playlist.items || playlist.items.length === 0) {
        // Nessun contenuto → puoi lasciare la tua WaitingScreen
        this.lock = false;
        this.scheduleNext(1000);
        return;
      }

      if (this.currentIndex >= playlist.items.length) {
        this.currentIndex = 0;
      }

      const item = playlist.items[this.currentIndex];
      const durationMs = (item.duration || 10) * 1000;

      await this.renderFn(item, playlist);

      this.currentIndex++;
      this.lock = false;
      this.scheduleNext(durationMs);
    } catch (err) {
      logError(`Render error on screen ${this.screenId}:`, err);
      this.lock = false;
      this.scheduleNext(1000);
    }
  }

  onPlaylistUpdated() {
    // Non interrompe il loop, ma ricomincia dalla prima creativa
    this.currentIndex = 0;
  }
}
