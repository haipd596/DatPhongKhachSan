import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        // Interceptor will handle refresh if 401. If it fails ultimately, auth-logout is fired.
        setLoading(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();

    // Listen to token refresh failure
    const handleForceLogout = () => {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    };

    window.addEventListener("auth-logout", handleForceLogout);
    return () => window.removeEventListener("auth-logout", handleForceLogout);
  }, []);

  const login = (authResponse) => {
    localStorage.setItem("accessToken", authResponse.accessToken);
    if(authResponse.refreshToken) {
      localStorage.setItem("refreshToken", authResponse.refreshToken);
    }
    setUser(authResponse);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await client.post("/auth/logout", { refreshToken });
      }
    } catch(e) {
      console.warn("Logout request failed:", e);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
