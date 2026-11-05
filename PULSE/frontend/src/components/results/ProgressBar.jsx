import React from 'react';
import { formatPercentage, formatNumber } from '../../utils/formatters';

export function ProgressBar({ label, votes, totalVotes, isLeader = false }) {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  const formattedPct = formatPercentage(votes, totalVotes);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2 truncate">
          <span className={`truncate ${isLeader ? 'text-pulse-600 dark:text-pulse-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
            {label}
          </span>
          {isLeader && totalVotes > 0 && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-pulse-100 text-pulse-700 dark:bg-pulse-950/80 dark:text-pulse-300">
              Leading
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{formattedPct}</span>
          <span className="text-[11px]">({formatNumber(votes)} {votes === 1 ? 'vote' : 'votes'})</span>
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isLeader
              ? 'bg-gradient-to-r from-pulse-600 via-indigo-600 to-pulse-400 shadow-sm shadow-pulse-500/50'
              : 'bg-slate-400 dark:bg-navy-600'
          }`}
          style={{ width: `${Math.max(percentage, totalVotes > 0 ? 1 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

