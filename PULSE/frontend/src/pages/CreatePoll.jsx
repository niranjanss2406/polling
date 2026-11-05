import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import PollForm from '../components/polls/PollForm';
import pollService from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Sparkles, AlertCircle, ShieldAlert, BarChart3 } from 'lucide-react';

export function CreatePoll() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCreatePoll = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await pollService.createPoll(formData);
      const poll = response.poll || response;
      const pollId = poll.id || poll._id;
      navigate(`/results/${pollId}?created=true`);
    } catch (err) {
      console.error('Failed to create poll:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-12 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Administrator Permission Required
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Only the platform administrator (<strong className="text-slate-800 dark:text-slate-200">niranjanss2406@gmail.com</strong>) is authorized to create and manage polls.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              You are signed in as <strong className="font-semibold">{user?.email || 'a participant'}</strong>. You can participate in all active polls and view live results.
            </p>
          </div>
          <div className="pt-2 flex items-center space-x-3">
            <Link
              to="/polls"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-pulse-600 text-white hover:bg-pulse-500 shadow-md flex items-center space-x-1.5 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Browse Active Polls</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-pulse-600 dark:text-pulse-400">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Real-Time Poll (Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create a New Poll
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Draft questions, configure options, and instantly receive real-time votes.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Poll Form Container */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <PollForm onSubmit={handleCreatePoll} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  );
}

export default CreatePoll;
