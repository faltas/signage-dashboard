const LOG_PREFIX = "[PLAYER]";

export function logInfo(...args) {
  console.log(LOG_PREFIX, ...args);
}

export function logError(...args) {
  console.error(LOG_PREFIX, ...args);
}
