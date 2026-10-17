// Status color badges and border mappings according to TaskFlow design system

export const TASK_STATUS_CONFIG = {
  assigned: {
    label: 'Assigned',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500'
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500'
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500'
  },
  changes_requested: {
    label: 'Changes Requested',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500'
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500'
  }
};

export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400'
  },
  medium: {
    label: 'Medium',
    bg: 'bg-sky-50 dark:bg-sky-950/50',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500'
  },
  high: {
    label: 'High',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500'
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500'
  }
};

export const USER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500'
  },
  pending_approval: {
    label: 'Pending Approval',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500'
  },
  pending_email: {
    label: 'Pending Email',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400'
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500'
  },
  suspended: {
    label: 'Suspended',
    bg: 'bg-red-50 dark:bg-red-950/50',
    text: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500'
  }
};
