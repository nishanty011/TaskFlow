import { useState } from "react";
import { Link } from "react-router-dom";
import TaskFlowLogo from "../../components/common/TaskFlowLogo";

export default function HomePage() {
  // Live interactive demo state for the 3D card preview
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Design 3D hero showcase & cards grid", weight: 30, completed: true },
    { id: 2, text: "Hook department scoping & role permissions", weight: 25, completed: true },
    { id: 3, text: "Auto-recalculate weighted checklist progress", weight: 25, completed: true },
    { id: 4, text: "Multi-file submission with revision approval", weight: 20, completed: false },
  ]);

  const toggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const calculatedProgress = checklist.reduce(
    (acc, item) => (item.completed ? acc + item.weight : acc),
    0
  );

  const departmentsList = [
    {
      code: "TECH",
      name: "Technology & Engineering",
      color: "from-blue-500 to-indigo-600",
      accent: "bg-blue-50 text-blue-700 border-blue-200",
      tasks: 24,
      desc: "Full-stack web apps, cloud infrastructure, automated microservices, and mobile client releases.",
    },
    {
      code: "MKT",
      name: "Marketing & Growth",
      color: "from-amber-500 to-orange-600",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
      tasks: 18,
      desc: "Brand identity, performance marketing, content roadmaps, and customer lifecycle conversions.",
    },
    {
      code: "RND",
      name: "Research & Innovation",
      color: "from-purple-500 to-violet-600",
      accent: "bg-purple-50 text-purple-700 border-purple-200",
      tasks: 12,
      desc: "Algorithm experimentation, feasibility prototypes, AI models, and next-gen tech integration.",
    },
    {
      code: "HR",
      name: "Human Resources",
      color: "from-emerald-500 to-teal-600",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      tasks: 15,
      desc: "Talent recruitment, employee onboarding, culture metrics, and department policy enforcement.",
    },
  ];

  const features = [
    {
      icon: "⚖️",
      title: "Weighted Checklist Engine",
      description:
        "Every task item carries an explicit percentage weight. Progress auto-recalculates dynamically with instant visual timeline updates.",
      tag: "Auto Calculation",
    },
    {
      icon: "🏢",
      title: "Department Scoping & Isolation",
      description:
        "Department managers and employees are strictly scoped to their assigned domain. Superadmins maintain full organizational oversight.",
      tag: "Data Privacy",
    },
    {
      icon: "📦",
      title: "Multi-File Submission Versioning",
      description:
        "Upload archives, wireframes, and code deliverables. Track full version history (v1, v2) with revisions and manager rating scorecards.",
      tag: "Versioning",
    },
    {
      icon: "⚡",
      title: "Real-Time Socket.io Alerts",
      description:
        "Instant live notifications for task assignments, feedback submissions, approval decisions, and status transitions without page reloads.",
      tag: "Live Updates",
    },
    {
      icon: "🛡️",
      title: "Granular RBAC Security",
      description:
        "Role-based guards across Superadmin, Manager, and Employee tiers. Token rotation with auto-refresh queue and secure HTTP-only cookies.",
      tag: "Enterprise Auth",
    },
    {
      icon: "📊",
      title: "Analytics & Executive Reports",
      description:
        "Visual dashboards with Recharts, completion velocity tracking, overdue alerts, and single-click CSV performance exports.",
      tag: "Actionable Insights",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Define & Assign",
      desc: "Managers create granular tasks with weighted checklist items, attachments, priority levels, and strict deadlines.",
      badge: "Manager Flow",
    },
    {
      step: "02",
      title: "Execute & Track",
      desc: "Assignees check off completed work in real-time, observing dynamic progress calculations and commenting on blockers.",
      badge: "Employee Flow",
    },
    {
      step: "03",
      title: "Submit & Review",
      desc: "Completed deliverables are submitted with multi-file uploads. Managers approve or request specific revisions with 1-5 star ratings.",
      badge: "Review Cycle",
    },
    {
      step: "04",
      title: "Audit & Scale",
      desc: "Superadmins inspect audit logs, track department throughput, and download executive CSV activity reports.",
      badge: "Admin Oversight",
    },
  ];

  return (
    <div className="min-h-screen bg-studio-theme text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-[250px] -left-[150px] w-[900px] h-[700px] rounded-full opacity-60 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(230, 244, 254, 0.45) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-[800px] -right-[200px] w-[600px] h-[600px] rounded-full opacity-35 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(224, 242, 254, 0.5) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(to right, #4f46e5 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* =========================================================================
          STICKY NAVBAR
          ========================================================================= */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <TaskFlowLogo size="md" className="group-hover:scale-105 transition-transform duration-200" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#departments"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              Departments
            </a>
            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started Free
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION (3D CARDS & INTERACTIVE PREVIEW)
          ========================================================================= */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Orchestrate Teams & Tasks with{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Intelligent Workflows
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-brand-500/40 via-violet-500/40 to-transparent rounded-full" />
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Designed for modern teams. Weighted checklist auto-progress,
              isolated department scopes, multi-file deliverables with version
              history, and executive analytics in one unified platform.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white font-semibold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Create Your Account</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200/80 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Dashboard</span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>

            {/* Social Trust Stats */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  99.8%
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  On-Time Deliveries
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">
                  4 Depts
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Tech, MKT, R&D, HR
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-violet-600">
                  Auto-Sync
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Socket.io Events
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  Zero Leak
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Strict RBAC Scoping
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3D PERSPECTIVE MOCKUP & LIVE INTERACTIVE TASK CARD
              ========================================================================= */}
          <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
            {/* Ambient behind-glow */}
            <div className="absolute inset-4 -z-10 bg-gradient-to-r from-brand-500/20 via-violet-500/20 to-sky-500/20 rounded-[3rem] blur-2xl transform -rotate-1" />

            {/* Floating 3D Badges around the shell - Scaled 1.25x with expanded movement area */}
            <div className="hidden md:flex absolute -top-8 -left-8 z-30 w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/30 items-center justify-center animate-float-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/35">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="hidden md:flex absolute -top-6 -right-6 z-30 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float">
              <span className="text-3xl">⚡</span>
            </div>

            <div className="hidden md:flex absolute -bottom-8 -left-6 z-30 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float-3">
              <span className="text-3xl">🚀</span>
            </div>

            <div className="hidden md:flex absolute -bottom-6 -right-8 z-30 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-400/25 items-center justify-center animate-float">
              <span className="text-3xl">📊</span>
            </div>

            {/* Outer 3D Card Shell */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white via-white/95 to-slate-50/90 border border-white/80 shadow-2xl shadow-slate-300/60 backdrop-blur-2xl p-6 sm:p-10 overflow-hidden">
              {/* Window controls bar */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 text-xs font-semibold text-slate-400 tracking-wide">
                    TaskFlow Live Interactive Engine
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Grid content inside mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Interactive Task Card (Interactive Demo) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-brand-700 border border-brand-200">
                          TECH-204
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          High Priority
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          In Progress
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Implement 3D Interactive Showcase & RBAC
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Assigned to:{" "}
                        <span className="font-semibold text-slate-700">
                          Alex Morgan (Frontend Lead)
                        </span>{" "}
                        • Dept:{" "}
                        <span className="font-semibold text-brand-600">
                          Technology & Engineering
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar with Auto-calculated Percentage */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span>⚡</span> Auto-Calculated Progress
                      </span>
                      <span className="font-extrabold text-brand-600 text-sm tabular-nums">
                        {calculatedProgress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${calculatedProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      💡 Click the checkboxes below to see live weighted
                      re-calculation in real-time.
                    </p>
                  </div>

                  {/* Interactive Checklist Items */}
                  <div className="mt-6 space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Weighted Deliverables Checklist
                    </label>
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          item.completed
                            ? "bg-emerald-50/40 border-emerald-200/80 text-slate-800"
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm font-medium ${
                              item.completed ? "line-through text-slate-400" : ""
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          +{item.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Floating Stats & Role Card */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Department Scope Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Active Scope
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Isolated
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/20">
                        TECH
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Technology & Engineering
                        </h4>
                        <p className="text-xs text-slate-500">
                          Manager: Dr. Robert Vance
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submission Versioning Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Latest Submission
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        v2.1 Revision
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-700 flex items-center gap-2">
                          <span>📎</span> app-build-v2.1.zip
                        </span>
                        <span className="text-slate-400">14.2 MB</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-700 flex items-center gap-2">
                          <span>📊</span> benchmark-audit.pdf
                        </span>
                        <span className="text-slate-400">2.8 MB</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Manager Rating:</span>
                      <div className="flex items-center text-amber-400 text-sm">
                        ★★★★★{" "}
                        <span className="text-slate-700 font-bold ml-1 text-xs">
                          5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Launch Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-brand-500/25">
                    <h4 className="font-bold text-base mb-1">
                      Ready to experience it live?
                    </h4>
                    <p className="text-xs text-brand-100 mb-4 leading-relaxed">
                      Register your account, join your department, and start
                      managing tasks with zero friction.
                    </p>
                    <div className="flex items-center gap-2.5">
                      <Link
                        to="/register"
                        className="px-4 py-2 rounded-xl bg-white text-brand-700 font-bold text-xs shadow hover:bg-brand-50 transition-colors"
                      >
                        Register Now
                      </Link>
                      <Link
                        to="/login"
                        className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/30 transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DYNAMIC MOVING CARDS MARQUEE (LIVE WORKFLOW IN MOTION)
          ========================================================================= */}
      <section className="py-16 bg-white/40 backdrop-blur-xl overflow-hidden relative border-y border-white/40">
        {/* Soft edge blur masks for continuous smooth fade on sides */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-slate-200/50 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-slate-300/50 to-transparent z-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            Live Team Activity • Continuous Motion
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Workflows Streaming in Real-Time
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2">
            Hover over any moving card to inspect live task progress, revision scorecards, and department events.
          </p>
        </div>

        {/* Row 1: Moving Left */}
        <div className="flex overflow-hidden py-3">
          <div className="animate-marquee-left flex gap-5 items-center">
            {/* Set 1 */}
            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-brand-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  TECH-204
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  In Progress (85%)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                3D Interactive Showcase & RBAC
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👤 Alex Morgan (Tech)</span>
                <span className="font-bold text-brand-600">85% done</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-emerald-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Manager Review
                </span>
                <div className="flex text-amber-400 text-xs">★★★★★ 5.0</div>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                v2.4 Deliverable Approved & Signed Off
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Outstanding test coverage and zero regressions."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-600">
                ✓ Dr. Robert Vance • Tech Lead
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-blue-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  MKT-301
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed (100%)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Q4 Global Marketing Brand Refresh
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👤 Sarah Connor (MKT)</span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-violet-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  RND-109
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Submitted
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                AI Embeddings Benchmark Pipeline
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>📎 4 files attached (22 MB)</span>
                <span className="font-semibold text-slate-700">v1.3</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            {/* Set 2 (Duplicate for continuous loop) */}
            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-brand-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  TECH-204
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  In Progress (85%)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                3D Interactive Showcase & RBAC
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👤 Alex Morgan (Tech)</span>
                <span className="font-bold text-brand-600">85% done</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-emerald-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Manager Review
                </span>
                <div className="flex text-amber-400 text-xs">★★★★★ 5.0</div>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                v2.4 Deliverable Approved & Signed Off
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Outstanding test coverage and zero regressions."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-600">
                ✓ Dr. Robert Vance • Tech Lead
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-blue-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  MKT-301
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed (100%)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Q4 Global Marketing Brand Refresh
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👤 Sarah Connor (MKT)</span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-violet-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  RND-109
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Submitted
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                AI Embeddings Benchmark Pipeline
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>📎 4 files attached (22 MB)</span>
                <span className="font-semibold text-slate-700">v1.3</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Moving Right */}
        <div className="flex overflow-hidden py-3">
          <div className="animate-marquee-right flex gap-5 items-center">
            {/* Set 1 */}
            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-teal-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-teal-700 border border-teal-200">
                  HR-104
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Annual Employee Performance Matrix
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👥 48 profiles audited</span>
                <span className="font-bold text-emerald-600">On Time</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-rose-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Feedback Cycle
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Revision Req
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Changes Requested on API Auth Header
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Please implement refresh token queue retry."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-rose-600">
                v1.1 Revision in progress
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  TECH-115
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  Socket.io Live
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Zero-Downtime Real-time Rooms
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>⚡ Latency: 12ms</span>
                <span className="font-bold text-brand-600">Active</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-amber-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Audit Stream
                </span>
                <span className="text-[10px] font-bold text-amber-600">Security</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                RBAC Role Scoping Verified (Superadmin)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Zero cross-department leak observed."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-amber-700">
                Logged to MongoDB ActivityLog
              </div>
            </div>

            {/* Set 2 (Duplicate for continuous loop) */}
            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-teal-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-teal-700 border border-teal-200">
                  HR-104
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Annual Employee Performance Matrix
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>👥 48 profiles audited</span>
                <span className="font-bold text-emerald-600">On Time</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-rose-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Feedback Cycle
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Revision Req
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Changes Requested on API Auth Header
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Please implement refresh token queue retry."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-rose-600">
                v1.1 Revision in progress
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  TECH-115
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-brand-700 border border-brand-200">
                  Socket.io Live
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                Zero-Downtime Real-time Rooms
              </h4>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>⚡ Latency: 12ms</span>
                <span className="font-bold text-brand-600">Active</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>

            <div className="w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md hover:shadow-xl hover:border-amber-300 hover:scale-[1.03] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Audit Stream
                </span>
                <span className="text-[10px] font-bold text-amber-600">Security</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                RBAC Role Scoping Verified (Superadmin)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                "Zero cross-department leak observed."
              </p>
              <div className="mt-2 text-[10px] font-semibold text-amber-700">
                Logged to MongoDB ActivityLog
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES BENTO GRID (CARDS & GRIDS WITH ANIMATIONS)
          ========================================================================= */}
      <section id="features" className="py-24 bg-white/60 backdrop-blur-xl relative border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Complete Architecture
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Enterprise Discipline
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Every detail is calibrated for clarity. No cluttered boards or
              confusing permissions. Just transparent execution.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-slate-50/80 hover:bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-brand-200/80 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-brand-50 border border-slate-200/70 group-hover:border-brand-200 flex items-center justify-center text-2xl shadow-sm transition-colors">
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200/60">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          DEPARTMENTS SHOWCASE GRID
          ========================================================================= */}
      <section id="departments" className="py-24 bg-white/40 backdrop-blur-xl relative border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Department Scoping
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Pre-Configured Department Units
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Select your department during registration. Managers only access
              their team's deliverables, while Superadmins supervise all units.
            </p>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentsList.map((dept) => (
              <div
                key={dept.code}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${dept.accent}`}
                    >
                      {dept.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {dept.tasks} Active Tasks
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Auto-Scoped
                  </span>
                  <Link
                    to="/register"
                    className="text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                  >
                    Join Dept →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (WORKFLOW JOURNEY)
          ========================================================================= */}
      <section id="workflow" className="py-24 bg-white/60 backdrop-blur-xl relative border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Clear 4-Step Pipeline
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              From Task Creation to Executive Sign-Off
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Every deliverable travels along a strict, audited progression path
              with transparent milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((s, idx) => (
              <div
                key={idx}
                className="relative bg-slate-50/60 rounded-3xl border border-slate-200/80 p-8 flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all"
              >
                <div>
                  <div className="text-4xl font-black text-slate-200 mb-4 select-none">
                    {s.step}
                  </div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-2">
                    {s.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-400">
                  Phase {idx + 1} Pipeline
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM HIGH-IMPACT CTA SECTION
          ========================================================================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 p-8 sm:p-14 text-white shadow-2xl shadow-brand-500/30 overflow-hidden text-center">
            {/* Ambient inner glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-400/20 blur-3xl" />

            <h2 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Upgrade Your Team's Productivity?
            </h2>
            <p className="relative mt-4 text-base sm:text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
              Join TaskFlow today. Manage departments, track progress with
              weighted precision, and deliver results with confidence.
            </p>

            <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-brand-700 font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Create Account Now →
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-base border border-white/20 transition-colors"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="border-t border-white/40 bg-white/70 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TaskFlowLogo size="sm" />
            <span className="text-xs text-slate-400 ml-1">
              © {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/login" className="hover:text-brand-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-brand-600 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
