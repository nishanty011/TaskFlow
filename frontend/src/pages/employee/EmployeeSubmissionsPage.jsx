import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMySubmissions } from "../../api/submission.api";
import SubmitDeliverableModal from "../../components/tasks/SubmitDeliverableModal";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { getFileUrl } from "../../utils/fileUrl";

// Helper for file sizes
function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Helper for file icons
function getFileIcon(mimeType = "", name = "") {
  if (mimeType.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return "🖼️";
  if (mimeType.includes("pdf") || /\.pdf$/i.test(name)) return "📄";
  if (mimeType.includes("zip") || mimeType.includes("compressed") || /\.(zip|rar|tar|gz)$/i.test(name)) return "📦";
  if (/\.(js|jsx|ts|tsx|py|html|css|json)$/i.test(name)) return "💻";
  return "📎";
}

export default function EmployeeSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Resubmit modal state
  const [resubmitTask, setResubmitTask] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Inspector modal state
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await getMySubmissions();
      setSubmissions(res.data?.data?.submissions || []);
    } catch (err) {
      console.error("Failed to fetch my submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenResubmit = (sub) => {
    if (!sub.task) {
      toast.error("Task information is unavailable");
      return;
    }
    setResubmitTask(sub.task);
    setIsSubmitOpen(true);
  };

  // KPIs
  const totalSubmissions = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const changesCount = submissions.filter((s) => s.status === "changes_requested").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const ratedSubs = submissions.filter((s) => s.rating && s.rating > 0);
  const avgRating = ratedSubs.length > 0
    ? (ratedSubs.reduce((acc, s) => acc + s.rating, 0) / ratedSubs.length).toFixed(1)
    : "5.0";

  // Filter
  const filteredSubmissions = submissions.filter((s) => {
    const q = search.toLowerCase();
    const taskTitleMatch = s.task?.title?.toLowerCase().includes(q);
    const noteMatch = s.note?.toLowerCase().includes(q);
    const statusMatch = statusFilter === "all" || s.status === statusFilter;
    return (taskTitleMatch || noteMatch) && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Deliverable Submissions
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review your submission history, version iterations, and manager quality scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employee/tasks"
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
          >
            <span>📋</span>
            <span>Go to My Tasks</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Deliveries</span>
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 text-base">📤</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalSubmissions}</div>
          <span className="text-[10px] text-slate-400 font-medium">All versions logged</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved</span>
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 text-base">✨</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</div>
          <span className="text-[10px] text-emerald-700/70 font-bold">
            {totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 100}% approval rate
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revision Requests</span>
            <span className="p-2 rounded-2xl bg-rose-50 text-rose-600 text-base">⚠️</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{changesCount}</div>
          <span className="text-[10px] text-rose-500 font-semibold">
            {changesCount > 0 ? "Action required" : "Zero active revisions"}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Quality Score</span>
            <span className="p-2 rounded-2xl bg-amber-50 text-amber-600 text-base">⭐</span>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{avgRating} <span className="text-xs font-bold text-slate-400">/ 5.0</span></div>
          <span className="text-[10px] text-amber-600/80 font-bold">
            {ratedSubs.length} manager reviews
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All Submissions" },
            { id: "pending", label: "Awaiting Review", alert: pendingCount > 0 },
            { id: "changes_requested", label: "Changes Requested", alert: changesCount > 0 },
            { id: "approved", label: "Approved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deliverables..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton count={3} />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No deliverable submissions found"
          message={
            search || statusFilter !== "all"
              ? "Filter criteria ke mutabik koi submission nahi mila."
              : "Aapne abhi tak koi deliverable submit nahi kiya hai. My Tasks page se deliverable submit karein."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const isApproved = sub.status === "approved";
            const isChangesRequested = sub.status === "changes_requested";
            const isPending = sub.status === "pending";

            return (
              <div
                key={sub._id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Version Badge */}
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-brand-200 text-brand-700 font-extrabold text-xs">
                      v{sub.version || 1}
                    </span>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm hover:text-brand-600 transition-colors">
                        {sub.task?.title || "Assigned Task Deliverable"}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Submitted {timeAgo(sub.createdAt)} • {formatDate(sub.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Under Review
                      </span>
                    )}

                    {isApproved && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
                        <span>✨</span>
                        Approved
                      </span>
                    )}

                    {isChangesRequested && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5">
                        <span>⚠️</span>
                        Changes Requested
                      </span>
                    )}

                    {/* Progress Claimed */}
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {sub.progressClaimed || 100}% Claimed
                    </span>
                  </div>
                </div>

                {/* Delivery Note */}
                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/50">
                  <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                    Delivery Note:
                  </div>
                  <p className="whitespace-pre-wrap font-medium">{sub.note || "No note provided."}</p>
                </div>

                {/* Attachments Section */}
                {(() => {
                  const filesList = (sub.files && sub.files.length > 0) ? sub.files : (sub.attachments || []);
                  if (filesList.length === 0) return null;

                  return (
                    <div>
                      <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
                        Deliverable Files ({filesList.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {filesList.map((file, idx) => (
                          <a
                            key={idx}
                            href={getFileUrl(file.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-sm transition-all group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {getFileIcon(file.mime || file.mimeType, file.name || file.originalName)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-brand-600 transition-colors">
                                {file.name || file.originalName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-brand-600">
                              ⬇
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Manager Evaluation Card (if reviewed) */}
                {(sub.reviewComment || sub.rating) && (
                  <div className={`p-4 rounded-2xl border ${
                    isApproved
                      ? "bg-emerald-50/50 border-emerald-200/70"
                      : "bg-rose-50/50 border-rose-200/70"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">
                          Manager Feedback from {sub.reviewedBy?.name || "Manager"}
                        </span>
                        {sub.reviewedAt && (
                          <span className="text-[10px] text-slate-400">
                            • {timeAgo(sub.reviewedAt)}
                          </span>
                        )}
                      </div>

                      {/* Star Rating */}
                      {sub.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < sub.rating ? "text-amber-500" : "text-slate-300"}>
                              ★
                            </span>
                          ))}
                          <span className="text-slate-700 ml-1">({sub.rating}/5)</span>
                        </div>
                      )}
                    </div>

                    {/* Review message */}
                    {sub.reviewComment && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                        "{sub.reviewComment}"
                      </p>
                    )}

                    {/* Scorecard mini badges */}
                    {sub.scorecard && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/40 text-[10px]">
                        <div className="p-1.5 rounded-xl bg-white/80 border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Quality</span>
                          <span className="font-extrabold text-slate-800">{sub.scorecard.quality || sub.rating}/5 ⭐</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white/80 border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Completeness</span>
                          <span className="font-extrabold text-slate-800">{sub.scorecard.completeness || sub.rating}/5 ⭐</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white/80 border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Adherence</span>
                          <span className="font-extrabold text-slate-800">{sub.scorecard.adherence || sub.rating}/5 ⭐</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white/80 border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Timeliness</span>
                          <span className="font-extrabold text-slate-800">{sub.scorecard.timeliness || sub.rating}/5 ⭐</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  {isChangesRequested && (
                    <button
                      onClick={() => handleOpenResubmit(sub)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>🔄</span>
                      <span>Submit Revision (v{(sub.version || 1) + 1})</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    Inspect Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Resubmission Modal */}
      {isSubmitOpen && resubmitTask && (
        <SubmitDeliverableModal
          isOpen={isSubmitOpen}
          onClose={() => {
            setIsSubmitOpen(false);
            setResubmitTask(null);
          }}
          task={resubmitTask}
          onSubmitted={() => {
            fetchSubmissions();
          }}
        />
      )}

      {/* Inspect Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-brand-600">
                  Deliverable Version v{selectedSub.version || 1}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedSub.task?.title || "Deliverable Details"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Employee Delivery Notes
                </span>
                <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedSub.note || "No notes"}
                </p>
              </div>

              {selectedSub.attachments && selectedSub.attachments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                    Attached Artifacts ({selectedSub.attachments.length})
                  </span>
                  <div className="space-y-2">
                    {selectedSub.attachments.map((file, i) => (
                      <a
                        key={i}
                        href={`http://localhost:5000${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all"
                      >
                        <span className="font-bold text-slate-800 truncate mr-2">
                          {file.originalName}
                        </span>
                        <span className="text-[10px] text-brand-600 font-extrabold">
                          Download ↗
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedSub.reviewComment && (
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-brand-100">
                  <span className="text-[10px] font-bold text-brand-600 uppercase block mb-1">
                    Manager Review Feedback
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedSub.reviewComment}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
