// Lets the axios interceptor (a plain module, outside React) push session
// changes (silent token refresh, forced sign-out on unrecoverable 401) into
// AuthProvider's React state - AuthProvider subscribes on mount and calls
// setSession with whatever is emitted here.
const listeners = new Set();

export function onSessionChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionChange(session) {
  listeners.forEach((listener) => listener(session));
}
