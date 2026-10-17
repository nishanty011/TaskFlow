import React from 'react';
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG, USER_STATUS_CONFIG } from '../../utils/statusColors';

export const Badge = ({
  children,
  variant,
  status,
  priority,
  userStatus,
  size = 'md',
  dot = true,
  className = ''
}) => {
  let styleClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  let labelText = children;
  let dotColor = 'bg-slate-400';

  if (status && TASK_STATUS_CONFIG[status]) {
    const config = TASK_STATUS_CONFIG[status];
    styleClasses = `${config.bg} ${config.text} border ${config.border}`;
    labelText = children || config.label;
    dotColor = config.dot;
  } else if (priority && PRIORITY_CONFIG[priority]) {
    const config = PRIORITY_CONFIG[priority];
    styleClasses = `${config.bg} ${config.text}`;
    labelText = children || config.label;
    dotColor = config.dot;
  } else if (userStatus && USER_STATUS_CONFIG[userStatus]) {
    const config = USER_STATUS_CONFIG[userStatus];
    styleClasses = `${config.bg} ${config.text}`;
    labelText = children || config.label;
    dotColor = config.dot;
  } else if (variant === 'brand') {
    styleClasses = 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800';
    dotColor = 'bg-brand-500';
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full shrink-0 tracking-wide select-none ${sizes[size]} ${styleClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {labelText}
    </span>
  );
};

export default Badge;
