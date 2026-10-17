import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAdminDashboard } from "../../api/dashboard.api";
import { exportReport } from "../../api/report.api";
import { Button } from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Skeleton";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res.data.data);
    } catch (err) {
      toast.error("Analytics data load nahi hua");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setExporting(type);
      const res = await exportReport(type);
      // Create blob download
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded!`);
    } catch (err) {
      toast.error(`Export failed: ${err.response?.data?.message || "Error"}`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const departments = data?.departmentComparison || [];

  // Calculate top department
  const topDept = departments.length > 0
    ? departments.reduce((best, d) => d.completionRate > (best?.completionRate || 0) ? d : best, departments[0])
    : null;

  // System health score (weighted average)
  const healthScore = Math.round(
    (kpis.systemCompletionRate || 0) * 0.5 +
    (kpis.totalUsers > 0 ? ((kpis.activeEmployees / kpis.totalUsers) * 100) : 0) * 0.3 +
    (kpis.totalTasks > 0 ? (100 - ((kpis.overdueTasks / kpis.totalTasks) * 100)) : 100) * 0.2
  );

  const healthColor = healthScore >= 80 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-rose-600";
  const healthBg = healthScore >= 80 ? "from-emerald-500 to-teal-500" : healthScore >= 50 ? "from-amber-500 to-orange-500" : "from-rose-500 to-red-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              📈 Analytics & Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organization-wide performance metrics, department analytics, and data export.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("employees")}
              isLoading={exporting === "employees"}
            >
              📥 Export Users
            </Button>
            <Button
              size="sm"
              onClick={() => handleExport("tasks")}
              isLoading={exporting === "tasks"}
            >
              📥 Export Tasks
            </Button>
          </div>
        </div>
      </div>

      {/* Health Score + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* System Health Score — big circular card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm text-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">System Health Score</h3>
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Circular progress background */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="url(#healthGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${healthScore * 3.14} 314`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={healthScore >= 80 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444"} />
                  <stop offset="100%" stopColor={healthScore >= 80 ? "#14b8a6" : healthScore >= 50 ? "#f97316" : "#dc2626"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-black ${healthColor}`}>{healthScore}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Based on completion rate, user activity, and overdue tasks
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Total Tasks", value: kpis.totalTasks || 0, icon: "📋", color: "text-blue-600 bg-blue-50", sub: `${kpis.completedTasks || 0} completed` },
            { label: "Completion Rate", value: `${kpis.systemCompletionRate || 0}%`, icon: "✅", color: "text-emerald-600 bg-emerald-50", sub: "Organization average" },
            { label: "Overdue Tasks", value: kpis.overdueTasks || 0, icon: "⏰", color: "text-rose-600 bg-rose-50", sub: kpis.overdueTasks > 0 ? "Needs attention" : "All clear!" },
            { label: "Pending Approvals", value: kpis.pendingApprovals || 0, icon: "⏳", color: "text-amber-600 bg-amber-50", sub: kpis.pendingApprovals > 0 ? "Action required" : "All caught up" },
          ].map((m, idx) => (
            <div key={idx} className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${m.color}`}>{m.icon}</div>
              </div>
              <p className="text-2xl font-black text-slate-900">{m.value}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Department Performance Comparison</h3>
            <p className="text-xs text-slate-400 mt-0.5">Task distribution and completion rates across departments</p>
          </div>
          {topDept && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
              🏆 Top: {topDept.name} ({topDept.completionRate}%)
            </span>
          )}
        </div>

        {departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-center">Members</th>
                  <th className="px-5 py-3.5 text-center">Total Tasks</th>
                  <th className="px-5 py-3.5 text-center">Completed</th>
                  <th className="px-5 py-3.5 text-center">Overdue</th>
                  <th className="px-5 py-3.5">Completion Rate</th>
                  <th className="px-5 py-3.5">Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-md">
                          {dept.code?.substring(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{dept.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{dept.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-slate-700">{dept.employeeCount}</td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-slate-700">{dept.totalTasks}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-bold text-emerald-600">{dept.completedTasks}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-sm font-bold ${dept.overdueTasks > 0 ? "text-rose-600" : "text-slate-400"}`}>
                        {dept.overdueTasks}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              dept.completionRate >= 80 ? "bg-emerald-500" :
                              dept.completionRate >= 50 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${dept.completionRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          dept.completionRate >= 80 ? "text-emerald-600" :
                          dept.completionRate >= 50 ? "text-amber-600" : "text-rose-600"
                        }`}>
                          {dept.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                      {dept.manager?.name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm text-slate-400">No department data available</p>
          </div>
        )}
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">📋</div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Task Report</h4>
              <p className="text-[10px] text-slate-400">Export all tasks with status, priority, assignment data</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Download a comprehensive CSV report of all tasks across departments including status distribution, assigned employees, due dates, and completion rates.
          </p>
          <Button
            onClick={() => handleExport("tasks")}
            isLoading={exporting === "tasks"}
            size="sm"
            className="w-full"
          >
            📥 Download Task Report
          </Button>
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">👥</div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Employee Report</h4>
              <p className="text-[10px] text-slate-400">Export user directory with roles, departments, status</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Download a complete employee directory CSV with roles, departments, account status, designations, and performance metrics for HR records.
          </p>
          <Button
            variant="secondary"
            onClick={() => handleExport("employees")}
            isLoading={exporting === "employees"}
            size="sm"
            className="w-full"
          >
            📥 Download Employee Report
          </Button>
        </div>
      </div>
    </div>
  );
}
