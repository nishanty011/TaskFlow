import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getTasks, archiveTask, addTaskComment } from "../../api/task.api";
import { getEmployees } from "../../api/user.api";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from "../../utils/statusColors";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

// Kanban status columns config
const KANBAN_COLUMNS = [
  { id: "assigned", label: "Assigned", color: "border-slate-300 bg-slate-50 text-slate-700", dot: "bg-slate-400" },
  { id: "in_progress", label: "In Progress", color: "border-blue-300 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { id: "under_review", label: "Under Review", color: "border-amber-300 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  { id: "changes_requested", label: "Changes Requested", color: "border-rose-300 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  { id: "completed", label: "Completed", color: "border-emerald-300 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
];

export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Employees for filtering
  const [employees, setEmployees] = useState([]);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const [tasksRes, empRes] = await Promise.all([
        getTasks({ limit: 100 }),
        getEmployees().catch(() => ({ data: { data: { employees: [] } } })),
      ]);

      setTasks(tasksRes.data?.data?.tasks || []);
      setEmployees(empRes.data?.data?.employees || []);
    } catch (err) {
      console.error("Failed to load department tasks:", err);
      toast.error("Tasks load nahi ho paye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  // Archive task
  const handleArchive = async (taskId) => {
    if (!window.confirm("Are you sure you want to archive this task?")) return;
    try {
      await archiveTask(taskId);
      toast.success("Task archived");
      fetchTasksData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Archive nahi ho paya");
    }
  };

  // Add Comment on selected task
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    setSubmittingComment(true);
    try {
      await addTaskComment(selectedTask._id, { content: commentText.trim() });
      toast.success("Comment added");
      setCommentText("");
      // Refresh task
      fetchTasksData();
    } catch (err) {
      toast.error("Comment add nahi ho paya");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(q);
    const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q));
    const prioMatch = !filterPriority || t.priority === filterPriority;
    const assigneeMatch = !filterAssignee || t.assignedTo?._id === filterAssignee;
    return (titleMatch || tagMatch) && prioMatch && assigneeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Work Delegation & Execution
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Department Task Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create weighted checklist tasks, manage Kanban workflow stages, and verify employee deliverable submissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manager/reviews"
              className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>🔍 Review Deliverables</span>
            </Link>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>+ Assign New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title or #tags..."
            className="w-full px-4 py-2 pl-9 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
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

        {/* Priority & Assignee filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="">All Assignees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Kanban / List Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CardSkeleton count={5} />
        </div>
      ) : viewMode === "kanban" ? (
        /* =========================================================================
            KANBAN BOARD VIEW
            ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => {
              if (col.id === "under_review") {
                return t.status === "under_review" || t.status === "submitted";
              }
              return t.status === col.id;
            });

            return (
              <div
                key={col.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-4 shadow-sm flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";

                    return (
                      <div
                        key={task._id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDetailOpen(true);
                        }}
                        className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs hover:shadow-md hover:border-brand-200 transition-all cursor-pointer space-y-3 group"
                      >
                        {/* Priority & Overdue */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prio.bg} ${prio.text}`}
                          >
                            {prio.label}
                          </span>
                          {isOverdue && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold animate-pulse">
                              Overdue
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Weighted Checklist Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span>Checklist Progress</span>
                            <span className="font-bold text-slate-700">{task.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer: Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 truncate max-w-[100px]">
                            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                              {task.assignedTo?.name?.charAt(0) || "E"}
                            </div>
                            <span className="truncate text-slate-600 font-medium text-[10px]">
                              {task.assignedTo?.name?.split(" ")[0] || "Unassigned"}
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400">
                            {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-36 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                      <span>No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
            LIST / TABLE VIEW
            ========================================================================= */
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">Task Title</th>
                  <th className="py-4 px-6">Assignee</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Progress</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.assigned;

                  return (
                    <tr
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center">
                            {task.assignedTo?.name?.charAt(0) || "E"}
                          </div>
                          <span className="font-semibold text-slate-700">{task.assignedTo?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prio.bg} ${prio.text}`}>
                          {prio.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="font-bold text-slate-700 text-[11px]">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleArchive(task._id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Archive Task"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TASK DETAIL SLIDE-OVER DRAWER
          ========================================================================= */}
      {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsDetailOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in">
              <div>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (PRIORITY_CONFIG[selectedTask.priority] || PRIORITY_CONFIG.medium).bg
                      } ${(PRIORITY_CONFIG[selectedTask.priority] || PRIORITY_CONFIG.medium).text}`}
                    >
                      {selectedTask.priority?.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Task Detail
                    </span>
                  </div>

                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                      {selectedTask.title}
                    </h2>
                    {selectedTask.description && (
                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>

                  {/* Task Meta Attributes */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assignee
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {selectedTask.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Due Date
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {formatDate(selectedTask.dueDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Current Status
                      </span>
                      <span className="font-bold text-brand-600 mt-0.5 block capitalize">
                        {selectedTask.status?.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Estimated Hours
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {selectedTask.estimatedHours || 0} hrs
                      </span>
                    </div>
                  </div>

                  {/* Weighted Checklist */}
                  {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Weighted Checklist ({selectedTask.progress || 0}% Complete)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {selectedTask.checklist.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                              item.done
                                ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 line-through"
                                : "bg-slate-50 border-slate-200/80 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.done ? "bg-emerald-500 text-white" : "border border-slate-300"}`}>
                                {item.done ? "✓" : ""}
                              </span>
                              <span>{item.title}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {item.weight}% weight
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment Feed */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      Task Comments & Discussion
                    </span>
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add an internal comment or instruction..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <Link
                  to="/manager/reviews"
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex-1 text-center"
                >
                  Review Submissions
                </Link>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition-all flex-1"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={fetchTasksData}
      />
    </div>
  );
}
