import { useEffect, useMemo, useState } from "react";
import { authApi, setUnauthorizedHandler, tokenStorage } from "../services/api";
import { AuthContext } from "./auth-context";

let bootstrapSessionPromise = null;

function normalizeUserRole(user) {
  if (!user) return null;
  const allowedRoles = ["superadmin", "admin", "it_employee", "employee"];
  if (!allowedRoles.includes(user.role)) return null;
  return { ...user, role: user.role };
}

async function bootstrapSession() {
  const token = tokenStorage.getToken();
  if (!token) {
    return null;
  }

  if (!bootstrapSessionPromise) {
    bootstrapSessionPromise = authApi
      .me()
      .then((me) => {
        const normalizedUser = normalizeUserRole(me);
        if (!normalizedUser) {
          tokenStorage.clearToken();
          return null;
        }
        return normalizedUser;
      })
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

  const login = async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    tokenStorage.setToken(data.access_token);

    const normalizedUser = normalizeUserRole(data.user);
    if (!normalizedUser) {
      tokenStorage.clearToken();
      throw new Error("Role pengguna tidak valid.");
    }
    setUser(normalizedUser);
    return normalizedUser;
  };

  const register = async ({ email, name, password }) => {
    return authApi.register({ email, name, password });
  };

  const logout = () => {
    tokenStorage.clearToken();
    setUser(null);
  };

  const updateLocalProfile = (payload) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...payload };
    });
  };

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

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
      updateLocalProfile,
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
