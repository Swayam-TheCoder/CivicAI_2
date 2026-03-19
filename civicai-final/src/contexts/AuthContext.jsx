import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, tokenStore } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady]   = useState(false);

  // Listen for forced logout (token refresh failed)
  useEffect(() => {
    const handle = () => { setUser(null); };
    window.addEventListener("auth:logout", handle);
    setReady(true);
    return () => window.removeEventListener("auth:logout", handle);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      tokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (body) => {
    setLoading(true);
    try {
      const res = await authApi.register(body);
      tokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, ready, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
