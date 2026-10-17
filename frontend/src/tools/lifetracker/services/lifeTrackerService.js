// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'lifetracker_records';

const getRecordsData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRecordsData = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const lifeTrackerService = {
  getTodayRecord: async (dateString) => {
    const records = getRecordsData();
    return records.find(r => r.date === dateString) || null;
  },
  
  getHistoryRecords: async () => {
    const records = getRecordsData();
    return { results: records, count: records.length };
  },
  
  createRecord: async (data) => {
    const records = getRecordsData();
    const newRecord = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    records.unshift(newRecord);
    saveRecordsData(records);
    return newRecord;
  },
  
  updateRecord: async (id, data) => {
    const records = getRecordsData();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...data };
      saveRecordsData(records);
      return records[index];
    }
    throw new Error('Record not found');
  }
};

export default lifeTrackerService;
