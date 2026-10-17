import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logoutUser } from "../api/auth.api";

// Context banao
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial check ke liye

  // App start pe check karo ki user logged in hai ya nahi
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await getMe();
      const currentUser = data?.data?.user || data?.data;
      setUser(currentUser);
    } catch {
      // token expire ya invalid — clean up karo
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login ke baad user set karo aur token save karo
  const login = useCallback((userData, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    const currentUser = userData?.user || userData;
    setUser(currentUser);
  }, []);

  // Logout — backend se bhi call karo taaki cookie clear ho
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // silent fail — local cleanup toh karna hi hai
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  }, []);

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee",
    isPending: user?.status === "pending" || user?.status === "pending_approval", // approval ka wait
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — har jagah se easily use ho
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
