import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  Sun,
  Moon,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-navy-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-pulse-500/25 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-pulse-700 to-indigo-600 dark:from-white dark:via-pulse-300 dark:to-indigo-300 bg-clip-text text-transparent">
                PULSE
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 hidden sm:inline">
                Real-Time Polling
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAuthenticated ? (
              <>
                <a
                  href="/#features"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isCurrentPath('/dashboard')
                      ? 'bg-pulse-50 text-pulse-700 dark:bg-navy-800 dark:text-pulse-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/polls"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isCurrentPath('/polls')
                      ? 'bg-pulse-50 text-pulse-700 dark:bg-navy-800 dark:text-pulse-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>My Polls</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    to="/polls/create"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-md shadow-pulse-500/25 flex items-center space-x-2 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Poll</span>
                  </Link>
                )}

                {/* User menu avatar */}
                <div className="flex items-center pl-2 space-x-2 border-l border-slate-200 dark:border-navy-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pulse-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-inner">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                      {user?.name || user?.email}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-md shadow-pulse-500/20 flex items-center space-x-1.5 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200 dark:border-navy-800 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-slate-200 dark:border-navy-800 mb-2">
                <div className="w-9 h-9 rounded-full bg-pulse-600 flex items-center justify-center text-white font-bold">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{user?.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <LayoutDashboard className="w-5 h-5 text-pulse-500" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/polls"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <BarChart3 className="w-5 h-5 text-pulse-500" />
                <span className="font-medium">My Polls</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/polls/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-pulse-600 text-white font-semibold shadow-md"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create New Poll</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
              >
                How It Works
              </a>
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 font-semibold text-slate-800 dark:text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-pulse-600 to-indigo-600 font-semibold text-white shadow-md"
                >
                  Get Started Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
