import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${
        glass
          ? 'glass-card'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
      } ${
        hover
          ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action, ...props }) => {
  return (
    <div
      className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {title ? (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      ) : (
        children
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
