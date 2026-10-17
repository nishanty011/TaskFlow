/**
 * TaskFlowLogo - Reusable brand logo component.
 * Renders the icon + two-tone text in different size variants.
 *
 * Props:
 *  size   - "sm" | "md" | "lg"  (default: "md")
 *  showText - boolean (default: true)
 */
export default function TaskFlowLogo({ size = "md", showText = true, className = "" }) {
  const sizes = {
    sm: { icon: 32, svg: 16, text: "text-base", gap: "gap-2" },
    md: { icon: 44, svg: 22, text: "text-xl",   gap: "gap-3" },
    lg: { icon: 56, svg: 28, text: "text-3xl",  gap: "gap-4" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <span className={`flex items-center ${s.gap} ${className}`}>
      {/* Brand icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md"
      >
        <defs>
          <linearGradient id="tfLogoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="44" height="44" rx="12" fill="url(#tfLogoGrad)" />
        {/* Three dots */}
        <circle cx="14" cy="11" r="2" fill="white" fillOpacity="0.75" />
        <circle cx="21" cy="11" r="2" fill="white" fillOpacity="0.75" />
        <circle cx="28" cy="11" r="2" fill="white" fillOpacity="0.75" />
        {/* Checkmark */}
        <path
          d="M11 23L17.5 30L33 16"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Smile arc */}
        <path
          d="M15 37 Q22 41 29 37"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Two-tone brand name */}
      {showText && (
        <span className={`font-extrabold tracking-tight ${s.text}`}>
          <span className="text-slate-900">Task</span>
          <span className="text-brand-600">Flow</span>
        </span>
      )}
    </span>
  );
}
