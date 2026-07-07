import { useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../api/client";
import { buildSession, clearSession, loadSession, saveSession } from "./sessionStorage";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    setAuthToken(session?.accessToken);
  }, [session]);

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
        clearSession();
        setSession(null);
        setAuthToken(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
