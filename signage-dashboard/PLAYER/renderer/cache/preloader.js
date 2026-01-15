import { cacheAsset } from "./assetCache.js";

export async function preloadAssets(playlist) {
  const items = playlist.items || [];

  for (const item of items) {
    const url = item.contents?.url;
    if (!url) continue;

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      cacheAsset(item.id, blobUrl);
    } catch (err) {
      console.error("Errore preload asset:", err);
    }
  }
}
