import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Waiting approval page for newly registered users
export default function WaitingApprovalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-studio-theme flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="bg-orb w-[500px] h-[500px] bg-brand-100/40 top-[-150px] right-[-100px] animate-orb" />
      <div className="bg-orb w-[400px] h-[400px] bg-violet-100/30 bottom-[-100px] left-[-80px] animate-orb-2" />

      {/* Main card */}
      <div className="relative z-10 max-w-md w-full animate-fade-up">
        <div className="auth-card p-10 text-center">
          {/* Animated clock / hourglass illustration */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer pulse rings */}
            <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
            <div className="absolute inset-2 rounded-full bg-amber-200/50 animate-ping opacity-30" style={{ animationDelay: "0.3s" }} />

            {/* Center icon */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Awaiting approval
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your account has been created and your email is verified. An admin will review and approve your account shortly.
          </p>

          {/* User info card */}
          {user && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left animate-fade-up-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-600 font-semibold">Pending approval</span>
              </div>
            </div>
          )}

          {/* What happens next — steps */}
          <div className="text-left mb-8 animate-fade-up-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What happens next</p>
            <div className="space-y-3">
              {[
                { icon: "✅", text: "Email verified", done: true },
                { icon: "⏳", text: "Admin reviews your request", done: false },
                { icon: "🚀", text: "Access granted — you're in!", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      step.done ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-sm ${step.done ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                    {step.text}
                  </span>
                  {step.done && (
                    <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 rounded-2xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 animate-fade-up-3"
          >
            Sign out
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-slate-400 mt-4 animate-fade-up-4">
          Questions? Contact your administrator directly.
        </p>
      </div>
    </div>
  );
}
