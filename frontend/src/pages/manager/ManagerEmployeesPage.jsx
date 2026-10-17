import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getEmployees, getEmployeeById } from "../../api/user.api";
import { getManagerDashboard } from "../../api/dashboard.api";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [workloadMap, setWorkloadMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Profile Drawer state
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [fullEmpData, setFullEmpData] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, dashRes] = await Promise.all([
        getEmployees(),
        getManagerDashboard().catch(() => ({ data: { data: {} } })),
      ]);

      const empList = usersRes.data?.data?.employees || [];
      setEmployees(empList);

      // Map workload stats by user _id
      const workloads = dashRes.data?.data?.employeeWorkload || [];
      const map = {};
      workloads.forEach((w) => {
        map[w._id] = w;
      });
      setWorkloadMap(map);
    } catch (err) {
      console.error("Failed to load department employees:", err);
      toast.error("Failed to load department team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open profile drawer
  const handleOpenProfile = async (emp) => {
    setSelectedEmp(emp);
    setDrawerOpen(true);
    setLoadingProfile(true);
    try {
      const res = await getEmployeeById(emp._id);
      setFullEmpData(res.data?.data?.employee || emp);
    } catch (err) {
      console.error("Failed to load full employee details:", err);
      setFullEmpData(emp);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Close profile drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEmp(null);
    setFullEmpData(null);
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const nameMatch = emp.name?.toLowerCase().includes(q);
    const emailMatch = emp.email?.toLowerCase().includes(q);
    const desigMatch = emp.designation?.toLowerCase().includes(q);
    const skillMatch = emp.skills?.some((s) => s.toLowerCase().includes(q));
    return nameMatch || emailMatch || desigMatch || skillMatch;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER: Team Directory Overview
          ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Department Roster & Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Department Team Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect active department employees, task completion velocity, average rating scorecards, and individual workloads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manager/approvals"
              className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>⏳ Pending Approvals</span>
            </Link>
            <Link
              to="/manager/dashboard"
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & VIEW TOGGLE BAR
          ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, designation, email, or skill..."
            className="w-full px-4 py-2.5 pl-10 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
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

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            {filteredEmployees.length} Members
          </span>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN TEAM LIST (GRID OR TABLE VIEW)
          ========================================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : filteredEmployees.length > 0 ? (
        viewMode === "grid" ? (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => {
              const workload = workloadMap[emp._id] || {};
              const completionRate = workload.completionRate || 0;
              const totalTasks = workload.totalTasks || 0;
              const completedTasks = workload.completedTasks || 0;
              const rating = workload.avgRating || 0;

              return (
                <div
                  key={emp._id}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {emp.name?.charAt(0) || "E"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-base truncate group-hover:text-brand-600 transition-colors">
                            {emp.name}
                          </h3>
                          <p className="text-xs text-brand-600 font-semibold truncate">
                            {emp.designation || "Team Member"}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 truncate">
                      <span>✉️</span> {emp.email}
                    </p>

                    {/* Workload Progress Bar */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Task Velocity</span>
                        <span className="font-bold text-slate-900">{completionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>{completedTasks} completed</span>
                        <span>{totalTasks} assigned</span>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    {emp.skills && emp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {emp.skills.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {emp.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-semibold">
                            +{emp.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer & Card CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <span>★</span>
                      <span className="text-slate-800 font-extrabold">{rating > 0 ? rating : "N/A"}</span>
                      {rating > 0 && <span className="text-slate-400 font-normal">/ 5.0</span>}
                    </div>

                    <button
                      onClick={() => handleOpenProfile(emp)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Designation</th>
                    <th className="py-4 px-6">Workload</th>
                    <th className="py-4 px-6">Completion</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const workload = workloadMap[emp._id] || {};
                    const completionRate = workload.completionRate || 0;
                    const rating = workload.avgRating || 0;

                    return (
                      <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center flex-shrink-0">
                              {emp.name?.charAt(0) || "E"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{emp.name}</p>
                              <p className="text-[11px] text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700">
                          {emp.designation || "Member"}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <span className="font-bold text-slate-900">{workload.completedTasks || 0}</span> /{" "}
                          <span>{workload.totalTasks || 0} tasks</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700">{completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <span>★</span>
                            <span className="text-slate-800">{rating > 0 ? rating : "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenProfile(emp)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-semibold text-xs transition-all"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-12 shadow-sm text-center">
          <EmptyState
            icon="👥"
            title="No team members found"
            description={`No employees matched your search query "${search}".`}
            action={
              <button
                onClick={() => setSearch("")}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                Clear Search Filter
              </button>
            }
          />
        </div>
      )}

      {/* =========================================================================
          SLIDE-OVER PROFILE DRAWER (Full Info, Workload, Performance)
          ========================================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in">
              <div>
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <h2 className="font-extrabold text-slate-900 text-lg">Employee Profile</h2>
                  <button
                    onClick={handleCloseDrawer}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all"
                  >
                    ✕
                  </button>
                </div>

                {loadingProfile ? (
                  <div className="p-6 space-y-4 animate-pulse">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto" />
                    <div className="h-6 bg-slate-200 rounded-xl w-3/4 mx-auto" />
                    <div className="h-4 bg-slate-100 rounded-xl w-1/2 mx-auto" />
                    <div className="h-24 bg-slate-100 rounded-2xl" />
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* User Identity Card */}
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25 mb-3 border-2 border-white">
                        {fullEmpData?.name?.charAt(0) || "E"}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {fullEmpData?.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">
                        {fullEmpData?.designation || "Department Employee"}
                      </p>
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mt-2 border border-emerald-100">
                        Active Member
                      </span>
                    </div>

                    {/* Workload & Performance Scorecard */}
                    {selectedEmp && workloadMap[selectedEmp._id] && (
                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Performance Scorecard
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-2xl bg-white shadow-xs">
                            <span className="text-lg font-black text-slate-900 block">
                              {workloadMap[selectedEmp._id].totalTasks || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">Assigned</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-white shadow-xs">
                            <span className="text-lg font-black text-emerald-600 block">
                              {workloadMap[selectedEmp._id].completedTasks || 0}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">Completed</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-white shadow-xs">
                            <span className="text-lg font-black text-brand-600 block">
                              {workloadMap[selectedEmp._id].completionRate || 0}%
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">Velocity</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-amber-900">Manager Rating</span>
                          <span className="text-sm font-black text-amber-600 flex items-center gap-1">
                            ★ {workloadMap[selectedEmp._id].avgRating || "N/A"} / 5.0
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Detailed Attributes */}
                    <div className="space-y-3 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Contact & Details
                      </span>

                      <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-bold text-slate-800">{fullEmpData?.email}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                        <span className="text-slate-500">Phone Number</span>
                        <span className="font-bold text-slate-800">{fullEmpData?.phone || "Not listed"}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                        <span className="text-slate-500">Department</span>
                        <span className="font-bold text-slate-800">
                          {fullEmpData?.department?.name || "Assigned Domain"}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                        <span className="text-slate-500">Onboarding Date</span>
                        <span className="font-bold text-slate-800">
                          {fullEmpData?.createdAt ? formatDate(fullEmpData.createdAt) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {fullEmpData?.skills && fullEmpData.skills.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Verified Skill Tags
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {fullEmpData.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <button
                  onClick={handleCloseDrawer}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex-1"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex-1"
                >
                  + Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal with Preselected Employee */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultAssigneeId={fullEmpData?._id}
        onTaskCreated={() => {
          toast.success(`Task created for ${fullEmpData?.name || "employee"}! 🎯`);
          handleCloseDrawer();
          fetchData();
        }}
      />
    </div>
  );
}
