import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated) return "/";
    switch (user?.role) {
      case "admin":
      case "superadmin":
        return "/admin/dashboard";
      case "manager":
        return "/manager/dashboard";
      default:
        return "/employee/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-studio-theme flex items-center justify-center p-6 text-slate-900 overflow-hidden relative">
      {/* Background soft ambient spotlight */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(224, 242, 254, 0.4) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-8 sm:p-10 text-center animate-fade-up">
        {/* Big 3D 404 Text */}
        <div className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent select-none tracking-tight">
          404
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist in the TaskFlow system.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getDashboardPath()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-brand-500/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {isAuthenticated ? "Go to Dashboard →" : "Return to Home →"}
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
