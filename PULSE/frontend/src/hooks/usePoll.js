import { useState, useEffect, useCallback } from 'react';
import pollService from '../services/pollService';
import voteService from '../services/voteService';
import { useAuth } from './useAuth';

export function usePoll(pollId) {
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPollData = useCallback(async (silent = false) => {
    if (!pollId) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [pollData, resultsData, votedStatus] = await Promise.all([
        pollService.getPollById(pollId),
        pollService.getPollResults(pollId).catch(() => null),
        voteService.checkHasVoted(pollId, user?.id).catch(() => false),
      ]);
      setPoll(pollData.poll || pollData);
      if (resultsData) {
        setResults(resultsData.results || resultsData);
      }
      setHasVoted(votedStatus);
    } catch (err) {
      console.error('Failed to load poll:', err);
      if (!silent) {
        setError(err.response?.data?.message || err.message || 'Failed to load poll');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [pollId, user?.id]);

  useEffect(() => {
    fetchPollData();
  }, [fetchPollData]);

  const castVote = async (optionIds) => {
    if (!pollId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await voteService.submitVote(pollId, optionIds, user?.id);
      setHasVoted(true);
      if (response.results) {
        setResults(response.results);
      }
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit vote';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetVote = () => {
    voteService.resetDeviceVote(pollId, user?.id);
    setHasVoted(false);
    setError(null);
  };

  return {
    poll,
    results,
    loading,
    error,
    hasVoted,
    isSubmitting,
    refreshPoll: fetchPollData,
    castVote,
    resetVote,
    setResults,
    setPoll,
  };
}

export default usePoll;
