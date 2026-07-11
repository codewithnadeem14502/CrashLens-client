import axios from "axios";
import { clearSession, loadSession, updateSessionTokens } from "../auth/sessionStorage";
import { emitSessionChange } from "../auth/sessionEvents";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 12000,
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}

// Requests made before a user has a session yet (or that are explicitly
// re-authenticating) - a 401 from one of these means "bad credentials",
// which the calling form already surfaces inline. Everything else is
// assumed to carry the session's bearer token, so a 401 there means the
// token expired/was revoked mid-session, not a login failure.
const PUBLIC_AUTH_PATHS = [
  /^\/auth\/login$/,
  /^\/auth\/organizations$/,
  /^\/auth\/refresh-token$/,
  /^\/auth\/logout$/,
  /^\/auth\/update-password$/,
];

function forceSignOut() {
  clearSession();
  setAuthToken(null);
  // No hard reload: AuthProvider is always mounted at the app root and
  // listens for this, so setting session to null flows into React state
  // and ProtectedRoute's own isAuthenticated check redirects to /auth -
  // the page component itself never re-renders with a null session because
  // ProtectedRoute swaps in <Navigate> instead of its children.
  emitSessionChange(null);
}

// Refresh is rotating (auth-service issues a new refreshToken and revokes
// the spent one on every call, see refresh-token-model.js's tokenFamilyId/
// replacedByTokenId chain), so concurrent 401s must not each redeem the same
// refresh token - only the loser would succeed, tripping the reuse-detection
// path server-side and revoking the whole token family. This queue makes
// every 401 that arrives while a refresh is already in flight wait for that
// single refresh to finish, then retry with whatever token it produced.
let isRefreshing = false;
let refreshWaiters = [];

function waitForRefresh() {
  return new Promise((resolve) => {
    refreshWaiters.push(resolve);
  });
}

function settleRefreshWaiters(nextAccessToken) {
  refreshWaiters.forEach((resolve) => resolve(nextAccessToken));
  refreshWaiters = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = (originalRequest?.url ?? "").split("?")[0];
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((pattern) =>
      pattern.test(url),
    );

    if (status !== 401 || isPublicAuthRequest || !originalRequest) {
      return Promise.reject(error);
    }

    // Already retried once after a refresh and still 401 - the new token
    // is no good either, stop here instead of looping.
    if (originalRequest._retriedAfterRefresh) {
      forceSignOut();
      return Promise.reject(error);
    }

    const session = loadSession();

    if (!session?.refreshToken) {
      forceSignOut();
      return Promise.reject(error);
    }

    originalRequest._retriedAfterRefresh = true;

    if (isRefreshing) {
      const nextAccessToken = await waitForRefresh();

      if (!nextAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    }

    isRefreshing = true;

    try {
      // Raw axios, not apiClient - avoids recursing through this same
      // interceptor, and refresh-token is gateway/auth-exempt so it needs
      // no Authorization header anyway.
      const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken: session.refreshToken,
      });
      const tokens = data?.data ?? data;
      const nextSession = updateSessionTokens(session, tokens);

      setAuthToken(nextSession.accessToken);
      emitSessionChange(nextSession);
      settleRefreshWaiters(nextSession.accessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;
      return await apiClient(originalRequest);
    } catch {
      settleRefreshWaiters(null);
      forceSignOut();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
