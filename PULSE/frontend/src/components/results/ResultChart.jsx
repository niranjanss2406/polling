import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

export function ResultChart({ options = [], totalVotes = 0 }) {
  const { theme } = useAuth();
  const isDark = theme === 'dark';

  const data = options.map((opt) => ({
    name: opt.text.length > 18 ? opt.text.substring(0, 16) + '...' : opt.text,
    fullName: opt.text,
    votes: opt.votes || 0,
    percentage: totalVotes > 0 ? ((opt.votes || 0) / totalVotes) * 100 : 0,
  }));

  const maxVotes = Math.max(...options.map((o) => o.votes || 0), 0);

  // Gradient colors for bars
  const colors = [
    '#8b5cf6', // pulse violet
    '#6366f1', // indigo
    '#38bdf8', // light blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-200 dark:border-navy-700">
          <p className="font-bold text-slate-900 dark:text-white">{item.fullName}</p>
          <p className="text-pulse-600 dark:text-pulse-400 font-semibold">
            {item.votes} votes ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke={isDark ? '#1e293b' : '#f1f5f9'}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[0, 8, 8, 0]} animationDuration={800}>
            {data.map((entry, index) => {
              const isLeader = entry.votes === maxVotes && maxVotes > 0;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isLeader ? '#8b5cf6' : colors[index % colors.length]}
                  opacity={isLeader ? 1 : 0.8}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResultChart;

