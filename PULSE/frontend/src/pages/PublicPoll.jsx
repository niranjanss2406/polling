import React, { useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePoll from '../hooks/usePoll';
import useWebSocket from '../hooks/useWebSocket';
import VotingForm from '../components/polls/VotingForm';
import LiveResults from '../components/results/LiveResults';
import SharePoll from '../components/polls/SharePoll';
import Loader from '../components/common/Loader';
import { broadcastPulseEvent, subscribePulseEvents } from '../utils/broadcast';
import { Activity, Radio, AlertCircle, ArrowLeft, BarChart2 } from 'lucide-react';

export function PublicPoll() {
  const { pollId } = useParams();
  const {
    poll,
    results,
    loading,
    error,
    hasVoted,
    isSubmitting,
    castVote,
    resetVote,
    setResults,
    setPoll,
    refreshPoll,
  } = usePoll(pollId);

  // Unified vote synchronization handler
  const handleVoteSync = useCallback(
    (update) => {
      const targetPollId = update.pollId || update.poll_id;
      if (targetPollId && targetPollId !== pollId) return;

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
    [pollId, setResults, setPoll]
  );

  // WebSocket for real-time live results sync
  const handleWebSocketMessage = useCallback(
    (message) => {
      if (message.type === 'vote_update' || message.type === 'initial_state') {
        handleVoteSync(message);
        // Relay to other tabs on the same device so non-websocket tabs catch it instantly
        if (message.type === 'vote_update' && message.results) {
          broadcastPulseEvent({
            type: 'vote_update',
            pollId: message.poll_id || pollId,
            results: message.results,
          });
        }
      }
    },
    [handleVoteSync, pollId]
  );

  const { isConnected, liveViewers } = useWebSocket(pollId, handleWebSocketMessage);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <Loader size="lg" text="Connecting to live poll..." />
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
            {error || 'This poll does not exist or may have been removed by its creator.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-pulse-600 text-white hover:bg-pulse-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PULSE Platform</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              )}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isConnected ? `${liveViewers} live viewers` : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Poll Voting Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pulse-600 dark:text-pulse-400">
                {poll.allow_multiple ? 'Multiple Choice Voting' : 'Single Choice Voting'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {poll.question}
            </h1>
            {poll.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                {poll.description}
              </p>
            )}
          </div>

          <VotingForm
            poll={poll}
            onVote={castVote}
            onResetVote={resetVote}
            isSubmitting={isSubmitting}
            hasVoted={hasVoted}
            error={error}
          />
        </div>

        {/* Live Results Section */}
        <LiveResults
          poll={poll}
          results={results}
          liveViewers={liveViewers}
          isConnected={isConnected}
          onRefresh={refreshPoll}
        />

        {/* QR Code and Sharing */}
        <SharePoll pollId={pollId} question={poll.question} />
      </div>
    </div>
  );
}

export default PublicPoll;

