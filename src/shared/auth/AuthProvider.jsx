import { useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../api/client";
import { logout as logoutRequest } from "../../features/auth/api/authService";
import { buildSession, clearSession, loadSession, saveSession } from "./sessionStorage";
import { onSessionChange } from "./sessionEvents";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    setAuthToken(session?.accessToken);
  }, [session]);

  // The axios interceptor (client.js) lives outside React and updates
  // localStorage directly on silent token refresh or a forced sign-out (an
  // unrecoverable 401) - this is how that flows back into context state
  // without a hard page reload.
  useEffect(() => {
    return onSessionChange((nextSession) => {
      setSession(nextSession);
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      persistSession(payload) {
        const nextSession = buildSession(payload);
        saveSession(nextSession);
        setSession(nextSession);
      },
      signOut() {
        const refreshToken = session?.refreshToken;

        clearSession();
        setSession(null);
        setAuthToken(null);

        if (refreshToken) {
          logoutRequest(refreshToken).catch(() => {});
        }
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
