import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { verifyOtp, resendOtp } from "../../api/auth.api";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [hasError, setHasError] = useState(false);

  const inputRefs = useRef([]);

  // Redirect if email is not present
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle single digit input
  const handleChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(-1);
    setHasError(false);

    const updated = [...digits];
    updated[index] = cleaned;
    setDigits(updated);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Focus previous input on backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Support pasting complete OTP code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      setIsSuccess(true);
      toast.success("Email verified! 🎉");

      setTimeout(() => {
        navigate("/waiting-approval", { replace: true });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      toast.error(msg);
      setHasError(true);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendOtp({ email });
      toast.success("New OTP sent to your email!");
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  // Success state UI
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Email verified!</h2>
          <p className="text-slate-500 text-sm">
            Redirecting you to the waiting room...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className={`animate-fade-up ${hasError ? "animate-shake" : ""}`}>
        {/* Back link */}
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Email icon */}
        <div className="animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Check your email</h2>
          <p className="text-slate-500 text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        {/* OTP input boxes */}
        <div className="mt-8 mb-6 animate-fade-up-2">
          <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`
                  otp-input w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 
                  bg-slate-50 text-slate-900 outline-none transition-all duration-200
                  focus:bg-white focus:scale-110
                  ${digit ? "border-brand-500 bg-brand-50/50 text-brand-700 shadow-sm shadow-brand-100" : "border-slate-200"}
                  ${hasError ? "border-red-400 bg-red-50" : ""}
                `}
                style={{ animationDelay: `${i * 0.05}s` }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {hasError && (
            <p className="text-center text-xs text-red-500 mt-3 animate-fade-up">
              ⚠ Invalid OTP. Please try again.
            </p>
          )}
        </div>

        {/* Verify button */}
        <div className="animate-fade-up-3">
          <button
            onClick={handleVerify}
            disabled={isLoading || digits.join("").length !== OTP_LENGTH}
            className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify email →"
            )}
          </button>
        </div>

        {/* Resend OTP */}
        <div className="mt-5 text-center animate-fade-up-4">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-slate-400">
              Resend code in{" "}
              <span className="font-semibold text-slate-600 tabular-nums">
                0:{countdown.toString().padStart(2, "0")}
              </span>
            </p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}



