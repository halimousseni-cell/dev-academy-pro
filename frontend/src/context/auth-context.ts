import { createContext } from "react";
import type { LoginResult, User } from "../types";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeMfaLogin: (mfaToken: string, code: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
