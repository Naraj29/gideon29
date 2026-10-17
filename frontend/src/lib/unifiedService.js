import api from './api';

const unifiedService = {
  /**
   * Fetch all data for a specific day:
   * Returns { diary, calendar: [], projects: [] }
   */
  getDayDetails: async (date) => {
    const response = await api.get('/tools/unified/day/', { params: { date } });
    return response.data;
  },

  /**
   * Fetch the "Time Capsule" history stream:
   * Returns { results: [ { type, id, title, timestamp, preview, meta }, ... ] }
   */
  getHistory: async (limit = 20) => {
    const response = await api.get('/tools/unified/history/', { params: { limit } });
    return response.data;
  },

  /**
   * Fetch presence of all items for a month range.
   */
  getMonthData: async (start_date, end_date) => {
    const response = await api.get('/tools/unified/month/', { params: { start_date, end_date } });
    return response.data;
  }
};

export default unifiedService;
