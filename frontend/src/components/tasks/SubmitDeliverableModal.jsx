import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import { createSubmission } from "../../api/submission.api";

export default function SubmitDeliverableModal({ isOpen, onClose, task, onSubmitted }) {
  const [note, setNote] = useState("");
  const [progressClaimed, setProgressClaimed] = useState(100);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 5) {
      toast.error("You can upload a maximum of 5 files per deliverable");
      return;
    }
    setFiles([...files, ...selected]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim() && files.length === 0) {
      toast.error("Please add a note or attach deliverable files");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("taskId", task._id);
      formData.append("note", note.trim());
      formData.append("progressClaimed", progressClaimed);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await createSubmission(formData);
      toast.success("Deliverable submitted for manager review! 🎉");
      onSubmitted?.();
      onClose();

      // Reset
      setNote("");
      setProgressClaimed(100);
      setFiles([]);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission upload nahi ho paya";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submit Deliverable — ${task.title}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-brand-200/60 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block truncate max-w-xs">{task.title}</span>
            <span className="text-[11px] text-slate-500">
              Current Checklist: {task.progress || 0}% complete
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 font-extrabold text-[10px]">
            Ready for Review
          </span>
        </div>

        {/* Delivery Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Deliverable Overview & Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Summarize completed items, key outcomes, deployment links, or notes for your manager..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none font-medium"
          />
        </div>

        {/* Progress Claimed Slider */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700">Claimed Task Completion</label>
            <span className="font-extrabold text-brand-600 text-sm tabular-nums">
              {progressClaimed}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={progressClaimed}
            onChange={(e) => setProgressClaimed(Number(e.target.value))}
            className="w-full accent-brand-600 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">
            Submit with 100% when all requirements and checklist steps are fulfilled.
          </p>
        </div>

        {/* File Attachments (Multi-file upload) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Attach Files & Deliverables (PDF, ZIP, DOC, PNG - Max 5 files)
          </label>

          <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="text-2xl block mb-1">📤</span>
            <p className="text-xs font-bold text-slate-700">
              Click to browse or drag and drop deliverables
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Code archives, screenshots, documents up to 25MB each
            </p>
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>📎</span>
                    <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-rose-500 font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Deliverable...
              </>
            ) : (
              "Send to Manager for Review 🚀"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
