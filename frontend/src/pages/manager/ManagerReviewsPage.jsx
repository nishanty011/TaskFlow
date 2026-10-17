import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getPendingSubmissions, reviewSubmission } from "../../api/submission.api";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { PRIORITY_CONFIG } from "../../utils/statusColors";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";

export default function ManagerReviewsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Active review drawer / modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [decision, setDecision] = useState("approved"); // 'approved' | 'changes_requested'
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissionsData = async () => {
    try {
      setLoading(true);
      const res = await getPendingSubmissions();
      setSubmissions(res.data?.data?.submissions || []);
    } catch (err) {
      console.error("Failed to load submissions for review:", err);
      toast.error("Submissions load nahi ho paye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsData();
  }, []);

  const handleOpenReview = (sub) => {
    setSelectedSub(sub);
    setDecision("approved");
    setFeedback("");
    setRating(5);
  };

  const handleCloseReview = () => {
    if (isSubmitting) return;
    setSelectedSub(null);
  };

  // Submit Review (Approve or Request Changes)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    if (decision === "changes_requested" && !feedback.trim()) {
      toast.error("Please explain what changes are requested before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewSubmission(selectedSub._id, {
        status: decision,
        feedback: feedback.trim() || (decision === "approved" ? "Deliverable approved. Excellent work!" : "Changes requested."),
        rating: decision === "approved" ? rating : null,
      });

      toast.success(
        decision === "approved"
          ? "Deliverable approved! Task marked completed ✓"
          : "Changes requested from employee."
      );

      handleCloseReview();
      fetchSubmissionsData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Review submit nahi ho paya");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const q = search.toLowerCase();
    const taskTitleMatch = s.task?.title?.toLowerCase().includes(q);
    const empMatch = s.employee?.name?.toLowerCase().includes(q);
    return taskTitleMatch || empMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Deliverable Verification & QA
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Review Submitted Deliverables
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect versioned submissions (v1, v2), evaluate employee deliverables, provide actionable feedback, and award 1-5 star quality scorecards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manager/tasks"
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              ← Task Board
            </Link>
            <Link
              to="/manager/dashboard"
              className="px-4 py-2.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 shadow-sm transition-all"
            >
              Manager Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by task title or submitter name..."
            className="w-full px-4 py-2.5 pl-10 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Pending Reviews:</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
            {submissions.length}
          </span>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton count={3} />
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const prio = PRIORITY_CONFIG[sub.task?.priority] || PRIORITY_CONFIG.medium;

            return (
              <div
                key={sub._id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Task & Submitter Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0">
                    {sub.employee?.name?.charAt(0) || "E"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                        Version {sub.version || 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prio.bg} ${prio.text}`}>
                        {prio.label}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Submitted {timeAgo(sub.createdAt)}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {sub.task?.title || "Task Deliverable"}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Submitted by:{" "}
                      <span className="font-bold text-slate-800">{sub.employee?.name}</span>{" "}
                      ({sub.employee?.designation || "Team Member"})
                    </p>

                    {/* Employee Submission Note */}
                    {sub.note && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                        <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                          Employee Note:
                        </span>
                        "{sub.note}"
                      </div>
                    )}

                    {/* Attachments preview */}
                    {sub.files && sub.files.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Deliverables ({sub.files.length}):
                        </span>
                        {sub.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 text-xs font-semibold border border-slate-200 transition-colors"
                          >
                            <span>📎</span>
                            <span className="truncate max-w-[150px]">{file.name || `File ${idx + 1}`}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Review Action CTA */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-end flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block lg:text-right">
                    Due: {formatDate(sub.task?.dueDate)}
                  </span>
                  <button
                    onClick={() => handleOpenReview(sub)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Inspect & Review</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-12 shadow-sm text-center">
          <EmptyState
            icon="🎉"
            title="All Deliverables Reviewed!"
            description="There are currently no employee submissions awaiting your review in this department."
            action={
              <Link
                to="/manager/tasks"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Go to Task Board →
              </Link>
            }
          />
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE REVIEW MODAL (Split View & Feedback Form)
          ========================================================================= */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={handleCloseReview}
          title={`Review Deliverable — ${selectedSub.task?.title || "Task"}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Submitter & Version Header */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center">
                  {selectedSub.employee?.name?.charAt(0) || "E"}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedSub.employee?.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedSub.employee?.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                  Version {selectedSub.version || 1}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  Submitted {timeAgo(selectedSub.createdAt)}
                </span>
              </div>
            </div>

            {/* Note & Files */}
            {selectedSub.note && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Employee Delivery Note</label>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedSub.note}
                </div>
              </div>
            )}

            {/* Attachments */}
            {selectedSub.files && selectedSub.files.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Uploaded Deliverable Files</label>
                <div className="space-y-1.5">
                  {selectedSub.files.map((f, idx) => (
                    <a
                      key={idx}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>📄</span>
                        <span className="font-semibold text-slate-800 group-hover:text-brand-600 truncate">
                          {f.name || `File ${idx + 1}`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-brand-600 flex-shrink-0">
                        Open File ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Toggle: Approve vs Request Changes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Verification Decision <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision("approved")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    decision === "approved"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <span>✓</span> Approve & Complete Task
                </button>

                <button
                  type="button"
                  onClick={() => setDecision("changes_requested")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    decision === "changes_requested"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <span>↺</span> Request Changes
                </button>
              </div>
            </div>

            {/* Quality Scorecard Rating (if approved) */}
            {decision === "approved" && (
              <div className="space-y-1.5 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-2xl">
                <label className="text-xs font-bold text-amber-900 block">
                  Quality Scorecard Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={(hoverRating || rating) >= star ? "text-amber-500" : "text-slate-300"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-800 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>
            )}

            {/* Feedback Message */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Feedback & Manager Comments{" "}
                {decision === "changes_requested" && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                required={decision === "changes_requested"}
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  decision === "approved"
                    ? "Add an optional commendation or quality feedback..."
                    : "Specify the exact revisions or missing checklist items required..."
                }
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseReview}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 ${
                  decision === "approved"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/20"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Review...
                  </>
                ) : decision === "approved" ? (
                  "Confirm Approval ✓"
                ) : (
                  "Submit Changes Requested ↺"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
