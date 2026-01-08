import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiUrl } from "@/lib/api-config";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { getAuthHeaders } = await import("@/lib/auth-token");
      const res = await fetch(apiUrl("/api/auth/me"), { 
        credentials: "include",
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json() as Promise<User>;
    },
    retry: false,
  });

  useEffect(() => {
    setUser(currentUser || null);
  }, [currentUser]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { getAuthHeaders } = await import("@/lib/api-config");
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: await getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      
      // Verifica se a resposta é JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Erro no servidor: ${text.substring(0, 100)}`);
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }
      
      if (data.token) {
        const { saveToken } = await import("@/lib/auth-token");
        saveToken(data.token);
      }
      
      return data as User;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
      setUser(data);
      setTimeout(() => {
        setLocation("/characters");
      }, 0);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      const { getAuthHeaders } = await import("@/lib/api-config");
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: await getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      
      // Verifica se a resposta é JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Erro no servidor: ${text.substring(0, 100)}`);
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Erro ao criar conta");
      }
      
      if (data.token) {
        const { saveToken } = await import("@/lib/auth-token");
        saveToken(data.token);
      }
      
      return data as User;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
      setUser(data);
      setTimeout(() => {
        setLocation("/characters");
      }, 0);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { getAuthHeaders } = await import("@/lib/api-config");
      const res = await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        headers: await getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao fazer logout");
    },
    onSuccess: async () => {
      const { removeToken } = await import("@/lib/auth-token");
      removeToken();
      setUser(null);
      queryClient.clear();
      localStorage.removeItem("necro_tome_auth_token");
      setTimeout(() => {
        setLocation("/login");
      }, 100);
    },
    onError: async () => {
      const { removeToken } = await import("@/lib/auth-token");
      removeToken();
      localStorage.removeItem("necro_tome_auth_token");
      setUser(null);
      queryClient.clear();
      setTimeout(() => {
        setLocation("/login");
      }, 100);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (email: string, password: string, name: string) => {
    await registerMutation.mutateAsync({ email, password, name });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
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

