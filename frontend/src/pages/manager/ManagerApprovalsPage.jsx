import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getPendingEmployees, approveEmployee, rejectEmployee } from "../../api/user.api";
import { formatDate, timeAgo } from "../../utils/formatDate";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";

export default function ManagerApprovalsPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending approval employees
  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingEmployees();
      const list = res.data?.data?.employees || [];
      setEmployees(list);
    } catch (err) {
      console.error("Failed to load pending employees:", err);
      toast.error("Failed to load pending approvals");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve action
  const handleApproveConfirm = async () => {
    if (!selectedEmp) return;
    setIsSubmitting(true);
    try {
      await approveEmployee(selectedEmp._id);
      toast.success(`${selectedEmp.name}'s account has been approved! 🎉`);
      setIsApproveOpen(false);
      setSelectedEmp(null);
      fetchPending(); // refresh list
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to approve employee";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject action
  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectEmployee(selectedEmp._id, { reason: rejectReason });
      toast.success(`${selectedEmp.name}'s registration request was rejected`);
      setIsRejectOpen(false);
      setSelectedEmp(null);
      setRejectReason("");
      fetchPending(); // refresh list
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reject employee";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Top Header Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Onboarding & Team Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pending Employee Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review and verify new employees who registered to join your department.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/manager/dashboard"
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
            >
              ← Back to Dashboard
            </Link>
            <Link
              to="/manager/employees"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
            >
              View Active Team →
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, designation, or skills..."
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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Total Requests:</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
            {employees.length}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton count={4} />
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                      {emp.name?.charAt(0) || "E"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-brand-600 font-semibold mt-0.5">
                        {emp.designation || "Department Candidate"}
                      </p>
                      {emp.department && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                            🏢 {typeof emp.department === 'object' ? emp.department.name : emp.department}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">{emp.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    Pending
                  </span>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Applied Date
                    </span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">
                      {formatDate(emp.createdAt)} ({timeAgo(emp.createdAt)})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone
                    </span>
                    <span className="font-semibold text-slate-700 mt-0.5 block">
                      {emp.phone || "Not provided"}
                    </span>
                  </div>
                </div>

                {/* Skills Badges */}
                {emp.skills && emp.skills.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Skills & Expertise
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {emp.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedEmp(emp);
                    setIsApproveOpen(true);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Member
                </button>

                <button
                  onClick={() => {
                    setSelectedEmp(emp);
                    setRejectReason("");
                    setIsRejectOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs border border-rose-200 shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-12 shadow-sm text-center">
          <EmptyState
            icon="🎉"
            title={search ? "No applicants match your search" : "All Caught Up!"}
            description={
              search
                ? `No pending employees found matching "${search}". Try clearing your search filter.`
                : "There are currently no new employee registration requests pending your approval."
            }
            action={
              search ? (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/manager/employees"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Manage Active Team →
                </Link>
              )
            }
          />
        </div>
      )}

      {/* =========================================================================
          APPROVE CONFIRMATION MODAL
          ========================================================================= */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => !isSubmitting && setIsApproveOpen(false)}
        title="Approve Employee Registration"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to approve{" "}
            <span className="font-bold text-slate-900">{selectedEmp?.name}</span> (
            {selectedEmp?.email}) as an active member of your department?
          </p>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>✓</span> What happens next:
            </p>
            <ul className="list-disc list-inside text-[11px] text-emerald-700 space-y-0.5">
              <li>Status becomes active and they can immediately log in to TaskFlow.</li>
              <li>They will appear in your department task assignee dropdown.</li>
              <li>An approval notification email is automatically sent to the candidate.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsApproveOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApproveConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                "Confirm Approval"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          REJECT CONFIRMATION MODAL (WITH REASON FIELD)
          ========================================================================= */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => !isSubmitting && setIsRejectOpen(false)}
        title="Reject Employee Application"
      >
        <form onSubmit={handleRejectConfirm} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please provide a specific reason for rejecting the registration of{" "}
            <span className="font-bold text-slate-900">{selectedEmp?.name}</span>. This reason will be recorded in the audit log and emailed to the candidate.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Department capacity is currently full, or credentials could not be verified by HR..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsRejectOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rejectReason.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
