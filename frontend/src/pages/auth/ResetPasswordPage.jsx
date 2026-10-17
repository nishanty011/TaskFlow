import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { resetPassword } from "../../api/auth.api";

const OTP_LENGTH = 6;

// Password strength helper
function getStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "" };
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    {},
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-lime-400" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchedPassword = watch("newPassword", "");
  const strength = getStrength(watchedPassword);

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = cleaned;
    setDigits(updated);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(""));
    }
  };

  const onSubmit = async ({ newPassword }) => {
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setIsSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Password reset!</h2>
          <p className="text-slate-500 text-sm">Redirecting to login...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="mb-6 animate-fade-up">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h2>
          <p className="text-slate-500 text-sm">
            Enter the OTP sent to{" "}
            <span className="font-semibold text-slate-700">{email}</span>{" "}
            and set a new password.
          </p>
        </div>

        {/* OTP boxes */}
        <div className="mb-6 animate-fade-up-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Enter OTP
          </label>
          <div className="flex gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`
                  otp-input w-11 h-12 text-center text-lg font-bold rounded-xl border-2 
                  bg-slate-50 text-slate-900 outline-none transition-all duration-200
                  focus:bg-white focus:scale-110
                  ${digit ? "border-brand-500 bg-brand-50/50 text-brand-700" : "border-slate-200"}
                `}
                autoFocus={i === 0}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New password */}
          <div className="animate-fade-up-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`input-premium pr-11 ${errors.newPassword ? "border-red-400" : ""}`}
                {...register("newPassword", {
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

            {/* Strength bar */}
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
                    Strength: <span className="font-semibold">{strength.label}</span>
                  </p>
                )}
              </div>
            )}
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">⚠ {errors.newPassword.message}</p>
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
                  <span>Resetting...</span>
                </>
              ) : (
                "Reset password →"
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}


