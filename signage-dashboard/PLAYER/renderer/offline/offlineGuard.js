export function isOffline() {
  return !navigator.onLine;
}

export function onOffline(callback) {
  window.addEventListener("offline", callback);
}

export function onOnline(callback) {
  window.addEventListener("online", callback);
}
