import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api/client";

const DEMO_MODE =
  import.meta.env.DEV &&
  import.meta.env["VITE_ADMIN_DEMO_MODE"] === "true"; //for demo purposes only

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
  // googleLogin: (credential: string) => Promise<void>;
  demoLogin: () => void; // For demo purposes only
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const demoLogin = useCallback(() => {
  if (!DEMO_MODE) {
    throw new Error("Demo mode is disabled");
  }

  localStorage.setItem("ppa_admin_demo", "true");

  setUser({
    id: 0,
    email: "demo@ppa.local",
    full_name: "Demo Administrator",
    role: "superadmin",
    is_active: true,
    avatar_url: null,
  });
}, []); // For demo purposes only

  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("ppa_admin_token")
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("ppa_admin_token"));

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

  // new 2
  const googleLogin = useCallback(async (credential: string) => {
  const data = await apiFetch<TokenResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });

  localStorage.setItem("ppa_admin_token", data.access_token);
  localStorage.setItem("ppa_admin_refresh", data.refresh_token);

  setToken(data.access_token);

  const me = await apiFetch<UserOut>("/api/auth/me");
  setUser(me);
}, []);

  // On mount, if a token exists validate it by fetching /api/auth/me
  // useEffect(() => {
  //   if (!token) {
  //     setIsLoading(false);
  //     return;
  //   }
  //   apiFetch<UserOut>("/api/auth/me")
  //     .then((u) => setUser(u))
  //     .catch(() => {
  //       // Token invalid/expired — clear it
  //       localStorage.removeItem("ppa_admin_token");
  //       localStorage.removeItem("ppa_admin_refresh");
  //       setToken(null);
  //     })
  //     .finally(() => setIsLoading(false));
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // const login = useCallback(async (email: string, password: string) => {
  //   const data = await apiFetch<TokenResponse>("/api/auth/login", {
  //     method: "POST",
  //     body: JSON.stringify({ email, password }),
  //   });
  //   localStorage.setItem("ppa_admin_token", data.access_token);
  //   localStorage.setItem("ppa_admin_refresh", data.refresh_token);
  //   setToken(data.access_token);

  //   const me = await apiFetch<UserOut>("/api/auth/me");
  //   setUser(me);
  // }, []);

  // const logout = useCallback(() => {
  //   localStorage.removeItem("ppa_admin_token");
  //   localStorage.removeItem("ppa_admin_refresh");
  //   setToken(null);
  //   setUser(null);
  // }, []);    for the sake of demo

  useEffect(() => {
  if (!token) {
    if (
      DEMO_MODE &&
      localStorage.getItem("ppa_admin_demo") === "true"
    ) {
      setUser({
        id: 0,
        email: "demo@ppa.local",
        full_name: "Demo Administrator",
        role: "superadmin",
        is_active: true,
        avatar_url: null,
      });
    }

    setIsLoading(false);
    return;
  }

  apiFetch<UserOut>("/api/auth/me")
    .then((u) => setUser(u))
    .catch(() => {
      localStorage.removeItem("ppa_admin_token");
      localStorage.removeItem("ppa_admin_refresh");
      setToken(null);
    })
    .finally(() => setIsLoading(false));
}, []); //demo useEffect


    const logout = useCallback(() => {
  localStorage.removeItem("ppa_admin_token");
  localStorage.removeItem("ppa_admin_refresh");
  localStorage.removeItem("ppa_admin_demo");

  setToken(null);
  setUser(null);
}, []); //demo logout

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        logout,
        //googleLogin,
        // isAuthenticated: !!token && !!user,  //will put back after testing
        isAuthenticated:
      !!user && (!!token || (
        DEMO_MODE &&
        localStorage.getItem("ppa_admin_demo") === "true"
      )), //demo mode authenticated check
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
