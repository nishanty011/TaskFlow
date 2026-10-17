import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getManagerDashboard } from "../../api/dashboard.api";
import { getPendingEmployees } from "../../api/user.api";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { PRIORITY_COLORS, PRIORITY_CONFIG } from "../../utils/statusColors";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";
import ReviewSubmissionModal from "../../components/tasks/ReviewSubmissionModal";

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

// KPI Stat Card
function KPICard({ label, value, icon, color, subtitle, delay = 0, isPercent = false }) {
  const animatedVal = useAnimatedNumber(typeof value === "number" ? value : 0);
  return (
    <div
      className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
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
      {/* Background glow hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

// Custom Tooltip for Recharts
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-xl backdrop-blur-md shadow-xl border border-slate-700/50">
        <p className="font-bold mb-1">{label || payload[0]?.name}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-slate-300 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: item.color || item.fill }}
            />
            {item.name}: <span className="font-semibold text-white">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSubForReview, setSelectedSubForReview] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, pendRes] = await Promise.all([
        getManagerDashboard(),
        getPendingEmployees().catch(() => ({ data: { data: { count: 0, employees: [] } } })),
      ]);

      setData(dashRes.data?.data);
      const pendingList = pendRes.data?.data?.employees || [];
      setPendingCount(pendingList.length);
    } catch (err) {
      console.error("Manager dashboard error:", err);
      toast.error("Failed to load dashboard data");
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
          <div className="h-72 bg-white/60 rounded-3xl" />
          <div className="h-72 bg-white/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const taskStats = data?.taskStats || {};
  const employeeWorkload = data?.employeeWorkload || [];
  const pendingSubmissions = data?.pendingSubmissions || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentActivities = data?.recentActivities || [];

  // Donut chart data for task status
  const donutColors = {
    assigned: "#6366f1", // indigo
    in_progress: "#3b82f6", // blue
    submitted: "#f59e0b", // amber
    under_review: "#8b5cf6", // violet
    changes_requested: "#ec4899", // pink
    completed: "#10b981", // emerald
  };

  const statusChartData = Object.entries(taskStats)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.replace("_", " ").toUpperCase(),
      value: count,
      color: donutColors[status] || "#94a3b8",
    }));

  // Bar chart data for employee workload
  const workloadChartData = employeeWorkload.map((emp) => ({
    name: emp.name.split(" ")[0],
    fullName: emp.name,
    Completed: emp.completedTasks,
    Pending: emp.pendingTasks,
    Rate: emp.completionRate,
  }));

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: Department Control Center Info & Quick Nav
          ========================================================================= */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        {/* Soft background ambient gradient */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-brand-400/10 via-indigo-400/10 to-violet-400/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Department Control Center • {data?.department?.name || user?.department?.name || "Department Lead"} ({data?.department?.code || "DEPT"})
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Manager"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track real-time department velocity, assign weighted deliverables, approve new team members, and verify versioned submissions.
            </p>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/manager/approvals"
              className="relative px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 group"
            >
              <span>⏳ Pending Approvals</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/manager/employees"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>👥 Department Team</span>
              <span className="text-slate-400 font-normal">({employeeWorkload.length})</span>
            </Link>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>+ Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KPI METRICS GRID (6 Stat Cards)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        <KPICard
          label="Total Tasks"
          value={kpis.totalTasks || 0}
          icon="📋"
          color="bg-brand-50 text-brand-600 border border-brand-100"
          subtitle="All department tasks"
          delay={0}
        />
        <KPICard
          label="Active / Working"
          value={kpis.inProgressTasks || 0}
          icon="⚡"
          color="bg-blue-50 text-blue-600 border border-blue-100"
          subtitle="Currently in progress"
          delay={100}
        />
        <KPICard
          label="Needs Review"
          value={kpis.underReviewTasks || 0}
          icon="🔍"
          color="bg-amber-50 text-amber-600 border border-amber-100"
          subtitle="Awaiting sign-off"
          delay={200}
        />
        <KPICard
          label="Overdue Tasks"
          value={kpis.overdueCount || 0}
          icon="🚨"
          color={kpis.overdueCount > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-600 border border-slate-100"}
          subtitle={kpis.overdueCount > 0 ? "Past due date!" : "No overdue items"}
          delay={300}
        />
        <KPICard
          label="Due Today"
          value={kpis.dueTodayCount || 0}
          icon="⏰"
          color="bg-purple-50 text-purple-600 border border-purple-100"
          subtitle="Deadline today"
          delay={400}
        />
        <KPICard
          label="Completion Rate"
          value={kpis.completionRate || 0}
          isPercent={true}
          icon="🎯"
          color="bg-emerald-50 text-emerald-600 border border-emerald-100"
          subtitle={`${kpis.completedTasks || 0} completed`}
          delay={500}
        />
      </div>

      {/* =========================================================================
          ANALYTICS & VISUAL CHARTS SECTION
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task Status Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Task Status Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribution across lifecycle states</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                {kpis.totalTasks || 0} Tasks
              </span>
            </div>

            {statusChartData.length > 0 ? (
              <div className="relative h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{kpis.completionRate || 0}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Completed
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No active task data yet</span>
              </div>
            )}
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            {Object.entries(taskStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-slate-50/80">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: donutColors[status] || "#94a3b8" }}
                  />
                  <span className="text-slate-600 font-medium capitalize truncate">
                    {status.replace("_", " ")}
                  </span>
                </div>
                <span className="font-bold text-slate-900 ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team Workload Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Employee Workload & Output</h3>
                <p className="text-xs text-slate-400 mt-0.5">Assigned vs completed tasks per team member</p>
              </div>
              <Link
                to="/manager/employees"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
              >
                Team Directory →
              </Link>
            </div>

            {workloadChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                    <Bar dataKey="Pending" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No team members assigned tasks yet</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-600 font-medium">Completed Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-indigo-500" />
              <span className="text-slate-600 font-medium">Pending Tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACTION LISTS: Needs Review & Overdue Tasks
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Review / Pending Submissions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                🔍
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Awaiting Deliverable Review</h3>
                <p className="text-xs text-slate-400">Submissions requiring approval or feedback</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              {pendingSubmissions.length} Pending
            </span>
          </div>

          {pendingSubmissions.length > 0 ? (
            <div className="space-y-3">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-4 rounded-2xl bg-slate-50/80 hover:bg-amber-50/40 border border-slate-200/60 hover:border-amber-200 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {sub.employee?.name?.charAt(0) || "E"}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {sub.task?.title || "Task Deliverable"}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{sub.employee?.name}</span>
                        <span>•</span>
                        <span>{timeAgo(sub.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      v{sub.version || 1}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSubForReview(sub);
                        setIsReviewOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              <span className="text-2xl mb-2 block">🎉</span>
              <p className="text-sm font-semibold text-slate-700">No pending submissions</p>
              <p className="text-xs text-slate-400 mt-1">All employee deliverables have been reviewed.</p>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines & Overdue Tasks */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-base">
                ⏰
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines (Next 7 Days)</h3>
                <p className="text-xs text-slate-400">Time-sensitive tasks to monitor</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {upcomingDeadlines.length} Tasks
            </span>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                const prio = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                return (
                  <div
                    key={task._id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isOverdue
                        ? "bg-rose-50/40 border-rose-200 hover:bg-rose-50/70"
                        : "bg-slate-50/80 border-slate-200/60 hover:bg-white"
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
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{task.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned to: <span className="font-medium text-slate-700">{task.assignedTo?.name || "Unassigned"}</span>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold block ${isOverdue ? "text-rose-600" : "text-slate-700"}`}>
                        {formatDate(task.dueDate)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isOverdue ? "Needs attention" : timeAgo(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              <span className="text-2xl mb-2 block">✨</span>
              <p className="text-sm font-semibold text-slate-700">No imminent deadlines</p>
              <p className="text-xs text-slate-400 mt-1">No tasks are due within the next 7 days.</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          RECENT DEPARTMENT ACTIVITIES (Audit Trail)
          ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Department Activity Log</h3>
            <p className="text-xs text-slate-400">Live trail of actions, submissions, and status changes</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Recent 5 Events</span>
        </div>

        {recentActivities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act._id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0">
                    {act.actor?.name?.charAt(0) || "U"}
                  </div>
                  <div className="truncate">
                    <p className="text-xs text-slate-900 font-medium truncate">
                      <span className="font-bold text-slate-900">{act.actor?.name || "System"}</span>{" "}
                      {act.action?.replace("_", " ")}
                      {act.metadata?.taskTitle && (
                        <span className="text-brand-600 font-semibold"> "{act.metadata.taskTitle}"</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">{timeAgo(act.createdAt)}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold flex-shrink-0">
                  {act.entityType}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No recent activity recorded yet.</p>
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onTaskCreated={() => {
            fetchDashboard();
          }}
        />
      )}

      {/* Review Deliverable Modal */}
      {isReviewOpen && selectedSubForReview && (
        <ReviewSubmissionModal
          isOpen={isReviewOpen}
          submission={selectedSubForReview}
          onClose={() => {
            setIsReviewOpen(false);
            setSelectedSubForReview(null);
          }}
          onReviewed={() => {
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}
