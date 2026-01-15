import { cacheAsset } from "./assetCache.js";

export async function preloadAssets(playlist, currentScreenId) {
  if (!playlist || !playlist.screenPlaylists) return;

  const screenPlaylist = playlist.screenPlaylists[currentScreenId];
  if (!screenPlaylist) return;

  const items = screenPlaylist.items || [];

  for (const item of items) {
    const content = item.contents;
    if (!content?.url) continue;

    try {
      const res = await fetch(content.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Cache RAM
      cacheAsset(content.id, blobUrl);

      // Cache su disco
      await window.supabaseAPI.getCachedContent(content);

    } catch (err) {
      console.error("Errore preload asset:", err);
    }
  }
}
