import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../api/dashboard.api";
import { CardSkeleton } from "../../components/ui/Skeleton";
import toast from "react-hot-toast";

// Animated counter hook — numbers smoothly count up
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Stat card component
function KPICard({ label, value, icon, color, subtitle, delay = 0 }) {
  const animatedVal = useAnimatedNumber(typeof value === "number" ? value : 0);
  return (
    <div
      className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 mt-3 tabular-nums tracking-tight">
        {typeof value === "number" ? animatedVal : value}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{subtitle}</p>
      )}
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

// Department comparison card
function DeptCard({ dept, rank }) {
  const completionColor =
    dept.completionRate >= 80 ? "text-emerald-600 bg-emerald-50" :
    dept.completionRate >= 50 ? "text-amber-600 bg-amber-50" :
    "text-rose-600 bg-rose-50";

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md">
            {dept.code?.substring(0, 2) || "??"}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
            <p className="text-[10px] text-slate-400 font-medium">{dept.code}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${completionColor}`}>
          {dept.completionRate}%
        </span>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 rounded-xl py-2">
          <p className="text-base font-black text-slate-900">{dept.employeeCount}</p>
          <p className="text-[10px] text-slate-400 font-medium">Members</p>
        </div>
        <div className="bg-slate-50 rounded-xl py-2">
          <p className="text-base font-black text-slate-900">{dept.totalTasks}</p>
          <p className="text-[10px] text-slate-400 font-medium">Tasks</p>
        </div>
        <div className="bg-slate-50 rounded-xl py-2">
          <p className="text-base font-black text-rose-600">{dept.overdueTasks}</p>
          <p className="text-[10px] text-slate-400 font-medium">Overdue</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-400 font-medium">Completion</span>
          <span className="font-bold text-slate-600">{dept.completedTasks}/{dept.totalTasks}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${dept.completionRate}%` }}
          />
        </div>
      </div>
      {/* Manager info */}
      {dept.manager && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
            {dept.manager.name?.charAt(0)}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-700">{dept.manager.name}</p>
            <p className="text-[9px] text-slate-400">Manager</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Activity item component
function ActivityItem({ activity }) {
  const actionColors = {
    user_approved: "bg-emerald-500",
    user_rejected: "bg-rose-500",
    task_created: "bg-blue-500",
    task_updated: "bg-amber-500",
    submission_created: "bg-purple-500",
    default: "bg-slate-400",
  };
  const dotColor = actionColors[activity.action] || actionColors.default;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-2.5 group">
      <div className="relative mt-1">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ring-white shadow-sm`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">{activity.actor?.name || "System"}</span>
          {" "}
          {activity.action?.replace(/_/g, " ")}
          {activity.department && (
            <span className="text-brand-600 font-semibold"> • {typeof activity.department === "object" ? activity.department.name || activity.department.code || "" : activity.department}</span>
          )}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res.data.data);
    } catch (err) {
      toast.error("Dashboard data load nahi hua");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const departments = data?.departmentComparison || [];
  const activities = data?.recentActivities || [];

  const statCards = [
    {
      label: "Total Departments",
      value: kpis.totalDepartments || 0,
      icon: "🏢",
      color: "text-blue-600 bg-blue-50",
      subtitle: `${departments.length} units configured`,
    },
    {
      label: "System Users",
      value: kpis.totalUsers || 0,
      icon: "👥",
      color: "text-brand-600 bg-brand-50",
      subtitle: `${kpis.activeEmployees || 0} active • ${kpis.pendingApprovals || 0} pending`,
    },
    {
      label: "Organization Tasks",
      value: kpis.totalTasks || 0,
      icon: "📋",
      color: "text-emerald-600 bg-emerald-50",
      subtitle: `${kpis.completedTasks || 0} completed • ${kpis.overdueTasks || 0} overdue`,
    },
    {
      label: "Completion Rate",
      value: kpis.systemCompletionRate || 0,
      icon: "📈",
      color: "text-purple-600 bg-purple-50",
      subtitle: `${kpis.systemCompletionRate >= 80 ? "Excellent" : kpis.systemCompletionRate >= 50 ? "Good" : "Needs attention"} performance`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Superadmin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Admin"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete organizational oversight across all departments, user approvals, and security audit logs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              🔄 Refresh
            </button>
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
            >
              Manage Users →
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, idx) => (
          <KPICard key={idx} {...s} delay={idx * 100} />
        ))}
      </div>

      {/* Main Content: Department Comparison + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Department Comparison - takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Performance</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Comparison across all active departments</p>
            </div>
            <Link
              to="/admin/departments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Manage All →
            </Link>
          </div>
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept, idx) => (
                <DeptCard key={dept._id} dept={dept} rank={idx + 1} />
              ))}
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-8 text-center shadow-sm">
              <p className="text-3xl mb-3">🏢</p>
              <p className="text-sm font-semibold text-slate-700">No departments yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first department to see comparison data.</p>
              <Link
                to="/admin/departments"
                className="inline-flex mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                Create Department
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">System-wide audit trail</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View All →
            </Link>
          </div>
          {activities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activities.map((act, idx) => (
                <ActivityItem key={act._id || idx} activity={act} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📝</p>
              <p className="text-xs text-slate-400">No activity logs yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: "🏢", label: "Departments", desc: "Configure & manage", to: "/admin/departments", count: kpis.totalDepartments },
          { icon: "👥", label: "User Directory", desc: "RBAC & accounts", to: "/admin/users", count: kpis.totalUsers },
          { icon: "🛡️", label: "Audit Logs", desc: "Full audit trail", to: "/admin/audit-logs", count: activities.length },
          { icon: "📈", label: "Reports", desc: "Export & analytics", to: "/admin/reports", count: null },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{item.icon}</span>
              {item.count !== null && (
                <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{item.label}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
