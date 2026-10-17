import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getEmployees,
  approveEmployee,
  rejectEmployee,
  suspendUser,
} from "../../api/user.api";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { TableSkeleton } from "../../components/ui/Skeleton";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailUser, setDetailUser] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await getEmployees(params);
      setUsers(res.data.data?.employees || []);
      setTotal(res.data.data?.total || 0);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approveEmployee(id);
      toast.success("User approved successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      setActionLoading(rejectModal._id);
      await rejectEmployee(rejectModal._id, { reason: rejectReason });
      toast.success("User registration rejected");
      setRejectModal(null);
      setRejectReason("");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;
    try {
      setActionLoading(id);
      await suspendUser(id);
      toast.success("User suspended successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to suspend user");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusFilters = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending_approval", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              👥 User Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {total} user{total !== 1 ? "s" : ""} in system — manage accounts, approvals, and access control.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm">
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        u.role === "superadmin" ? "bg-rose-50 text-rose-600" :
                        u.role === "manager" ? "bg-purple-50 text-purple-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-600 font-medium">
                        {u.department?.name || "—"}
                      </span>
                      {u.department?.code && (
                        <span className="text-[10px] text-slate-400 ml-1">({u.department.code})</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge userStatus={u.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{u.designation || "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.status === "pending_approval" && (
                          <>
                            <button
                              onClick={() => handleApprove(u._id)}
                              disabled={actionLoading === u._id}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => { setRejectModal(u); setRejectReason(""); }}
                              disabled={actionLoading === u._id}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {u.status === "active" && u.role !== "superadmin" && (
                          <button
                            onClick={() => handleSuspend(u._id)}
                            disabled={actionLoading === u._id}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => setDetailUser(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-semibold transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        page === pageNum
                          ? "bg-brand-600 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">👥</p>
          <h3 className="text-lg font-bold text-slate-800">No users found</h3>
          <p className="text-sm text-slate-400 mt-2">
            {search || statusFilter ? "Try adjusting your search filters." : "No users registered yet."}
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
        title="User Profile"
        subtitle={detailUser?.email}
        maxWidth="max-w-md"
      >
        {detailUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {detailUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detailUser.name}</h3>
                <p className="text-xs text-slate-500">{detailUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-slate-400 font-medium block mb-1">Role</span>
                <span className="font-bold text-slate-800 capitalize">{detailUser.role}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-slate-400 font-medium block mb-1">Status</span>
                <Badge userStatus={detailUser.status} size="sm" />
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-slate-400 font-medium block mb-1">Department</span>
                <span className="font-bold text-slate-800">{detailUser.department?.name || "N/A"}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-slate-400 font-medium block mb-1">Designation</span>
                <span className="font-bold text-slate-800">{detailUser.designation || "N/A"}</span>
              </div>
            </div>
            {detailUser.skills?.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailUser.skills.map((skill, i) => (
                    <span key={i} className="text-[11px] font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject User"
        subtitle={rejectModal ? `Rejecting ${rejectModal.name}` : ""}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleReject} isLoading={!!actionLoading}>
              Reject User
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Please provide a reason for rejecting this user's registration:
          </p>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-rose-500 focus:ring-rose-500/20 transition-all resize-none"
            rows={3}
            placeholder="Rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
