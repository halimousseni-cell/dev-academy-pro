import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setAccessToken, setOnAuthLost } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthLost(clearSession);

    let cancelled = false;
    api
      .post<{ user: User; accessToken: string }>("/auth/refresh")
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setOnAuthLost(null);
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string }>("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      const res = await api.post<{ user: User; accessToken: string }>("/auth/register", data);
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
