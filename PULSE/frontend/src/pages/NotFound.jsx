import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-navy-950">
      <div className="text-center max-w-md p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-pulse-50 dark:bg-navy-800 text-pulse-600 dark:text-pulse-400 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404</h1>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The page or live poll session you were looking for doesn&apos;t seem to exist.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-pulse-600 text-white hover:bg-pulse-500 shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

