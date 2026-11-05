import React from 'react';
import { Activity } from 'lucide-react';

export function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative flex items-center justify-center">
        <div className={`animate-spin rounded-full border-2 border-pulse-200 border-t-pulse-600 dark:border-navy-700 dark:border-t-pulse-400 ${sizeClasses[size] || sizeClasses.md}`} />
        <Activity className={`absolute text-pulse-600 dark:text-pulse-400 animate-pulse ${size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
      </div>
      {text && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export default Loader;

