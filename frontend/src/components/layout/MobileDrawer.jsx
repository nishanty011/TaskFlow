import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TaskFlowLogo from "../common/TaskFlowLogo";

export default function MobileDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || "employee";

  const navItems = {
    admin: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/admin/departments", label: "Departments", icon: "🏢" },
      { to: "/admin/users", label: "User Management", icon: "👥" },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: "🛡️" },
      { to: "/admin/reports", label: "Analytics & Reports", icon: "📈" },
    ],
    superadmin: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/admin/departments", label: "Departments", icon: "🏢" },
      { to: "/admin/users", label: "User Management", icon: "👥" },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: "🛡️" },
      { to: "/admin/reports", label: "Analytics & Reports", icon: "📈" },
    ],
    manager: [
      { to: "/manager/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/manager/tasks", label: "Task Management", icon: "📋" },
      { to: "/manager/approvals", label: "Pending Approvals", icon: "⏳" },
      { to: "/manager/employees", label: "Department Team", icon: "👥" },
      { to: "/manager/reviews", label: "Review Deliverables", icon: "🔍" },
      { to: "/manager/analytics", label: "Department Metrics", icon: "📈" },
    ],
    employee: [
      { to: "/employee/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/employee/tasks", label: "My Tasks", icon: "📋" },
      { to: "/employee/submissions", label: "My Submissions", icon: "📦" },
      { to: "/employee/team", label: "Team Directory", icon: "👥" },
    ],
  };

  const currentNav = navItems[role] || navItems.employee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-2xl border-r border-white/80 shadow-2xl p-5 flex flex-col justify-between animate-slide-right">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Link to="/" onClick={onClose} className="flex items-center">
              <TaskFlowLogo size="sm" />
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Close Drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Department Tag */}
          {user?.department?.name && (
            <div className="mt-4 p-3 rounded-2xl bg-brand-50 border border-brand-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Department
              </span>
              <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                {user.department.name}
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1">
            {currentNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card at bottom */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
