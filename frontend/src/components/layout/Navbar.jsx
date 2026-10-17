import Breadcrumbs from "./Breadcrumbs";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

export default function Navbar({ onMobileMenuClick }) {
  return (
    <header className="sticky top-0 z-30 h-16 backdrop-blur-xl bg-white/75 border-b border-white/60 shadow-sm px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200/60 shadow-sm"
          title="Open Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks, deliverables, team..."
            className="w-full pl-9 pr-12 py-2 rounded-2xl bg-white/75 hover:bg-white border border-slate-200/60 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 shadow-sm transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notification bell + User profile menu */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <NotificationDropdown />
        <div className="h-6 w-[1px] bg-slate-200/60 hidden sm:block" />
        <UserDropdown />
      </div>
    </header>
  );
}
