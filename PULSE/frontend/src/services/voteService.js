import api from './api';
import { broadcastPulseEvent } from '../utils/broadcast';

export const voteService = {
  getOrCreateVoterId(forceNew = false) {
    let voterId = localStorage.getItem('pulse_voter_id');
    if (!voterId || forceNew) {
      // Generate a crypto-random UUID for anonymous audience voter identification
      voterId =
        'voter_' +
        Date.now().toString(36) +
        '_' +
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
      localStorage.setItem('pulse_voter_id', voterId);
    }
    return voterId;
  },

  getStorageKey(userId) {
    return userId ? `pulse_voted_user_${userId}` : 'pulse_voted_guest';
  },

  hasVotedLocally(pollId, userId = null) {
    const key = this.getStorageKey(userId);
    const votedPolls = JSON.parse(localStorage.getItem(key) || '{}');
    if (votedPolls[pollId]) return true;

    // Check legacy key for backward compatibility
    const legacy = JSON.parse(localStorage.getItem('pulse_voted_polls') || '{}');
    return !userId && !!legacy[pollId];
  },

  markVotedLocally(pollId, optionIds, userId = null) {
    const key = this.getStorageKey(userId);
    const votedPolls = JSON.parse(localStorage.getItem(key) || '{}');
    votedPolls[pollId] = {
      optionIds,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(votedPolls));

    if (!userId) {
      const legacy = JSON.parse(localStorage.getItem('pulse_voted_polls') || '{}');
      legacy[pollId] = true;
      localStorage.setItem('pulse_voted_polls', JSON.stringify(legacy));
    }
  },

  async checkHasVoted(pollId, userId = null) {
    try {
      const voterId = this.getOrCreateVoterId();
      const response = await api.get(`/api/polls/${pollId}/voted`, {
        headers: voterId ? { 'X-Voter-ID': voterId } : {},
      });
      const serverHasVoted = response.data?.has_voted;
      if (serverHasVoted) {
        this.markVotedLocally(pollId, [], userId);
        return true;
      }
      return this.hasVotedLocally(pollId, userId);
    } catch {
      return this.hasVotedLocally(pollId, userId);
    }
  },

  resetDeviceVote(pollId, userId = null) {
    // Generate fresh anonymous voter ID
    this.getOrCreateVoterId(true);

    // Clear local cache for this poll
    const key = this.getStorageKey(userId);
    const votedPolls = JSON.parse(localStorage.getItem(key) || '{}');
    delete votedPolls[pollId];
    localStorage.setItem(key, JSON.stringify(votedPolls));

    const legacy = JSON.parse(localStorage.getItem('pulse_voted_polls') || '{}');
    delete legacy[pollId];
    localStorage.setItem('pulse_voted_polls', JSON.stringify(legacy));
  },

  async submitVote(pollId, optionIds, userId = null) {
    const voterId = this.getOrCreateVoterId();
    const response = await api.post(`/api/polls/${pollId}/vote`, {
      option_ids: optionIds,
      voter_id: voterId,
    });
    this.markVotedLocally(pollId, optionIds, userId);

    // Broadcast in real-time across all open tabs on this browser
    const latestResults = response.data?.results || response.data;
    broadcastPulseEvent({
      type: 'vote_cast',
      pollId,
      results: latestResults,
      optionIds,
    });

    return response.data;
  },
};

export default voteService;
