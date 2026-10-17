import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import { reviewSubmission } from "../../api/submission.api";
import { timeAgo } from "../../utils/formatDate";
import { getFileUrl, isPdfFile, isImageFile } from "../../utils/fileUrl";

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  submission,
  onReviewed,
}) {
  const [decision, setDecision] = useState("approved"); // 'approved' | 'changes_requested'
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setDecision("approved");
      setFeedback("");
      setRating(5);
      setHoverRating(0);
      setSelectedFileIndex(0);
    }
  }, [isOpen, submission]);

  if (!submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission._id) return;

    if (decision === "changes_requested" && !feedback.trim()) {
      toast.error("Please explain what changes or revisions are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reviewSubmission(submission._id, {
        status: decision,
        feedback:
          feedback.trim() ||
          (decision === "approved"
            ? "Deliverable approved. Excellent work!"
            : "Changes requested."),
        rating: decision === "approved" ? rating : null,
      });

      toast.success(
        decision === "approved"
          ? "Deliverable approved! Task marked completed ✓"
          : "Changes requested from employee. ↺"
      );

      if (onReviewed) {
        onReviewed(res.data?.data?.submission);
      }
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title="Review Deliverable Submission"
      description="Inspect deliverable files, evaluate quality, and provide review feedback."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header Task & Employee Badge */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-extrabold uppercase">
              Version {submission.version || 1}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Submitted {timeAgo(submission.createdAt)}
            </span>
          </div>

          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
            {submission.task?.title || "Task Deliverable"}
          </h3>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center">
              {submission.employee?.name?.charAt(0) || "E"}
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {submission.employee?.name || "Employee"}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              {submission.employee?.designation || "Team Member"}
            </span>
          </div>
        </div>

        {/* Employee Note */}
        {submission.note && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Employee Delivery Note
            </label>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
              "{submission.note}"
            </div>
          </div>
        )}

        {/* Attached Deliverable Files & Live Preview */}
        {(() => {
          const files = submission.files || submission.attachments || [];
          if (files.length === 0) return null;
          const activeFile = files[selectedFileIndex] || files[0];
          const activeFileUrl = getFileUrl(activeFile.url);

          return (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Deliverable Files ({files.length})
                </label>
                <div className="flex items-center gap-2">
                  <a
                    href={activeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Open in New Tab</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={activeFileUrl}
                    download={activeFile.name || "deliverable"}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Download</span>
                    <span>📥</span>
                  </a>
                </div>
              </div>

              {/* Multi-file selector pills if > 1 file */}
              {files.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {files.map((file, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        selectedFileIndex === idx
                          ? "bg-brand-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      <span>📄</span>
                      <span className="truncate max-w-[150px]">{file.name || `File ${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* In-Modal Live Document Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                {isPdfFile(activeFile.url, activeFile.name) ? (
                  <div className="w-full h-[360px] sm:h-[420px] bg-white">
                    <iframe
                      src={`${activeFileUrl}#toolbar=1`}
                      className="w-full h-full border-0"
                      title={activeFile.name || "Deliverable PDF Preview"}
                    />
                  </div>
                ) : isImageFile(activeFile.url, activeFile.name) ? (
                  <div className="flex items-center justify-center p-4 max-h-[380px] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={activeFileUrl}
                      alt={activeFile.name || "Deliverable Image"}
                      className="max-h-[360px] w-auto object-contain rounded-xl shadow-md"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <span className="text-4xl block">📄</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeFile.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Document ready for verification. Click below to view.
                    </p>
                    <a
                      href={activeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition-all mt-2"
                    >
                      <span>Open Document in Browser</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Decision Toggle: Approve vs Request Changes */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Verification Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("approved")}
              className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                decision === "approved"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white"
              }`}
            >
              <span>✓</span> Approve & Complete Task
            </button>

            <button
              type="button"
              onClick={() => setDecision("changes_requested")}
              className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                decision === "changes_requested"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm ring-2 ring-rose-500/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white"
              }`}
            >
              <span>↺</span> Request Changes
            </button>
          </div>
        </div>

        {/* Quality Scorecard Rating (if approved) */}
        {decision === "approved" && (
          <div className="space-y-1.5 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl">
            <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
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
                  <span
                    className={
                      (hoverRating || rating) >= star
                        ? "text-amber-500"
                        : "text-slate-300 dark:text-slate-600"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Feedback & Manager Remarks{" "}
            {decision === "changes_requested" && (
              <span className="text-rose-500">*</span>
            )}
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
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
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
  );
}
