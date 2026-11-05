import React, { useCallback, useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import usePoll from '../hooks/usePoll';
import useWebSocket from '../hooks/useWebSocket';
import LiveResults from '../components/results/LiveResults';
import SharePoll from '../components/polls/SharePoll';
import Loader from '../components/common/Loader';
import pollService from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import { broadcastPulseEvent, subscribePulseEvents } from '../utils/broadcast';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  PowerOff,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { isPollActive } from '../utils/formatters';

export function PollResults() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const justCreated = queryParams.get('created') === 'true';

  const {
    poll,
    results,
    loading,
    error,
    setResults,
    setPoll,
    refreshPoll,
  } = usePoll(id);

  // Unified vote synchronization handler
  const handleVoteSync = useCallback(
    (update) => {
      const targetPollId = update.pollId || update.poll_id;
      if (targetPollId && targetPollId !== id) return;

      if (update.results) {
        setResults(update.results);
        setPoll((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            total_votes: update.results.total_votes ?? prev.total_votes,
            options: update.results.options ?? prev.options,
          };
        });
      }
      if (update.poll) {
        setPoll(update.poll);
      }
    },
    [id, setResults, setPoll]
  );

  // WebSocket connection for real-time updates
  const handleWebSocketMessage = useCallback(
    (message) => {
      if (message.type === 'vote_update' || message.type === 'initial_state') {
        handleVoteSync(message);
        if (message.type === 'vote_update' && message.results) {
          broadcastPulseEvent({
            type: 'vote_update',
            pollId: message.poll_id || id,
            results: message.results,
          });
        }
      }
    },
    [handleVoteSync, id]
  );

  const { isConnected, liveViewers } = useWebSocket(id, handleWebSocketMessage);

  // Cross-tab real-time sync across multiple open browser tabs
  useEffect(() => {
    const unsubscribe = subscribePulseEvents((event) => {
      if (event.type === 'vote_cast' || event.type === 'vote_update') {
        handleVoteSync(event);
      }
    });
    return unsubscribe;
  }, [handleVoteSync]);

  // Gentle fallback silent background sync every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshPoll(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [refreshPoll]);

  const active = isPollActive(poll);
  const isOwner = user && poll && (user.id === poll.creator_id || user._id === poll.creator_id);

  const handleToggleStatus = async () => {
    try {
      if (active) {
        await pollService.closePoll(id);
      } else {
        await pollService.reopenPoll(id);
      }
      refreshPoll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update poll status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this poll? This cannot be undone.')) {
      return;
    }
    try {
      await pollService.deletePoll(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <Loader size="lg" text="Connecting to live telemetry..." />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-navy-950">
        <div className="text-center max-w-md p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Poll Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'The requested poll results are unavailable.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-pulse-600 text-white hover:bg-pulse-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              to={`/poll/${id}`}
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Voting Link</span>
            </Link>

            {isOwner && (
              <>
                <button
                  onClick={handleToggleStatus}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {active ? (
                    <>
                      <PowerOff className="w-3.5 h-3.5" />
                      <span>Close Poll</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Poll</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Poll"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success alert banner if just created */}
        {justCreated && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">
                Your poll was successfully published! Share the link or QR code below to start receiving real-time votes.
              </span>
            </div>
          </div>
        )}

        {/* Poll Header Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                active
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {active ? 'Live Polling Active' : 'Voting Concluded'}
            </span>

            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {poll.allow_multiple ? 'Multiple Choice' : 'Single Choice'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {poll.question}
          </h1>

          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>

        {/* Live Results Component */}
        <LiveResults
          poll={poll}
          results={results}
          liveViewers={liveViewers}
          isConnected={isConnected}
          onRefresh={refreshPoll}
        />

        {/* Sharing and QR Section */}
        <SharePoll pollId={id} question={poll.question} />
      </div>
    </div>
  );
}

export default PollResults;

