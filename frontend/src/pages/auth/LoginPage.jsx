import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { loginUser } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

// Dashboard route mapping by role
const DASHBOARD_PATHS = {
  admin: "/admin/dashboard",
  superadmin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: location.state?.email || "",
    },
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { data } = await loginUser(formData);
      const { user, accessToken } = data.data;

      login(user, accessToken);

      toast.success(`Welcome back, ${user.name.split(" ")[0]}! 👋`);

      // Redirect pending users to waiting page
      if (user.status === "pending") {
        navigate("/waiting-approval", { replace: true });
        return;
      }

      // Redirect to previous path or default dashboard
      const from = location.state?.from?.pathname || DASHBOARD_PATHS[user.role] || "/";
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);

      if (err.response?.status === 401) {
        setError("password", { message: "Invalid email or password" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Form card */}
      <div className="animate-fade-up">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm">
            Sign in to your TaskFlow account
          </p>
        </div>

        {location.state?.registered && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 animate-fade-up">
            <span className="text-xl">🎉</span>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Registration Complete!</h4>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Your account is pending review by your Department Manager. Once approved, you can log in directly.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="animate-fade-up-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className={`input-premium ${errors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-400" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="animate-fade-up-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`input-premium pr-11 ${errors.password ? "border-red-400 focus:ring-red-500/20" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? (
                  // Eye off icon
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="animate-fade-up-3 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </div>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center animate-fade-up-4">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs text-slate-400 mt-6 animate-fade-up-4">
        Protected by enterprise-grade encryption 🔒
      </p>
    </AuthLayout>
  );
}

