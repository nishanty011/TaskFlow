import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DASHBOARD_PATHS = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const dashPath = DASHBOARD_PATHS[user?.role] || "/login";

  return (
    <div className="min-h-screen bg-studio-theme flex items-center justify-center p-6 relative overflow-hidden">
      <div className="bg-orb w-96 h-96 bg-red-100/30 top-[-100px] right-[-100px] animate-orb" />

      <div className="relative z-10 max-w-sm w-full text-center animate-fade-up">
        <div className="auth-card p-10">
          {/* 403 number — big & styled */}
          <div className="text-8xl font-black gradient-text mb-4 select-none">403</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access denied</h1>
          <p className="text-slate-500 text-sm mb-8">
            You don't have permission to view this page. Contact your administrator if you think this is a mistake.
          </p>
          <Link
            to={dashPath}
            className="btn-gradient inline-flex items-center gap-2"
          >
            ← Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
