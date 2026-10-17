import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/formatDate";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  // Notification preferences
  const [notifyTasks, setNotifyTasks] = useState(() => {
    return localStorage.getItem("notify_tasks") !== "false";
  });
  const [notifyReviews, setNotifyReviews] = useState(() => {
    return localStorage.getItem("notify_reviews") !== "false";
  });
  const [notifyComments, setNotifyComments] = useState(() => {
    return localStorage.getItem("notify_comments") !== "false";
  });
  const [emailDigest, setEmailDigest] = useState("instant");

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem("notify_tasks", notifyTasks);
    localStorage.setItem("notify_reviews", notifyReviews);
    localStorage.setItem("notify_comments", notifyComments);
    toast.success("Preferences updated successfully! ✨");
  };

  const handleExportData = () => {
    const data = {
      profile: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        department: user?.department?.name || user?.department,
        joinedAt: user?.createdAt,
      },
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow_account_data_${user?._id || "user"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Account data exported");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Preferences & Security
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your interface appearance, real-time alert preferences, and account security.
          </p>
        </div>

        <Link
          to="/profile"
          className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <span>👤</span>
          <span>Edit Personal Profile</span>
        </Link>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Interface Appearance & Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how TaskFlow looks on your current device.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 capitalize">
            {theme} Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Theme Card */}
          <div
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              theme === "light"
                ? "border-brand-500 bg-brand-50/40 shadow-sm"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                ☀️
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Studio Luminous (Light)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clean crisp glassmorphism with high contrast
                </p>
              </div>
            </div>
            {theme === "light" && (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              theme === "dark"
                ? "border-brand-500 bg-brand-950/40 shadow-sm"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center text-xl border border-indigo-800">
                🌙
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Midnight Obsidian (Dark)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sleek dark mode tailored for low-light focus
                </p>
              </div>
            </div>
            {theme === "dark" && (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Real-time Alert Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose what events trigger immediate pop-ups and notifications.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Task Assignment Alerts
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive instant toasts when a manager assigns or reassigns a task to you.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyTasks}
              onChange={(e) => setNotifyTasks(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Deliverable Review & Feedback Updates
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive instant alerts when a deliverable is approved or revisions are requested.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyReviews}
              onChange={(e) => setNotifyReviews(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Task Comments & Mentions
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Notify when a colleague or manager posts a comment on your tasks.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyComments}
              onChange={(e) => setNotifyComments(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-brand-600 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            Save Alert Preferences
          </button>
        </div>
      </form>

      {/* 3. Account Data & Session */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Account Metadata & Security
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Account registration details and privacy management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Account Role</span>
            <div className="font-extrabold text-slate-900 dark:text-white capitalize mt-0.5">
              {user?.role}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
            <div className="font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
              {user?.department?.name || "General"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Joined Date</span>
            <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatDate(user?.joinedAt || user?.createdAt)}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>📥</span>
            <span>Export Account Data (JSON)</span>
          </button>

          <Link
            to="/profile"
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            Change Account Password →
          </Link>
        </div>
      </div>
    </div>
  );
}
