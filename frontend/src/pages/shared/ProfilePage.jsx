import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, changePassword } from "../../api/user.api";
import { formatDate } from "../../utils/formatDate";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [designation, setDesignation] = useState(user?.designation || "");
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(", ") || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSavingProfile(true);
    try {
      const skills = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        skills,
      });

      const updated = res.data?.data?.user;
      if (updated && updateUser) {
        updateUser(updated);
      }
      toast.success("Profile updated successfully! ✨");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully! 🔐");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-500/25">
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            {user?.department?.name && (
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 inline-block">
                🏢 {user.department.name}
              </span>
            )}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👤 Profile Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === "security"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔐 Security & Password
          </button>
        </div>
      </div>

      {/* Profile Details Tab */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Apni basic details aur contact information update karein.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full p-3 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-500 font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Email address change nahi kiya ja sakta</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer, QA Analyst, etc."
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React, Node.js, TypeScript, Docker"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Member since {formatDate(user?.joinedAt || user?.createdAt)}
            </span>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20"
            >
              {savingProfile ? "Saving changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* Security & Password Tab */}
      {activeTab === "security" && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Security & Password</h2>
            <p className="text-xs text-slate-500">Update your password regularly to keep your account secure.</p>
          </div>

          <div className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-slate-900/20"
            >
              {savingPassword ? "Updating password..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
