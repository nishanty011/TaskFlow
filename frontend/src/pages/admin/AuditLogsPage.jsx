import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getActivities, getActivityStats } from "../../api/activity.api";
import { CardSkeleton } from "../../components/ui/Skeleton";

// Action icon & color mapping
const ACTION_CONFIG = {
  user_approved: { icon: "✅", label: "User Approved", color: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  user_rejected: { icon: "❌", label: "User Rejected", color: "bg-rose-500", bg: "bg-rose-50 text-rose-700" },
  task_created: { icon: "📋", label: "Task Created", color: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
  task_updated: { icon: "📝", label: "Task Updated", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  task_deleted: { icon: "🗑️", label: "Task Deleted", color: "bg-red-500", bg: "bg-red-50 text-red-700" },
  submission_created: { icon: "📦", label: "Submission Created", color: "bg-purple-500", bg: "bg-purple-50 text-purple-700" },
  submission_reviewed: { icon: "🔍", label: "Submission Reviewed", color: "bg-indigo-500", bg: "bg-indigo-50 text-indigo-700" },
  feedback_given: { icon: "💬", label: "Feedback Given", color: "bg-teal-500", bg: "bg-teal-50 text-teal-700" },
  user_suspended: { icon: "🚫", label: "User Suspended", color: "bg-orange-500", bg: "bg-orange-50 text-orange-700" },
  department_created: { icon: "🏢", label: "Department Created", color: "bg-sky-500", bg: "bg-sky-50 text-sky-700" },
  default: { icon: "📌", label: "Activity", color: "bg-slate-400", bg: "bg-slate-100 text-slate-600" },
};

const getConfig = (action) => ACTION_CONFIG[action] || ACTION_CONFIG.default;

// Time formatting
const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

// Safe rendering helpers to prevent object as React child errors
const getDepartmentLabel = (dept) => {
  if (!dept) return "";
  if (typeof dept === "string") return dept;
  if (typeof dept === "object") return dept.name || dept.code || "";
  return String(dept);
};

const getActorName = (actor) => {
  if (!actor) return "System";
  if (typeof actor === "string") return actor;
  if (typeof actor === "object") return actor.name || actor.email || "System";
  return String(actor);
};

const getActorRole = (actor) => {
  if (!actor || typeof actor !== "object") return "system";
  return actor.role || "system";
};

export default function AuditLogsPage() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [view, setView] = useState("timeline"); // timeline | table
  const limit = 20;

  const fetchData = useCallback(async (reset = false) => {
    try {
      if (reset) setLoading(true);
      const currentPage = reset ? 1 : page;
      const [logsRes, statsRes] = await Promise.all([
        getActivities({ page: currentPage, limit }),
        stats ? Promise.resolve({ data: { data: stats } }) : getActivityStats(),
      ]);

      const logs = Array.isArray(logsRes.data?.data?.activities)
        ? logsRes.data.data.activities
        : Array.isArray(logsRes.data?.data)
        ? logsRes.data.data
        : [];

      if (reset) {
        setActivities(logs);
        setPage(1);
      } else {
        setActivities((prev) => [...prev, ...logs]);
      }
      setHasMore(logs.length === limit);

      if (!stats) {
        const rawStats = statsRes.data?.data?.stats || statsRes.data?.data?.actionCounts || statsRes.data?.data || {};
        setStats(rawStats);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, stats]);

  useEffect(() => {
    fetchData(page === 1);
  }, [page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  };

  // Group activities by date
  const groupByDate = (acts) => {
    const groups = {};
    acts.forEach((act) => {
      const dateKey = new Date(act.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(act);
    });
    return groups;
  };

  const grouped = groupByDate(activities);

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              🛡️ Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete audit trail of all system actions — user approvals, task operations, and security events.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-xl p-0.5">
              {["timeline", "table"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    view === v
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v === "timeline" ? "⏱️ Timeline" : "📊 Table"}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setPage(1); fetchData(true); }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(
            stats.stats || stats.actionCounts || (typeof stats === "object" ? stats : {})
          )
            .filter(([action, count]) => action !== "stats" && typeof count !== "object")
            .slice(0, 4)
            .map(([action, count], idx) => {
              const config = getConfig(action);
              return (
                <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{config.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{String(count)}</p>
                </div>
              );
            })}
        </div>
      )}

      {/* Activity Content */}
      {view === "timeline" ? (
        /* Timeline View */
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, acts]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  📅 {date}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-medium">{acts.length} event{acts.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Activity items */}
              <div className="space-y-2">
                {acts.map((act, idx) => {
                  const config = getConfig(act.action);
                  const deptLabel = getDepartmentLabel(act.department);
                  const actorName = getActorName(act.actor);
                  const actorRole = getActorRole(act.actor);

                  return (
                    <div
                      key={act._id || idx}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Timeline dot */}
                        <div className={`w-3 h-3 rounded-full ${config.color} ring-4 ring-white shadow-sm mt-1 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} shrink-0`}>
                                {config.icon} {config.label}
                              </span>
                              {deptLabel && (
                                <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                                  {deptLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{timeAgo(act.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                            <span className="font-bold text-slate-900">{actorName}</span>
                            {" "}
                            <span className="text-slate-500">({actorRole})</span>
                            {" performed "}
                            <span className="font-semibold">{String(act.action || "").replace(/_/g, " ")}</span>
                            {act.entityType && (
                              <span className="text-slate-400"> on {typeof act.entityType === "object" ? "item" : String(act.entityType)}</span>
                            )}
                          </p>
                          {/* Meta info */}
                          {act.meta && typeof act.meta === "object" && Object.keys(act.meta).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {Object.entries(act.meta).slice(0, 3).map(([key, val]) => (
                                <span key={key} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg font-medium">
                                  {key}: {typeof val === "object" ? JSON.stringify(val) : String(val).substring(0, 40)}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1.5">{formatTime(act.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md transition-all"
              >
                Load More Logs
              </button>
            </div>
          )}

          {activities.length === 0 && (
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-12 text-center shadow-sm">
              <p className="text-4xl mb-4">🛡️</p>
              <h3 className="text-lg font-bold text-slate-800">No audit logs yet</h3>
              <p className="text-sm text-slate-400 mt-2">
                Activity will appear here as users perform actions in the system.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act, idx) => {
                  const config = getConfig(act.action);
                  return (
                    <tr key={act._id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.bg}`}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {getActorName(act.actor).charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{getActorName(act.actor)}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{getActorRole(act.actor)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {getDepartmentLabel(act.department) || "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 capitalize">
                        {typeof act.entityType === "object" ? "—" : String(act.entityType || "—")}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[11px] text-slate-600 font-medium">{timeAgo(act.createdAt)}</p>
                        <p className="text-[10px] text-slate-400">{formatTime(act.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="text-center border-t border-slate-100 py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-md transition-all"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
