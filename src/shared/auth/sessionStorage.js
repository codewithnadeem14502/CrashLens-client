const SESSION_KEY = "crashlens.session";

export function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session?.accessToken) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveSession(nextSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function buildSession(payload) {
  const data = payload?.data ?? payload ?? {};
  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;
  const claims = decodeJwtPayload(accessToken) ?? {};
  const organization = data.organization ?? null;
  const user = data.user ?? null;
  const membership = data.membership ?? null;

  return {
    accessToken,
    refreshToken,
    user,
    organization,
    membership,
    claims,
    organizationId: organization?.id ?? claims.organizationId,
    role: membership?.role ?? claims.role,
    permissions: membership?.permissions ?? claims.permissions ?? [],
  };
}
