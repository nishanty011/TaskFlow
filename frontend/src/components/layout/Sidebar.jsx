import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TaskFlowLogo from "../common/TaskFlowLogo";

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const role = user?.role || "employee";

  // Role-based navigation items
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

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between h-screen sticky top-0 backdrop-blur-2xl bg-white/80 border-r border-white/60 shadow-sm transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top: Logo & App Title */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 overflow-hidden group">
            {/* Always show icon; hide text when collapsed */}
            <TaskFlowLogo
              size="sm"
              showText={!isCollapsed}
              className="group-hover:opacity-90 transition-opacity"
            />
            {!isCollapsed && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 ml-0.5 truncate">
                {role} Portal
              </span>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl hover:bg-slate-100/70 text-slate-400 hover:text-slate-600 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Department Scope Badge (if assigned) */}
        {!isCollapsed && user?.department?.name && (
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-to-r from-brand-50/80 to-indigo-50/50 border border-brand-100/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Department
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {user.department.name}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 mt-2 space-y-1">
          {currentNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                } ${isCollapsed ? "justify-center px-0" : ""}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: Quick User Card */}
      <div className="p-3 border-t border-slate-100">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-50/70 border border-slate-200/60 ${
            isCollapsed ? "justify-center p-2" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 capitalize truncate">
                  Online • {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
