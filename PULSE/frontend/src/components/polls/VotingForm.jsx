import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  LogIn,
  RotateCcw,
  Users,
} from 'lucide-react';
import { isPollActive, formatTimeRemaining } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export function VotingForm({
  poll,
  onVote,
  onResetVote,
  isSubmitting = false,
  hasVoted = false,
  error = null,
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const active = isPollActive(poll);
  const timeRemaining = formatTimeRemaining(poll.expires_at);

  const handleSelect = (optionId) => {
    if (poll.allow_multiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOptions.length === 0 || !active || isSubmitting) return;

    try {
      await onVote(selectedOptions);
      // Trigger confetti animation for delightful user experience
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#6366f1', '#10b981', '#38bdf8'],
      });
    } catch {
      // Error handled by parent hook
    }
  };

  if (!active) {
    return (
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <Clock className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-base text-amber-700 dark:text-amber-400">Voting is Closed</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          This poll has concluded. You can still view the final real-time results below.
        </p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-300">
          Vote Confirmed!
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {isAuthenticated
            ? `Thank you, ${user?.name || 'Voter'}! Your vote was securely recorded to your user account and synced in real time.`
            : 'Thank you for making your voice heard. Your vote was securely recorded and synced via Redis & WebSockets in real time.'}
        </p>

        {/* Multi-user / Friend voting shortcut */}
        <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-3 text-xs">
          {onResetVote && (
            <button
              type="button"
              onClick={onResetVote}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-navy-800 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-navy-700 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Allow Another Friend / User to Vote on this Device</span>
            </button>
          )}

          {isAuthenticated ? (
            <Link
              to="/login"
              className="text-slate-500 dark:text-slate-400 hover:text-pulse-600 font-medium"
            >
              Switch Account →
            </Link>
          ) : (
            <Link
              to="/register"
              className="text-pulse-600 dark:text-pulse-400 hover:underline font-semibold"
            >
              Create Account to Track My Votes →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User status & Expiration badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isAuthenticated ? (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-pulse-600 dark:text-pulse-400 bg-pulse-50 dark:bg-pulse-950/40 px-3 py-1.5 rounded-xl border border-pulse-200 dark:border-pulse-800/40">
            <UserCheck className="w-3.5 h-3.5 text-pulse-500" />
            <span>
              Voting as: <strong className="font-bold">{user?.name}</strong> ({user?.email})
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-800 px-3 py-1.5 rounded-xl">
            <span>Voting as Guest • </span>
            <Link
              to="/login"
              className="text-pulse-600 dark:text-pulse-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Log in to save to your account</span>
            </Link>
          </div>
        )}

        {timeRemaining && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Closes in {timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Options list */}
      <div className="space-y-3">
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                isSelected
                  ? 'border-pulse-500 bg-pulse-50/50 dark:bg-pulse-950/30 ring-2 ring-pulse-500/30'
                  : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 bg-white dark:bg-navy-800/80 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-5 h-5 rounded-${poll.allow_multiple ? 'md' : 'full'} border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-pulse-600 border-pulse-600 text-white'
                      : 'border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {option.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-4 h-4 text-pulse-500" />
          <span>Unlimited participants • Real-time vote recording</span>
        </div>

        <button
          type="submit"
          disabled={selectedOptions.length === 0 || isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-lg shadow-pulse-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
        >
          {isSubmitting ? 'Recording Vote...' : 'Submit Vote'}
        </button>
      </div>
    </form>
  );
}

export default VotingForm;
