import { useEffect, useMemo, useState } from "react";
import { authApi, setUnauthorizedHandler, tokenStorage } from "../services/api";
import { AuthContext } from "./auth-context";

let bootstrapSessionPromise = null;

async function bootstrapSession() {
  const token = tokenStorage.getToken();
  if (!token) {
    return null;
  }

  if (!bootstrapSessionPromise) {
    bootstrapSessionPromise = authApi
      .me()
      .catch(() => {
        tokenStorage.clearToken();
        return null;
      })
      .finally(() => {
        bootstrapSessionPromise = null;
      });
  }

  return bootstrapSessionPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isActive = true;

    setUnauthorizedHandler(() => {
      tokenStorage.clearToken();
      if (!isActive) {
        return;
      }

      setUser(null);
      setIsBootstrapping(false);
    });

    const bootstrap = async () => {
      try {
        const me = await bootstrapSession();
        if (isActive) {
          setUser(me);
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isActive = false;
      setUnauthorizedHandler(null);
    };
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
