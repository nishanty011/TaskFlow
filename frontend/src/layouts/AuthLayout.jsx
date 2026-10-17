import { Link } from "react-router-dom";

// Auth pages ke liye layout — Studio Luminous Slate theme (from user reference image)
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-studio-theme">
      {/* Soft spotlight beam highlight overlay */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Fine atmospheric texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1.5px, transparent 1.5px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Subtle breathing light beam animation */}
        <div
          className="absolute -left-20 top-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-[90px] animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(224, 242, 254, 0.5) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Top Bar: Back to Home */}
      <div className="absolute top-5 left-5 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/85 hover:bg-white text-xs font-semibold text-slate-800 border border-white/70 shadow-md backdrop-blur-md transition-all hover:scale-105"
        >
          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Floating decorative badges - Scaled 1.25x with expanded dynamic float area */}
      <div className="hidden sm:flex absolute top-16 left-12 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float">
        <span className="text-3xl">⚡</span>
      </div>

      {/* 3D Checkmark Card matching user screenshot crop */}
      <div className="hidden sm:flex absolute top-20 right-16 w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/30 items-center justify-center animate-float-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/35">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="hidden sm:flex absolute bottom-14 left-16 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float-3">
        <span className="text-3xl">🚀</span>
      </div>

      <div className="hidden sm:flex absolute bottom-20 right-20 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float">
        <span className="text-3xl">📊</span>
      </div>

      {/* Main centered card wrapper */}
      <div className="relative z-10 w-full max-w-[460px] my-12">
        {/* Logo on top */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-7 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-800 flex items-center justify-center shadow-xl shadow-slate-950/25 group-hover:scale-105 transition-transform border border-white/40">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight drop-shadow-sm">
            TaskFlow
          </span>
        </Link>

        {/* Crisp Frosted Glass Card with Soft Ambient Shadow */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-400/25 border border-white p-7 sm:p-9">
          {children}
        </div>

        {/* Bottom footer */}
        <p className="text-center text-xs font-semibold text-slate-500 mt-5">
          Secured with enterprise-grade encryption 🔒
        </p>
      </div>
    </div>
  );
}
