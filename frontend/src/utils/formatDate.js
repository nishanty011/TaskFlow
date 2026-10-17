// Date formatting utilities

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return formatDate(dateString);
};

export const isOverdueDate = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
};
