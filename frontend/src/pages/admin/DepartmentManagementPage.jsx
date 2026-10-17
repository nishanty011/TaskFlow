import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  assignManager,
} from "../../api/department.api";
import { getEmployees } from "../../api/user.api";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CardSkeleton } from "../../components/ui/Skeleton";

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getAllDepartments();
      setDepartments(res.data.data?.departments || res.data.data || []);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  // Open create/edit modal
  const openModal = (dept = null) => {
    if (dept) {
      setEditDept(dept);
      setFormData({ name: dept.name, code: dept.code, description: dept.description || "" });
    } else {
      setEditDept(null);
      setFormData({ name: "", code: "", description: "" });
    }
    setModalOpen(true);
  };

  // Save department (create/update)
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Department Name and Code are both required");
      return;
    }
    try {
      setSaving(true);
      if (editDept) {
        await updateDepartment(editDept._id, formData);
        toast.success("Department updated successfully!");
      } else {
        await createDepartment(formData);
        toast.success("New department created successfully!");
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving department");
    } finally {
      setSaving(false);
    }
  };

  // Open assign manager modal
  const openAssignModal = async (dept) => {
    setAssignModal(dept);
    setSelectedManager(dept.manager?._id || "");
    try {
      const res = await getEmployees({ limit: 100 });
      const allUsers = res.data.data?.employees || [];
      // Filter to show manager-eligible users
      setManagers(allUsers.filter((u) => u.role === "manager" || u.role === "employee"));
    } catch {
      setManagers([]);
    }
  };

  // Assign manager
  const handleAssignManager = async () => {
    if (!selectedManager) {
      toast.error("Please select a manager");
      return;
    }
    try {
      setSaving(true);
      await assignManager(assignModal._id, { managerId: selectedManager });
      toast.success("Manager assigned successfully!");
      setAssignModal(null);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning manager");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              🏢 Department Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {departments.length} department{departments.length !== 1 ? "s" : ""} configured — create, edit, and assign managers.
            </p>
          </div>
          <Button onClick={() => openModal()} leftIcon={<span className="text-sm">+</span>}>
            New Department
          </Button>
        </div>
      </div>

      {/* Department Cards Grid */}
      {departments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 opacity-60" />

              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-500/20">
                    {dept.code?.substring(0, 3) || "??"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      {dept.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(dept)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              {dept.description && (
                <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{dept.description}</p>
              )}

              {/* Manager Section */}
              <div className="bg-slate-50/80 rounded-2xl p-3 mb-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Department Manager</p>
                {dept.manager ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {dept.manager.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{dept.manager.name}</p>
                      <p className="text-[10px] text-slate-400">{dept.manager.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">?</div>
                    <p className="text-xs text-slate-400 italic">Not assigned</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openAssignModal(dept)}
                  className="flex-1 text-xs font-semibold text-center py-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  {dept.manager ? "Change Manager" : "Assign Manager"}
                </button>
                <button
                  onClick={() => openModal(dept)}
                  className="flex-1 text-xs font-semibold text-center py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Edit Details
                </button>
              </div>

              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${dept.isActive !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  {dept.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">🏢</p>
          <h3 className="text-lg font-bold text-slate-800">No departments yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Create your first department to organize your team. Each department can have its own manager and employees.
          </p>
          <Button onClick={() => openModal()} className="mt-6">
            Create First Department
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDept ? "Edit Department" : "Create New Department"}
        subtitle={editDept ? `Editing ${editDept.name}` : "Add a new organizational unit"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              {editDept ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            required
            placeholder="e.g. Engineering"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Department Code"
            required
            placeholder="e.g. ENG"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20 transition-all resize-none"
              rows={3}
              placeholder="Brief description of the department..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Assign Manager Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Department Manager"
        subtitle={assignModal ? `For ${assignModal.name} (${assignModal.code})` : ""}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignManager} isLoading={saving}>
              Assign Manager
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select a user to assign as the manager of this department:</p>
          <select
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-500/20 transition-all bg-white"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">-- Select Manager --</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email}) — {m.role}
              </option>
            ))}
          </select>
          {managers.length === 0 && (
            <p className="text-xs text-slate-400 italic">No eligible users found. Create users first.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
