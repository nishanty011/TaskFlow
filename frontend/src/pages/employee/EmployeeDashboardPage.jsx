import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getEmployeeDashboard } from "../../api/dashboard.api";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { PRIORITY_CONFIG } from "../../utils/statusColors";
import { formatDate, timeAgo } from "../../utils/formatDate";

// Smooth animated counter hook
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) {
      setValue(0);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function StatCard({ label, value, icon, color, subtitle, isPercent = false }) {
  const animatedVal = useAnimatedNumber(typeof value === "number" ? value : 0);
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 mt-3 tabular-nums tracking-tight">
        {typeof value === "number" ? animatedVal : value}
        {isPercent ? "%" : ""}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{subtitle}</p>
      )}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getEmployeeDashboard();
      setData(res.data?.data);
    } catch (err) {
      console.error("Failed to load employee dashboard:", err);
      toast.error("Dashboard data load nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white/60 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/60 rounded-3xl" />
          <div className="h-64 bg-white/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentFeedbacks = data?.recentFeedbacks || [];

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: Employee Personal Hub
          ========================================================================= */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-indigo-400/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Employee Workspace • {user?.department?.name || "Department Member"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Employee"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track your assigned task checklists, view upcoming deadlines, upload versioned deliverables, and review manager evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/employee/tasks"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>📋 My Tasks & Checklists</span>
            </Link>

            <Link
              to="/employee/submissions"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>📦 Submissions History</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KPI STATS GRID (4 Main Metrics)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          label="Active Tasks"
          value={kpis.inProgressTasks || 0}
          icon="⚡"
          color="bg-blue-50 text-blue-600 border border-blue-100"
          subtitle="Currently working"
        />
        <StatCard
          label="Completed"
          value={kpis.completedTasks || 0}
          icon="✅"
          color="bg-emerald-50 text-emerald-600 border border-emerald-100"
          subtitle="Finished deliverables"
        />
        <StatCard
          label="Under Review"
          value={kpis.underReviewTasks || 0}
          icon="⏳"
          color="bg-amber-50 text-amber-600 border border-amber-100"
          subtitle="Awaiting manager sign-off"
        />
        <StatCard
          label="Overdue Tasks"
          value={kpis.overdueCount || 0}
          icon="🚨"
          color={kpis.overdueCount > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-600 border border-slate-100"}
          subtitle={kpis.overdueCount > 0 ? "Action required!" : "No overdue tasks"}
        />
        <StatCard
          label="Average Progress"
          value={kpis.avgActiveProgress || 0}
          isPercent={true}
          icon="🎯"
          color="bg-purple-50 text-purple-600 border border-purple-100"
          subtitle="On active checklists"
        />
      </div>

      {/* =========================================================================
          UPCOMING DEADLINES & URGENCY SECTION
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Deadlines (7 cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center text-base">
                ⏰
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines</h3>
                <p className="text-xs text-slate-400">Tasks with imminent delivery dates</p>
              </div>
            </div>

            <Link
              to="/employee/tasks"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              View All Tasks →
            </Link>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((task) => {
                const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isOverdue = new Date(task.dueDate) < new Date();
                const hoursLeft = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60);
                const isUrgentDue = hoursLeft > 0 && hoursLeft <= 24;

                return (
                  <div
                    key={task._id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isOverdue
                        ? "bg-rose-50/40 border-rose-200"
                        : isUrgentDue
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50/80 border-slate-200/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prio.bg} ${prio.text}`}>
                          {prio.label}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                            Overdue
                          </span>
                        )}
                        {isUrgentDue && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-bounce">
                            Due in &lt;24h
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          {task.progress || 0}% progress
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold block ${isOverdue ? "text-rose-600" : "text-slate-800"}`}>
                        {formatDate(task.dueDate)}
                      </span>
                      <Link
                        to="/employee/tasks"
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 mt-1 inline-block"
                      >
                        Open Task →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              <span className="text-2xl mb-2 block">✨</span>
              <p className="text-sm font-semibold text-slate-700">No urgent deadlines</p>
              <p className="text-xs text-slate-400 mt-1">All your tasks are well on track.</p>
            </div>
          )}
        </div>

        {/* Right: Recent Manager Feedback & Scorecards (5 cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manager Evaluations</h3>
                  <p className="text-xs text-slate-400">Ratings & feedback on deliverables</p>
                </div>
              </div>

              <Link
                to="/employee/submissions"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Submissions →
              </Link>
            </div>

            {recentFeedbacks.length > 0 ? (
              <div className="space-y-3">
                {recentFeedbacks.map((fb) => (
                  <div key={fb._id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[160px]">
                        {fb.task?.title || "Deliverable"}
                      </span>
                      {fb.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          {"★".repeat(fb.rating)}
                          <span className="text-slate-700 font-extrabold ml-1">{fb.rating}.0</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{fb.message}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                      <span>By: {fb.author?.name || "Manager"}</span>
                      <span>{timeAgo(fb.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                <span className="text-2xl mb-2 block">🌟</span>
                <p className="text-sm font-semibold text-slate-700">No evaluations yet</p>
                <p className="text-xs text-slate-400 mt-1">Submit your first deliverable to receive manager ratings.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Quality Average</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              ★ High Performance Tier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
