import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api/client";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserOut {
  id: number;
  email: string;
  full_name: string;
  role: "staff" | "admin" | "superadmin";
  is_active: boolean;
  avatar_url: string | null;
}

interface AuthContextType {
  user: UserOut | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("ppa_admin_token")
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("ppa_admin_token"));

  // On mount, if a token exists validate it by fetching /api/auth/me
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiFetch<UserOut>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem("ppa_admin_token");
        localStorage.removeItem("ppa_admin_refresh");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("ppa_admin_token", data.access_token);
    localStorage.setItem("ppa_admin_refresh", data.refresh_token);
    setToken(data.access_token);

    const me = await apiFetch<UserOut>("/api/auth/me");
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ppa_admin_token");
    localStorage.removeItem("ppa_admin_refresh");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
