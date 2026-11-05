import React from 'react';
import { Activity, Heart, Shield, Zap, GitBranch, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-navy-800/80 bg-white/50 dark:bg-navy-950/50 backdrop-blur-md transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pulse-600 to-indigo-700 flex items-center justify-center shadow-md shadow-pulse-500/25">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-pulse-700 to-indigo-600 dark:from-white dark:via-pulse-300 dark:to-indigo-300 bg-clip-text text-transparent">
                PULSE
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Every Vote. Every Voice. In Real Time. Next-generation live polling powered by Go, Redis Pub/Sub, MongoDB, and WebSockets.
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full w-fit border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (Redis & WebSocket Engine Active)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-slate-600 hover:text-pulse-600 dark:text-slate-400 dark:hover:text-pulse-400 transition-colors">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link to="/polls/create" className="text-slate-600 hover:text-pulse-600 dark:text-slate-400 dark:hover:text-pulse-400 transition-colors">
                  Create Interactive Poll
                </Link>
              </li>
              <li>
                <Link to="/polls" className="text-slate-600 hover:text-pulse-600 dark:text-slate-400 dark:hover:text-pulse-400 transition-colors">
                  Manage Polls
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Architecture
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Go (Gin)', 'Gorilla WS', 'Redis Pub/Sub', 'MongoDB Atlas', 'React + Vite', 'Tailwind CSS'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300 border border-slate-200 dark:border-navy-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-navy-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} PULSE Inc. HCL GUVI Developer Internship Project.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Engineered with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>for real-time precision</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

