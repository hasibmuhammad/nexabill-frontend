"use client";

import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  resellerId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = Cookies.get("auth-token");
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data?.data || response.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      // We don't remove cookies here because the interceptor 
      // will handle actual 401s and attempt refresh
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const loginData = response.data?.data || response.data;
      const { access_token, refresh_token, user: userData } = loginData;

      // Store both tokens
      Cookies.set("auth-token", access_token, { expires: 1 });
      Cookies.set("refresh-token", refresh_token, { expires: 7 });
      
      setUser(userData);

      return userData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const getRedirectPath = () => {
    if (!user) return "/auth/login";

    switch (user.role) {
      case "SUPER_ADMIN":
        return "/admin";
      case "ORGANIZATION":
      case "ADMIN":
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  const logout = () => {
    Cookies.remove("auth-token");
    Cookies.remove("refresh-token");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
