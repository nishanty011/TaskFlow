import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import { createTask } from "../../api/task.api";
import { getEmployees } from "../../api/user.api";

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  
  // Checklist items
  const [checklist, setChecklist] = useState([
    { title: "Review requirements and scope", weight: 30 },
    { title: "Develop core implementation", weight: 40 },
    { title: "Test and verify deliverables", weight: 30 },
  ]);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load department employees for assignee dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchDepts = async () => {
        try {
          setLoadingEmployees(true);
          const res = await getEmployees();
          const list = res.data?.data?.employees || [];
          setEmployees(list);
          if (list.length > 0 && !assignedTo) {
            setAssignedTo(list[0]._id);
          }
        } catch (err) {
          console.error("Failed to load employees for task assignment:", err);
          toast.error("Employees load nahi ho paye");
        } finally {
          setLoadingEmployees(false);
        }
      };
      fetchDepts();
    }
  }, [isOpen]);

  // Tags handlers
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Checklist handlers
  const handleAddChecklistItem = () => {
    setChecklist([...checklist, { title: "", weight: 10 }]);
  };

  const handleUpdateChecklist = (index, field, value) => {
    const updated = [...checklist];
    updated[index][field] = field === "weight" ? Math.max(1, parseInt(value) || 1) : value;
    setChecklist(updated);
  };

  const handleRemoveChecklistItem = (index) => {
    setChecklist(checklist.filter((_, idx) => idx !== index));
  };

  // Equalize weights to 100%
  const handleEqualizeWeights = () => {
    if (checklist.length === 0) return;
    const base = Math.floor(100 / checklist.length);
    const rem = 100 - base * checklist.length;
    const updated = checklist.map((item, idx) => ({
      ...item,
      weight: idx === 0 ? base + rem : base,
    }));
    setChecklist(updated);
  };

  const totalWeight = checklist.reduce((sum, item) => sum + (item.weight || 0), 0);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (!assignedTo) {
      toast.error("Please select an employee to assign this task");
      return;
    }
    if (!dueDate) {
      toast.error("Please pick a valid due date");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
        tags,
        checklist: checklist.filter((item) => item.title.trim().length > 0),
      });

      toast.success("Task assigned successfully! 🎉");
      onTaskCreated?.();
      onClose();

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setEstimatedHours("");
      setTags([]);
    } catch (err) {
      const msg = err.response?.data?.message || "Task create nahi ho paya";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign New Department Task">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design responsive UI components with TailwindCSS"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detailed Instructions & Scope
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, acceptance criteria, wireframe links, or key deliverables..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
          />
        </div>

        {/* Assignee & Priority (2-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assignee (Department Team) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={loadingEmployees}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium cursor-pointer"
            >
              {loadingEmployees ? (
                <option value="">Loading team members...</option>
              ) : employees.length === 0 ? (
                <option value="">No active employees found</option>
              ) : (
                employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.designation || "Member"})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium cursor-pointer"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🔵 Medium Priority</option>
              <option value="high">🟠 High Priority</option>
              <option value="urgent">🔴 Urgent (Immediate)</option>
            </select>
          </div>
        </div>

        {/* Due Date & Estimated Hours (2-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deadline Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Effort (Hours)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Tags Builder */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tags & Skills (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-brand-700 text-[11px] font-semibold"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-brand-400 hover:text-brand-600 ml-0.5"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "Add tags like 'UI', 'Backend', 'Bugfix'..." : ""}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-1"
            />
          </div>
        </div>

        {/* =========================================================================
            CHECKLIST ENGINE (Dynamic Weighted Items)
            ========================================================================= */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-xs font-bold text-slate-800 block">
                Weighted Checklist Items
              </label>
              <p className="text-[11px] text-slate-400">
                Weights calculate task completion % dynamically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  totalWeight === 100
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                Sum: {totalWeight}%
              </span>

              <button
                type="button"
                onClick={handleEqualizeWeights}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Equalize 100%
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  required
                  value={item.title}
                  onChange={(e) => handleUpdateChecklist(idx, "title", e.target.value)}
                  placeholder="Checklist step description..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={item.weight}
                    onChange={(e) => handleUpdateChecklist(idx, "weight", e.target.value)}
                    title="Item percentage weight"
                    className="w-14 px-2 py-2 text-xs text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                  />
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddChecklistItem}
            className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <span>+ Add Checklist Step</span>
          </button>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
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
                Assigning Task...
              </>
            ) : (
              "Assign Task to Employee ✓"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
