import { useEffect, useMemo, useState } from "react";
import { authApi, tokenStorage } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        tokenStorage.clearToken();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const login = async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    tokenStorage.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ email, name, password }) => {
    return authApi.register({ email, name, password });
  };

  const logout = () => {
    tokenStorage.clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
