const ASSET_CACHE = {};

export function cacheAsset(id, blobUrl) {
  ASSET_CACHE[id] = blobUrl;
}

export function getCachedAsset(id) {
  return ASSET_CACHE[id] || null;
}
