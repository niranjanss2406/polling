import React from 'react';

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'pulse' }) {
  const colorMap = {
    pulse: {
      bg: 'from-pulse-500/10 to-indigo-500/10',
      border: 'border-pulse-500/20',
      iconBg: 'bg-pulse-500/20 text-pulse-600 dark:text-pulse-400',
      glow: 'group-hover:shadow-pulse-500/10',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    amber: {
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-blue-500/10',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      glow: 'group-hover:shadow-cyan-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.pulse;

  return (
    <div className={`group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-navy-900 border ${scheme.border} shadow-sm hover:shadow-xl ${scheme.glow} transition-all duration-300 transform hover:-translate-y-0.5`}>
      <div className={`absolute -right-4 -bottom-4 w-28 h-28 bg-gradient-to-br ${scheme.bg} rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150`} />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="text-emerald-500 font-semibold mr-1.5">{trend.direction === 'up' ? '↑' : '↓'} {trend.label}</span>
          <span>{trend.context}</span>
        </div>
      )}
    </div>
  );
}

export default StatsCard;

