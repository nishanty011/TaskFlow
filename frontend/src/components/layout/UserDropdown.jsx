import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
      case "superadmin":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "manager":
        return "bg-indigo-50 text-brand-700 border-brand-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/60 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-brand-500/20">
          {userInitial}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
            {user?.name || "User"}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {user?.role || "Member"}
          </span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-slate-400/30 overflow-hidden z-50 animate-scale-in">
          {/* User info header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-brand-500/20">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadge(
                  user?.role
                )}`}
              >
                {user?.role || "Member"}
              </span>
              {user?.department?.name && (
                <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200/80 truncate">
                  {user.department.name}
                </span>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="p-2 space-y-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
            >
              <span>👤</span> My Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
            >
              <span>⚙️</span> Preferences & Security
            </Link>
            <Link
              to="/style-guide"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
            >
              <span>🎨</span> Design System
            </Link>
          </div>

          {/* Sign out */}
          <div className="p-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/60 transition-colors"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
