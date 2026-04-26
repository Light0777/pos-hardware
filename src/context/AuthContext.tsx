import { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "../renderer/services/api";

type User = {
  user_uuid?: string;
  name: string;
  role: "owner" | "manager" | "cashier";
  email?: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 INIT AUTH (runs once on app load)
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      // Set token first
      setToken(storedToken);

      try {
        // Try to verify token with backend
        const res = await apiGet("/auth/me"); // Make sure this endpoint exists
        
        // Extract user data from response
        const userData = res?.data?.user || res?.user;
        
        if (userData) {
          setUser(userData);
          // Update stored user in case it changed
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          // If verification fails but we have stored user, use it
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Auth verification failed", e);
        
        // If token verification fails but we have stored user, still use it
        // This prevents logout on network errors
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          // Invalid stored user, clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ LOGIN - Store both token and user
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    
    // Store in localStorage for persistence
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // ✅ LOGOUT - Clear everything
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Navigate to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};