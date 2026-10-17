import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: "Assigned Tasks", value: "5", change: "2 due this week", icon: "📋", color: "text-brand-600 bg-brand-50" },
    { label: "In Progress", value: "3", change: "Average 72% progress", icon: "⚡", color: "text-amber-600 bg-amber-50" },
    { label: "Submitted", value: "1", change: "Under manager review", icon: "📦", color: "text-indigo-600 bg-indigo-50" },
    { label: "Completed", value: "12", change: "100% on schedule", icon: "✅", color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Employee Workspace • {user?.department?.name || "Team Member"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Employee"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your assigned task checklists, upload versioned deliverables, and review manager feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/style-guide"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              UI Guide
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
            >
              Home Page →
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.color}`}>
                {s.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-3">{s.value}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Active Task Showcase Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-brand-700 border border-brand-200">
              TECH-204
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              High Priority
            </span>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Due Tomorrow
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Build 3D Showcase & App Layout Shell
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Complete responsive Sidebar, Navbar, Mobile Drawer, and Breadcrumbs.
        </p>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700">Checklist Progress</span>
            <span className="font-extrabold text-brand-600 text-sm tabular-nums">85%</span>
          </div>
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: "85%" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>4 of 5 deliverables completed</span>
            <span className="text-emerald-600 font-semibold">On Track ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
