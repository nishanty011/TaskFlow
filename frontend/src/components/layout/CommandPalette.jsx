import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { getTasks } from "../../api/task.api";
import { getEmployees } from "../../api/user.api";

export default function CommandPalette({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setTasks([]);
      setPeople([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [taskRes, userRes] = await Promise.all([
          getTasks({ search: query, limit: 5 }),
          getEmployees({ search: query, limit: 5 }).catch(() => ({ data: { data: { employees: [] } } })),
        ]);
        setTasks(taskRes.data?.data?.tasks || []);
        setPeople(userRes.data?.data?.employees || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  // Quick navigation items according to user role
  const quickLinks = [
    {
      label: "My Assigned Tasks",
      path: "/employee/tasks",
      icon: "📋",
      role: ["employee"],
    },
    {
      label: "My Submissions History",
      path: "/employee/submissions",
      icon: "📦",
      role: ["employee"],
    },
    {
      label: "Department Team Directory",
      path: "/employee/team",
      icon: "👥",
      role: ["employee"],
    },
    {
      label: "Task Management Board",
      path: "/manager/tasks",
      icon: "📋",
      role: ["manager", "superadmin"],
    },
    {
      label: "Pending Deliverables Reviews",
      path: "/manager/reviews",
      icon: "🔍",
      role: ["manager", "superadmin"],
    },
    {
      label: "Department Employees",
      path: "/manager/employees",
      icon: "👥",
      role: ["manager", "superadmin"],
    },
    {
      label: "Admin Department Overview",
      path: "/admin/departments",
      icon: "🏢",
      role: ["superadmin"],
    },
    {
      label: "Notification Center",
      path: "/notifications",
      icon: "🔔",
      role: ["employee", "manager", "superadmin"],
    },
    {
      label: "Account Preferences & Dark Mode",
      path: "/settings",
      icon: "⚙️",
      role: ["employee", "manager", "superadmin"],
    },
    {
      label: "Personal Profile",
      path: "/profile",
      icon: "👤",
      role: ["employee", "manager", "superadmin"],
    },
  ].filter((item) => item.role.includes(user?.role || "employee"));

  const filteredQuickLinks = query.trim()
    ? quickLinks.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Dialog */}
      <div
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, teammates, or jump to page..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC to close
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4 text-xs">
          {loading && (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching TaskFlow...</span>
            </div>
          )}

          {/* Tasks Results */}
          {!loading && tasks.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tasks Found ({tasks.length})
              </span>
              <div className="space-y-1">
                {tasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => handleSelect(user?.role === "manager" ? "/manager/tasks" : "/employee/tasks")}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">📋</span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{t.title}</span>
                        <span className="text-[10px] text-slate-400">Progress: {t.progress || 0}% • Priority: {t.priority}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {t.status?.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People Results */}
          {!loading && people.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Team Members ({people.length})
              </span>
              <div className="space-y-1">
                {people.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelect(user?.role === "manager" ? "/manager/employees" : "/employee/team")}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.designation || "Colleague"} • {p.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          {filteredQuickLinks.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Navigation Shortcuts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredQuickLinks.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(item.path)}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && tasks.length === 0 && people.length === 0 && filteredQuickLinks.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              No results found for "{query}". Try a different keyword.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="font-bold text-slate-600 dark:text-slate-300">⌘K</kbd> / <kbd className="font-bold text-slate-600 dark:text-slate-300">Ctrl+K</kbd> anytime to open</span>
          <span>TaskFlow Search</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
