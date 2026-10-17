import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { forgotPassword } from "../../api/auth.api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setSentEmail(email);
      setSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset OTP";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Sent state — OTP bhej diya ab
  if (sent) {
    return (
      <AuthLayout>
        <div className="animate-fade-up text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
          <p className="text-slate-500 text-sm mb-6">
            We sent a password reset OTP to{" "}
            <span className="font-semibold text-slate-700">{sentEmail}</span>
          </p>
          <button
            onClick={() =>
              navigate("/reset-password", { state: { email: sentEmail } })
            }
            className="btn-gradient w-full"
          >
            Enter OTP & Reset Password →
          </button>
          <div className="mt-4">
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              ← Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        {/* Back */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {/* Lock icon */}
        <div className="animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Forgot password?</h2>
          <p className="text-slate-500 text-sm">
            No worries! Enter your email and we'll send a reset OTP.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <div className="animate-fade-up-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email address
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

          <div className="animate-fade-up-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                "Send reset OTP →"
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}


