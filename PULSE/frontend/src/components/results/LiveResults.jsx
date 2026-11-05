import React, { useState } from 'react';
import { Radio, Users, BarChart2, PieChart, Activity, RefreshCw } from 'lucide-react';
import ProgressBar from './ProgressBar';
import ResultChart from './ResultChart';
import { formatNumber } from '../../utils/formatters';

export function LiveResults({
  poll,
  results,
  liveViewers = 1,
  isConnected = true,
  onRefresh = null,
}) {
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'chart'

  const options = results?.options || poll?.options || [];
  const totalVotes = results?.total_votes ?? poll?.total_votes ?? 0;
  const maxVotes = Math.max(...options.map((o) => o.votes || 0), 0);

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-navy-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              )}
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Live Results</span>
              {isConnected && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Real-Time
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Updates stream directly via Redis Pub/Sub & WebSockets.
          </p>
        </div>

        {/* View toggles & status */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Live viewers indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-pulse-500" />
            <span>{liveViewers} watching</span>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('bars')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'bars'
                  ? 'bg-white dark:bg-navy-700 text-pulse-600 dark:text-pulse-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Progress bars view"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-navy-700 text-pulse-600 dark:text-pulse-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Interactive chart view"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Resynchronize results"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Total Votes Stat Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-800/40 border border-slate-100 dark:border-navy-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total Cast Votes
        </span>
        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
          {formatNumber(totalVotes)}
        </span>
      </div>

      {/* Visual representation */}
      {viewMode === 'bars' ? (
        <div className="space-y-4 pt-1">
          {options.map((opt) => (
            <ProgressBar
              key={opt.id}
              label={opt.text}
              votes={opt.votes || 0}
              totalVotes={totalVotes}
              isLeader={(opt.votes || 0) === maxVotes && maxVotes > 0}
            />
          ))}
        </div>
      ) : (
        <div className="pt-2">
          <ResultChart options={options} totalVotes={totalVotes} />
        </div>
      )}
    </div>
  );
}

export default LiveResults;

