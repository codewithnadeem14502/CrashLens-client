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

// Applies a rotated access/refresh token pair (from POST /auth/refresh-token)
// onto an existing session. Role/permissions/org are left untouched - they
// can't have silently changed while the refresh token stayed valid, since
// auth-service revokes a membership's outstanding refresh tokens whenever
// its role changes (see updateOrganizationMemberRole), so a stale role would
// already have failed the refresh call itself rather than reached here.
export function updateSessionTokens(session, { accessToken, refreshToken }) {
  const nextSession = {
    ...session,
    accessToken,
    refreshToken: refreshToken ?? session.refreshToken,
    claims: decodeJwtPayload(accessToken) ?? session.claims,
  };

  saveSession(nextSession);

  return nextSession;
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
