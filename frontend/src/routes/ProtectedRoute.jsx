import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Loading spinner — auth check hone tak dikhao
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Protected route — sirf logged-in users ke liye
export function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  // Login nahi hai — login page pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account pending approval — waiting page pe bhejo
  if (user?.status === "pending") {
    return <Navigate to="/waiting-approval" replace />;
  }

  // Role check — agar specific roles chahiye aur user ka role match nahi karta
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Guest route — sirf logged-out users ke liye (login, register pages)
export function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;

  // Pehle se logged in hai — dashboard pe bhejo
  if (isAuthenticated) {
    // Role ke hisaab se redirect
    const dashboardPaths = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      employee: "/employee/dashboard",
    };
    return <Navigate to={dashboardPaths[user?.role] || "/"} replace />;
  }

  return <Outlet />;
}

// Pending route — sirf pending users ke liye
export function PendingRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.status !== "pending") {
    const dashboardPaths = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      employee: "/employee/dashboard",
    };
    return <Navigate to={dashboardPaths[user?.role] || "/"} replace />;
  }

  return <Outlet />;
}
