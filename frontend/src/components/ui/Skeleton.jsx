import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-800';

  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 my-1 w-full'
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-5 rounded-2xl space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-1.5 flex-1">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-1/4 h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" className="w-full h-20" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton variant="rectangular" className="w-20 h-6" />
      <Skeleton variant="rectangular" className="w-24 h-8" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-3">
    <Skeleton variant="rectangular" className="w-full h-10" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} variant="rectangular" className="flex-1 h-8" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
