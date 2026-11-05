import api from './api';

export const pollService = {
  async createPoll(pollData) {
    const response = await api.post('/api/polls', pollData);
    return response.data;
  },

  async getMyPolls() {
    const response = await api.get('/api/polls');
    return response.data;
  },

  async getPollById(id) {
    const response = await api.get(`/api/polls/${id}`);
    return response.data;
  },

  async updatePoll(id, pollData) {
    const response = await api.put(`/api/polls/${id}`, pollData);
    return response.data;
  },

  async deletePoll(id) {
    const response = await api.delete(`/api/polls/${id}`);
    return response.data;
  },

  async closePoll(id) {
    const response = await api.patch(`/api/polls/${id}/close`);
    return response.data;
  },

  async reopenPoll(id) {
    const response = await api.patch(`/api/polls/${id}/reopen`);
    return response.data;
  },

  async getPollResults(id) {
    const response = await api.get(`/api/polls/${id}/results`);
    return response.data;
  },
};

export default pollService;

