import { useState, useEffect } from "react";
import { getTaskTimeline } from "../../api/task.api";
import { formatDate, timeAgo } from "../../utils/formatDate";

const STEPS = [
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Review" },
  { id: "completed", label: "Completed" },
];

export default function TaskTimeline({ taskId, currentStatus }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    let isMounted = true;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const res = await getTaskTimeline(taskId);
        if (isMounted) {
          setEvents(res.data?.data?.events || []);
        }
      } catch (err) {
        console.error("Failed to load task timeline:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimeline();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  // Determine active step index
  const getStepIndex = (status) => {
    switch (status) {
      case "assigned":
        return 0;
      case "in_progress":
        return 1;
      case "submitted":
        return 2;
      case "under_review":
        return 3;
      case "changes_requested":
        return 2; // looped back to submission
      case "completed":
        return 4;
      default:
        return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-4">
      {/* Visual Stepper Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700">
        <div className="flex items-center justify-between relative">
          {/* Background Track Line */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0" />
          
          {/* Active Fill Line */}
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500 -z-0"
            style={{
              width: `${(activeIdx / (STEPS.length - 1)) * 100}%`,
              maxWidth: "calc(100% - 32px)",
            }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeIdx || (idx === 4 && currentStatus === "completed");
            const isCurrent = idx === activeIdx && currentStatus !== "completed";

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group cursor-default"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all shadow-sm ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/20"
                      : isCurrent
                      ? "bg-brand-600 text-white shadow-brand-500/30 ring-4 ring-brand-500/20 animate-pulse"
                      : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${
                    isCurrent
                      ? "text-brand-600 dark:text-brand-400 font-black"
                      : isCompleted
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {currentStatus === "changes_requested" && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5">
            <span>↺</span>
            <span>Manager requested changes. Please review comments and resubmit.</span>
          </div>
        )}
      </div>

      {/* Activity / Event Timeline Track */}
      <div>
        <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Lifecycle History
        </h5>

        {loading ? (
          <div className="space-y-2 py-2">
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {events.map((evt, idx) => {
              const isApproval = evt.type === "approved" || evt.type === "completed";
              const isRevision = evt.type === "changes_requested";
              const isSubmission = evt.type === "submitted";

              return (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <span
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-[8px] ${
                      isApproval
                        ? "bg-emerald-500 text-white"
                        : isRevision
                        ? "bg-rose-500 text-white"
                        : isSubmission
                        ? "bg-amber-500 text-white"
                        : "bg-brand-600 text-white"
                    }`}
                  >
                    {isApproval ? "✓" : isRevision ? "↺" : isSubmission ? "📤" : "•"}
                  </span>

                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {evt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {timeAgo(evt.timestamp)}
                      </span>
                    </div>

                    {evt.actor && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        by <span className="font-semibold text-slate-700 dark:text-slate-300">{evt.actor.name}</span>
                      </p>
                    )}

                    {evt.meta?.note && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                        "{evt.meta.note}"
                      </p>
                    )}

                    {evt.meta?.message && (
                      <div className="mt-1.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[10px] text-slate-400 uppercase block mb-0.5">
                          Feedback Remarks:
                        </span>
                        {evt.meta.message}
                      </div>
                    )}

                    {evt.meta?.rating && (
                      <div className="mt-1 flex items-center gap-1 text-amber-500 text-xs">
                        <span>{"★".repeat(evt.meta.rating)}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          ({evt.meta.rating}/5 stars)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
