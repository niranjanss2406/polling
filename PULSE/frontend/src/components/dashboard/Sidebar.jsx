import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: isAdmin ? 'Manage Polls' : 'Available Polls', path: '/polls', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'Create Poll', path: '/polls/create', icon: PlusCircle }] : []),
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col flex-shrink-0 border-r border-slate-200/80 dark:border-navy-800/80 bg-white dark:bg-navy-900 min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200">
      {/* Navigation items */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pulse-600 to-indigo-600 text-white shadow-md shadow-pulse-500/20'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Real-time Status Card */}
      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-pulse-500/10 via-indigo-500/5 to-transparent border border-pulse-500/20">
        <div className="flex items-center space-x-2 text-xs font-bold text-pulse-600 dark:text-pulse-400 uppercase tracking-wider">
          <Radio className="w-4 h-4 animate-pulse text-rose-500" />
          <span>Real-Time Engine</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          WebSocket & Redis Pub/Sub channels push live votes with sub-50ms latency.
        </p>
      </div>

      {/* User info footer */}
      <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-navy-800/80">
        <div className="flex items-center space-x-3 px-2 py-2 rounded-xl bg-slate-50 dark:bg-navy-800/50">
          <div className="w-9 h-9 rounded-full bg-pulse-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              {isAdmin && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-extrabold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
