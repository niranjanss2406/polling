import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  PowerOff,
  RotateCcw,
  ExternalLink,
  Vote,
  X,
} from 'lucide-react';
import { formatDate, formatTimeRemaining, isPollActive } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import SharePoll from '../polls/SharePoll';

export function PollCard({ poll, onStatusChange, onDelete }) {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const active = isPollActive(poll);
  const timeRemaining = formatTimeRemaining(poll.expires_at);
  const pollId = poll.id || poll._id;

  return (
    <>
      <div className="relative group bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        {/* Top badges */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400 border border-slate-200 dark:border-navy-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {active ? 'Active' : 'Closed'}
              </span>

              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400">
                {poll.allow_multiple ? 'Multiple Choice' : 'Single Choice'}
              </span>
            </div>

            {/* Admin action dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
                  aria-label="Admin Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-44 rounded-xl glass-panel shadow-xl py-1 z-30 border border-slate-200 dark:border-navy-700 animate-fade-in"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {onStatusChange && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onStatusChange(pollId, active ? 'close' : 'reopen');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center space-x-2"
                      >
                        {active ? (
                          <>
                            <PowerOff className="w-3.5 h-3.5 text-amber-500" />
                            <span>Close Voting</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Reopen Poll</span>
                          </>
                        )}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(pollId);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Poll</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question & Description */}
          <Link
            to={active ? `/poll/${pollId}` : `/results/${pollId}`}
            className="block group-hover:text-pulse-600 dark:group-hover:text-pulse-400 transition-colors"
          >
            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
              {poll.question}
            </h3>
          </Link>

          {poll.description && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {poll.description}
            </p>
          )}

          {/* Options Preview */}
          <div className="mt-4 space-y-1.5">
            {poll.options?.slice(0, 3).map((opt) => (
              <div
                key={opt.id}
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-navy-800/60 text-slate-600 dark:text-slate-300"
              >
                <span className="truncate max-w-[180px]">{opt.text}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {opt.votes || 0} votes
                </span>
              </div>
            ))}
            {poll.options?.length > 3 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>
        </div>

        {/* Footer Info & Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {poll.total_votes || 0} Total Votes
            </span>
            {timeRemaining ? (
              <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeRemaining}</span>
              </span>
            ) : (
              <span>Created {formatDate(poll.created_at)}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {active ? (
              <Link
                to={`/poll/${pollId}`}
                className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-sm shadow-pulse-500/25 transition-all text-center"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>Vote</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500 text-center">
                Closed
              </div>
            )}

            <Link
              to={`/results/${pollId}`}
              className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 transition-colors text-center"
            >
              <BarChart2 className="w-3.5 h-3.5 text-pulse-500" />
              <span>Results</span>
            </Link>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 transition-colors text-center"
            >
              <Share2 className="w-3.5 h-3.5 text-pulse-500" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-navy-700">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <SharePoll pollId={pollId} question={poll.question} />
          </div>
        </div>
      )}
    </>
  );
}

export default PollCard;
