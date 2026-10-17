import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className={`w-full text-left text-sm text-slate-700 dark:text-slate-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={`bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', hover = true, ...props }) => {
  return (
    <tr
      className={`transition-colors ${
        hover ? 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th scope="col" className={`px-5 py-3.5 font-semibold text-xs ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-5 py-3.5 text-sm whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  );
};

export default Table;
