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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
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
      // Set the authorization header for existing token
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
      Cookies.remove("auth-token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const loginData = response.data?.data || response.data;
      const { access_token, user: userData } = loginData;

      Cookies.set("auth-token", access_token, { expires: 7 });
      setUser(userData);

      // Set default authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    Cookies.remove("auth-token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
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
