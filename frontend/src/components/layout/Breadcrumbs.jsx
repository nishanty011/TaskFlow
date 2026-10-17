import { Link, useLocation } from "react-router-dom";

// Route name mapping for clean labels
const ROUTE_LABELS = {
  admin: "Superadmin",
  manager: "Manager",
  employee: "Employee",
  dashboard: "Dashboard",
  tasks: "Tasks",
  departments: "Departments",
  users: "Users",
  approvals: "Approvals",
  reviews: "Reviews",
  submissions: "Submissions",
  analytics: "Analytics",
  reports: "Reports",
  audit: "Audit Logs",
  profile: "Profile",
  settings: "Settings",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Agar root ya style guide par hain toh breadcrumb na dikhaye
  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[value.toLowerCase()] || decodeURIComponent(value);

          return (
            <li key={to} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              {isLast ? (
                <span className="text-slate-800 font-semibold capitalize truncate max-w-[150px]">
                  {label}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-brand-600 transition-colors capitalize truncate max-w-[120px]"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
