import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import PollCard from '../components/dashboard/PollCard';
import Loader from '../components/common/Loader';
import pollService from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { subscribePulseEvents } from '../utils/broadcast';
import { isPollActive } from '../utils/formatters';
import {
  Search,
  Filter,
  PlusCircle,
  BarChart3,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export function MyPolls() {
  const { isAdmin } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'closed'

  const fetchPolls = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await pollService.getMyPolls();
      const pollList = data.polls || data || [];
      setPolls(pollList);
    } catch (err) {
      console.error('Failed to load polls:', err);
      if (!silent) {
        setError(err.response?.data?.message || err.message || 'Failed to load polls');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // Real-time vote update handler
  const handleVoteUpdate = useCallback((update) => {
    const updatedPollId = update.pollId || update.poll_id;
    const newResults = update.results;
    if (!updatedPollId) return;

    setPolls((prevPolls) =>
      prevPolls.map((p) => {
        const pId = p.id || p._id;
        if (pId === updatedPollId) {
          return {
            ...p,
            total_votes: newResults?.total_votes ?? (p.total_votes || 0) + 1,
            options: newResults?.options ?? p.options,
          };
        }
        return p;
      })
    );
  }, []);

  // Global WebSocket listener
  const handleWebSocketMessage = useCallback(
    (message) => {
      if (message.type === 'vote_update') {
        handleVoteUpdate(message);
      }
    },
    [handleVoteUpdate]
  );
  useWebSocket('global', handleWebSocketMessage);

  // Cross-tab real-time sync
  useEffect(() => {
    const unsubscribe = subscribePulseEvents((event) => {
      if (event.type === 'vote_cast' || event.type === 'vote_update') {
        handleVoteUpdate(event);
      }
    });
    return unsubscribe;
  }, [handleVoteUpdate]);

  // Gentle fallback silent background sync every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchPolls(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchPolls]);

  const handleStatusChange = async (pollId, action) => {
    try {
      if (action === 'close') {
        await pollService.closePoll(pollId);
      } else {
        await pollService.reopenPoll(pollId);
      }
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update poll status');
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This cannot be undone.')) {
      return;
    }
    try {
      await pollService.deletePoll(pollId);
      fetchPolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  // Filter & Search
  const filteredPolls = polls.filter((p) => {
    const matchesSearch =
      (p.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const active = isPollActive(p);

    if (filterStatus === 'active') return matchesSearch && active;
    if (filterStatus === 'closed') return matchesSearch && !active;
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isAdmin ? 'My Polls Library' : 'Live Polls Directory'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin
                ? 'Manage, monitor, and distribute your created polls.'
                : 'Browse live polls, cast your vote, and view interactive community results.'}
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/polls/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-lg shadow-pulse-500/25 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Poll</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls by title or text..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-pulse-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-pulse-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              All ({polls.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'active'
                  ? 'bg-pulse-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'closed'
                  ? 'bg-pulse-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Poll Cards Grid */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800">
            <Loader text="Loading your polls library..." />
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-navy-900 rounded-3xl border border-dashed border-slate-300 dark:border-navy-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pulse-50 dark:bg-navy-800 text-pulse-600 dark:text-pulse-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {searchQuery ? 'No Matching Polls Found' : 'No Polls In This View'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No polls matched "${searchQuery}". Try a different keyword.`
                : 'Create your next poll or adjust your status filters above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id || poll._id}
                poll={poll}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyPolls;

