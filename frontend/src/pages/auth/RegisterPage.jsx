import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { registerUser } from "../../api/auth.api";
import { getPublicDepartments } from "../../api/department.api";

// Password strength evaluator
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "bg-red-400" },
    { score: 2, label: "Fair", color: "bg-amber-400" },
    { score: 3, label: "Good", color: "bg-lime-400" },
    { score: 4, label: "Strong", color: "bg-emerald-500" },
  ];
  return levels[score];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("employee");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Load available departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data } = await getPublicDepartments();
        const depts = data.data?.departments || (Array.isArray(data.data) ? data.data : []);
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartments([]);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  const watchedPassword = watch("password", "");
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: selectedRole,
      });

      const successMsg =
        selectedRole === "manager"
          ? "Manager account created! Awaiting Super Admin approval."
          : "Account created! Awaiting Department Manager approval.";

      toast.success(successMsg);
      navigate("/login", { state: { email: formData.email, registered: true } });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create an account</h2>
          <p className="text-slate-500 text-sm">
            Join your organization on TaskFlow
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-5 animate-fade-up-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Register as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("employee")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedRole === "employee"
                  ? "bg-brand-50/80 border-brand-500 shadow-sm ring-2 ring-brand-500/20"
                  : "bg-white/80 border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">👤</span>
                <span className="font-bold text-xs text-slate-900">Employee</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Approved by Manager
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("manager")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedRole === "manager"
                  ? "bg-purple-50/80 border-purple-500 shadow-sm ring-2 ring-purple-500/20"
                  : "bg-white/80 border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">👔</span>
                <span className="font-bold text-xs text-slate-900">Manager</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Approved by Super Admin
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="animate-fade-up-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              placeholder="John Smith"
              className={`input-premium ${errors.name ? "border-red-400" : ""}`}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name too short" },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">⚠ {errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="animate-fade-up-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Work email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className={`input-premium ${errors.email ? "border-red-400" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">⚠ {errors.email.message}</p>
            )}
          </div>

          {/* Department dropdown */}
          <div className="animate-fade-up-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Department
            </label>
            <div className="relative">
              <select
                className={`input-premium appearance-none cursor-pointer ${errors.department ? "border-red-400" : ""}`}
                disabled={loadingDepts}
                {...register("department", { required: "Select a department" })}
              >
                <option value="">
                  {loadingDepts ? "Loading departments..." : "Select your department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {/* Dropdown arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.department && (
              <p className="mt-1 text-xs text-red-500">⚠ {errors.department.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="animate-fade-up-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`input-premium pr-11 ${errors.password ? "border-red-400" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {watchedPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-slate-500 mt-1">
                    Password strength:{" "}
                    <span className="font-semibold">{strength.label}</span>
                  </p>
                )}
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">⚠ {errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="animate-fade-up-4 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </div>

          {/* Note about approval */}
          <div className="animate-fade-up-4">
            <div className={`border rounded-xl p-3 flex gap-2 ${
              selectedRole === "manager"
                ? "bg-purple-50/80 border-purple-100"
                : "bg-amber-50 border-amber-100"
            }`}>
              <span className={`text-sm mt-0.5 ${
                selectedRole === "manager" ? "text-purple-500" : "text-amber-500"
              }`}>ℹ</span>
              <p className={`text-xs leading-relaxed ${
                selectedRole === "manager" ? "text-purple-700" : "text-amber-700"
              }`}>
                {selectedRole === "manager"
                  ? "Your Manager registration request will be reviewed and approved by the Super Admin before you can access the Manager Portal."
                  : "Your account will be reviewed and approved by your Department Manager before you can log in."}
              </p>
            </div>
          </div>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

