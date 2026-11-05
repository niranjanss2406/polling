import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import PollCard from '../components/dashboard/PollCard';
import Loader from '../components/common/Loader';
import pollService from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { subscribePulseEvents } from '../utils/broadcast';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Radio,
  Sparkles,
  ShieldCheck,
  Vote,
  Users,
} from 'lucide-react';

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await pollService.getMyPolls();
      const pollList = data.polls || data || [];
      setPolls(pollList);
    } catch (err) {
      console.error('Failed to load polls:', err);
      if (!silent) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time handler to update poll counts and platform stats instantly
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

  // Global WebSocket listener for live platform events
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
        fetchDashboardData(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const handleStatusChange = async (pollId, action) => {
    try {
      if (action === 'close') {
        await pollService.closePoll(pollId);
      } else {
        await pollService.reopenPoll(pollId);
      }
      fetchDashboardData();
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
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  // Derive real statistics from MongoDB backend data
  const totalPolls = polls.length;
  const totalVotes = polls.reduce((sum, p) => sum + (p.total_votes || 0), 0);
  const activePolls = polls.filter((p) => {
    if (p.status === 'closed') return false;
    if (p.expires_at && new Date(p.expires_at).getTime() <= Date.now()) return false;
    return true;
  }).length;
  const closedPolls = totalPolls - activePolls;

  return (
    <div className="flex-1 flex bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? 'Admin Operations Dashboard' : 'Live Interactive Polling Hub'}
              </h1>
              {isAdmin ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pulse-500/10 text-pulse-600 dark:text-pulse-400 border border-pulse-500/20">
                  <Vote className="w-3.5 h-3.5" />
                  <span>Voter</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin
                ? 'Create, manage, close, and monitor live interactive polls in real time.'
                : `Welcome ${user?.name || ''}! Cast your votes in real time and inspect live community results.`}
            </p>
          </div>

          {isAdmin ? (
            <Link
              to="/polls/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-lg shadow-pulse-500/25 transition-all transform hover:-translate-y-0.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Poll</span>
            </Link>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
              <Users className="w-4 h-4 text-pulse-500" />
              <span>Authenticated Voter Account</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title={isAdmin ? 'Total Polls' : 'Available Polls'}
            value={totalPolls}
            subtitle={isAdmin ? 'Created by Admin' : 'Open for participation'}
            icon={BarChart3}
            color="pulse"
          />
          <StatsCard
            title="Total Votes"
            value={totalVotes}
            subtitle="Audience engagement"
            icon={TrendingUp}
            color="emerald"
          />
          <StatsCard
            title="Active Polls"
            value={activePolls}
            subtitle="Accepting votes now"
            icon={Radio}
            color="cyan"
          />
          <StatsCard
            title="Closed Polls"
            value={closedPolls}
            subtitle="Concluded sessions"
            icon={Clock}
            color="amber"
          />
        </div>

        {/* Recent Polls Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{isAdmin ? 'Managed Interactive Polls' : 'Live Community Polls'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold">
                {polls.length}
              </span>
            </h2>

            <Link
              to="/polls"
              className="text-xs font-semibold text-pulse-600 dark:text-pulse-400 hover:underline"
            >
              View All Polls →
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800">
              <Loader text="Aggregating live polls..." />
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-navy-900 rounded-3xl border border-dashed border-slate-300 dark:border-navy-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pulse-50 dark:bg-navy-800 text-pulse-600 dark:text-pulse-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                No Polls Available Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isAdmin
                  ? 'Get started by creating your very first real-time poll and sharing the link with your audience.'
                  : 'The administrator has not published any live polls yet. Please check back shortly!'}
              </p>
              {isAdmin && (
                <Link
                  to="/polls/create"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-pulse-600 text-white hover:bg-pulse-500 shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Poll</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.slice(0, 6).map((poll) => (
                <PollCard
                  key={poll.id || poll._id}
                  poll={poll}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
