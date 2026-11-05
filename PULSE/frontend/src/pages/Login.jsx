import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Activity,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Vote,
  Sparkles,
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('niranjanss2406@gmail.com');
    setPassword('niranjan$$2007');
  };

  const fillVoter = () => {
    setEmail('alex_voter@pulse.dev');
    setPassword('Pulse2026!');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-pulse-600 to-indigo-700 items-center justify-center shadow-lg shadow-pulse-500/25 mb-2">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to PULSE
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to create polls as Admin, or cast real-time votes as a verified voter.
          </p>
        </div>

        {/* Expired alert */}
        {sessionExpired && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="niranjanss2406@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-lg shadow-pulse-500/25 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 mt-2 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Autofill Buttons for Testing */}
          <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">
              Quick Sign In Shortcuts
            </p>

            <button
              type="button"
              onClick={fillAdmin}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Sign in as Admin (niranjanss2406@gmail.com)</span>
            </button>

            <button
              type="button"
              onClick={fillVoter}
              className="w-full py-2 px-3 rounded-xl bg-pulse-500/10 hover:bg-pulse-500/20 text-pulse-600 dark:text-pulse-400 border border-pulse-500/20 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Vote className="w-4 h-4 text-pulse-500" />
              <span>Sign in as Demo Voter (alex_voter@pulse.dev)</span>
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Invited friend?{' '}
          <Link
            to="/register"
            className="font-semibold text-pulse-600 dark:text-pulse-400 hover:underline"
          >
            Create a free voter account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
