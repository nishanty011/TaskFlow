import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

// Protected route for authenticated users
export function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.status === "pending" || user?.status === "pending_approval") {
    return <Navigate to="/waiting-approval" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Guest route for unauthenticated visitors (login, register)
export function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;

  if (isAuthenticated && user?.role) {
    const dashboardPaths = {
      admin: "/admin/dashboard",
      superadmin: "/admin/dashboard",
      manager: "/manager/dashboard",
      employee: "/employee/dashboard",
    };
    if (dashboardPaths[user.role]) {
      return <Navigate to={dashboardPaths[user.role]} replace />;
    }
  }

  return <Outlet />;
}

// Route for users awaiting approval
export function PendingRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isPending = user?.status === "pending" || user?.status === "pending_approval";
  if (!isPending) {
    const dashboardPaths = {
      admin: "/admin/dashboard",
      superadmin: "/admin/dashboard",
      manager: "/manager/dashboard",
      employee: "/employee/dashboard",
    };
    if (dashboardPaths[user?.role]) {
      return <Navigate to={dashboardPaths[user.role]} replace />;
    }
  }

  return <Outlet />;
}
