import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description,
  message,
  actionLabel,
  onAction,
  className = ''
}) => {
  const desc = description || message || 'There are currently no items to display.';
  const isString = typeof Icon === 'string';

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 shadow-sm text-2xl">
        {isString ? (
          <span>{Icon}</span>
        ) : typeof Icon === 'function' ? (
          <Icon className="w-7 h-7" />
        ) : (
          Icon
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {desc}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
