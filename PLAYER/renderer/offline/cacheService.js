import { logInfo, logError } from "../utils/logger.js";

const CACHE_KEY = "player_cache_v1";

export function savePlaylistToCache(playlist) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(playlist));
    logInfo("Professional Cache Sync: OK");
  } catch (err) {
    logError("Errore salvataggio cache:", err);
  }
}

export function loadPlaylistFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    logError("Errore lettura cache:", err);
    return null;
  }
}