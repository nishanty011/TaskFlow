import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getTasks, getTaskById, updateChecklist, updateTaskStatus, addTaskComment } from "../../api/task.api";
import SubmitDeliverableModal from "../../components/tasks/SubmitDeliverableModal";
import TaskTimeline from "../../components/tasks/TaskTimeline";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from "../../utils/statusColors";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // 'all' | 'in_progress' | 'changes_requested' | 'under_review' | 'completed'

  // Submit modal
  const [submitTask, setSubmitTask] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Detail drawer
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [taskComments, setTaskComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Updating checklist state map
  const [togglingItem, setTogglingItem] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks({ limit: 100 });
      setTasks(res.data?.data?.tasks || []);
    } catch (err) {
      console.error("Failed to load employee tasks:", err);
      toast.error("Tasks load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Live checklist toggle with optimistic state update
  const handleToggleChecklist = async (task, item) => {
    if (task.status === "completed" || task.status === "under_review") {
      toast.error("Checklist locked hai jab tak task under review ya complete ho");
      return;
    }

    const nextDone = !item.done;
    const itemKey = `${task._id}-${item._id}`;
    setTogglingItem(itemKey);

    // Optimistic calculation
    const updatedChecklist = task.checklist.map((c) =>
      c._id === item._id ? { ...c, done: nextDone } : c
    );
    const totalWeight = updatedChecklist.reduce((sum, c) => sum + (c.weight || 0), 0);
    const completedWeight = updatedChecklist
      .filter((c) => c.done)
      .reduce((sum, c) => sum + (c.weight || 0), 0);
    const nextProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    // Update state immediately
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id
          ? { ...t, checklist: updatedChecklist, progress: nextProgress }
          : t
      )
    );

    if (selectedTask?._id === task._id) {
      setSelectedTask((prev) => ({
        ...prev,
        checklist: updatedChecklist,
        progress: nextProgress,
      }));
    }

    try {
      const res = await updateChecklist(task._id, { itemId: item._id, done: nextDone });
      const serverChecklist = res.data?.data?.checklist;
      const serverProgress = res.data?.data?.progress;

      if (serverChecklist) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id
              ? { ...t, checklist: serverChecklist, progress: serverProgress }
              : t
          )
        );
        if (selectedTask?._id === task._id) {
          setSelectedTask((prev) => ({
            ...prev,
            checklist: serverChecklist,
            progress: serverProgress,
          }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Checklist update nahi ho payi");
      // Revert
      fetchTasks();
    } finally {
      setTogglingItem(null);
    }
  };

  // Start working transition (assigned -> in_progress)
  const handleStartWorking = async (task) => {
    try {
      await updateTaskStatus(task._id, "in_progress");
      toast.success("Task started! Status changed to 'In Progress' 🚀");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status change nahi ho paya");
    }
  };

  // Open Drawer and load comments
  const handleOpenDrawer = async (task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
    setTaskComments([]);
    try {
      const res = await getTaskById(task._id);
      if (res.data?.data?.comments) {
        setTaskComments(res.data.data.comments);
      }
    } catch {
      // ignore
    }
  };

  // Add Comment inside Drawer
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    setSubmittingComment(true);
    try {
      const res = await addTaskComment(selectedTask._id, { message: commentText.trim() });
      toast.success("Comment added! 💬");
      const newComment = res.data?.data?.comment;
      if (newComment) {
        setTaskComments((prev) => [...prev, newComment]);
      }
      setCommentText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Comment add nahi ho saka");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Open submit deliverable modal
  const handleOpenSubmit = (task) => {
    setSubmitTask(task);
    setIsSubmitOpen(true);
  };

  // Due date urgency helper
  const getDeadlineUrgency = (dueDate, status) => {
    if (!dueDate || status === "completed") return null;
    const diffHours = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        label: `Overdue by ${Math.abs(Math.round(diffHours))}h`,
        style: "bg-rose-100 text-rose-700 border-rose-300 animate-pulse",
      };
    }
    if (diffHours <= 24) {
      return {
        label: `Due in ${Math.round(diffHours)}h`,
        style: "bg-amber-100 text-amber-700 border-amber-300 font-bold",
      };
    }
    const days = Math.ceil(diffHours / 24);
    return {
      label: `Due in ${days} days`,
      style: "bg-slate-100 text-slate-600 border-slate-200",
    };
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(q);
    const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q));
    const prioMatch = !priorityFilter || t.priority === priorityFilter;

    let tabMatch = true;
    if (statusTab === "active") {
      tabMatch = t.status === "assigned" || t.status === "in_progress";
    } else if (statusTab === "changes_requested") {
      tabMatch = t.status === "changes_requested";
    } else if (statusTab === "under_review") {
      tabMatch = t.status === "under_review" || t.status === "submitted";
    } else if (statusTab === "completed") {
      tabMatch = t.status === "completed";
    }

    return (titleMatch || tagMatch) && prioMatch && tabMatch;
  });

  // Tab count badges
  const activeCount = tasks.filter((t) => t.status === "assigned" || t.status === "in_progress").length;
  const changesCount = tasks.filter((t) => t.status === "changes_requested").length;
  const reviewCount = tasks.filter((t) => t.status === "under_review" || t.status === "submitted").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Assigned Tasks
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track weighted checklist items, manage active assignments, and submit deliverables for review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employee/submissions"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <span>📦</span>
            <span>View Submissions History</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: "all", label: "All Tasks", count: tasks.length },
            { id: "active", label: "Active & In Progress", count: activeCount },
            { id: "changes_requested", label: "Revision Needed", count: changesCount, alert: changesCount > 0 },
            { id: "under_review", label: "Under Review", count: reviewCount },
            { id: "completed", label: "Completed", count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                statusTab === tab.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100/80 border border-slate-200/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  statusTab === tab.id
                    ? "bg-white/20 text-white"
                    : tab.alert
                    ? "bg-rose-100 text-rose-700 animate-pulse"
                    : "bg-slate-200/70 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Priority Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
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
              placeholder="Search tasks by title, keywords or tags..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton count={4} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks found"
          message={
            search || priorityFilter || statusTab !== "all"
              ? "Aapke search filters ke according koi task match nahi hua."
              : "Abhi aapko koi task assign nahi kiya gaya hai. Department manager ke assign karne ka wait karein."
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTasks.map((task) => {
            const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.assigned;
            const prioCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const urgency = getDeadlineUrgency(task.dueDate, task.status);

            const checklistDoneCount = (task.checklist || []).filter((c) => c.done).length;
            const totalChecklist = (task.checklist || []).length;

            return (
              <div
                key={task._id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Badges & Urgency */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Priority */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${prioCfg.bg} ${prioCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prioCfg.dot}`} />
                        {prioCfg.label}
                      </span>

                      {/* Status */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Deadline urgency indicator */}
                    {urgency && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${urgency.style}`}>
                        ⏰ {urgency.label}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => handleOpenDrawer(task)}
                    className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5">
                    {task.description || "No description provided."}
                  </p>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-600 text-[11px]">
                        Overall Progress
                      </span>
                      <span className="font-extrabold text-brand-600 tabular-nums">
                        {task.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (task.progress || 0) === 100
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-brand-500 to-indigo-600"
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Weighted Checklist Widget */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="mt-4 space-y-2 bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider">
                          Checklist Items ({checklistDoneCount}/{totalChecklist})
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Click to toggle
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {task.checklist.map((item) => {
                          const itemKey = `${task._id}-${item._id}`;
                          const isToggling = togglingItem === itemKey;
                          const isLocked = task.status === "completed" || task.status === "under_review";

                          return (
                            <label
                              key={item._id}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                                item.done
                                  ? "bg-emerald-50/80 border border-emerald-200/60"
                                  : "bg-white hover:bg-slate-100/60 border border-slate-200/40"
                              } ${isLocked ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={item.done}
                                disabled={isLocked || isToggling}
                                onChange={() => handleToggleChecklist(task, item)}
                                className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 focus:ring-offset-0 transition cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`text-xs font-medium block truncate ${
                                    item.done
                                      ? "text-slate-400 line-through"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.title}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                                  item.done
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {item.weight}% wt
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Action CTAs */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <span>Manager: {task.assignedBy?.name || "Dept Lead"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDrawer(task)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Details
                    </button>

                    {/* Action depending on task status */}
                    {task.status === "assigned" && (
                      <button
                        onClick={() => handleStartWorking(task)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                      >
                        <span>▶</span>
                        <span>Start Working</span>
                      </button>
                    )}

                    {(task.status === "in_progress" || task.status === "changes_requested") && (
                      <button
                        onClick={() => handleOpenSubmit(task)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all flex items-center gap-1.5"
                      >
                        <span>📤</span>
                        <span>Submit Deliverable</span>
                      </button>
                    )}

                    {task.status === "under_review" && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1">
                        <span>⏳</span>
                        <span>In Review</span>
                      </span>
                    )}

                    {task.status === "completed" && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <span>✓</span>
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {isSubmitOpen && submitTask && (
        <SubmitDeliverableModal
          isOpen={isSubmitOpen}
          onClose={() => {
            setIsSubmitOpen(false);
            setSubmitTask(null);
          }}
          task={submitTask}
          onSubmitted={() => {
            fetchTasks();
          }}
        />
      )}

      {/* Task Detail Slide-over Drawer */}
      {isDrawerOpen && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                      {selectedTask.department?.name || "Department Task"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_CONFIG[selectedTask.priority]?.bg} ${PRIORITY_CONFIG[selectedTask.priority]?.text}`}>
                      {selectedTask.priority?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedTask.title}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Status and dates bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div className="font-extrabold text-slate-800 capitalize mt-0.5">
                    {selectedTask.status?.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Due Date</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {formatDate(selectedTask.dueDate)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Hours</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedTask.estimatedHours || 0} hrs
                  </div>
                </div>
              </div>

              {/* Task Progress Stepper & Lifecycle History */}
              <TaskTimeline
                taskId={selectedTask._id}
                currentStatus={selectedTask.status}
              />

              {/* Description */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Task Brief & Instructions
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedTask.description || "No extended brief available."}
                </div>
              </div>

              {/* Checklist */}
              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Checklist & Weights ({selectedTask.progress || 0}% Complete)
                  </h4>
                  <div className="space-y-2">
                    {selectedTask.checklist.map((item) => (
                      <div
                        key={item._id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                          item.done
                            ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-900"
                            : "bg-slate-50 border-slate-200/60 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.done}
                            disabled={selectedTask.status === "completed" || selectedTask.status === "under_review"}
                            onChange={() => handleToggleChecklist(selectedTask, item)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className={item.done ? "line-through text-slate-400" : "font-medium"}>
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                          {item.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Comments / Discussion */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Task Discussion & Questions ({taskComments.length})
                </h4>

                {/* Comments List */}
                {taskComments.length > 0 ? (
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {taskComments.map((c) => (
                      <div key={c._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{c.author?.name || "Team Member"}</span>
                          <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-slate-600 font-medium whitespace-pre-wrap">{c.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-3">No discussion comments yet. Be the first to post!</p>
                )}

                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask your manager a question or post an update..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Close
              </button>

              {(selectedTask.status === "in_progress" || selectedTask.status === "changes_requested") && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleOpenSubmit(selectedTask);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 text-white text-xs font-extrabold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>📤</span>
                  <span>Submit Deliverable</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
