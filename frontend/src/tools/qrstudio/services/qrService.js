// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'qrstudio_records';

const getRecordsData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRecordsData = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const qrService = {
  getRecords: async () => {
    const records = getRecordsData();
    return { results: records, count: records.length };
  },
  saveRecord: async (data) => {
    const records = getRecordsData();
    const newRecord = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    records.unshift(newRecord);
    saveRecordsData(records);
    return newRecord;
  },
  deleteRecord: async (id) => {
    const records = getRecordsData();
    const filtered = records.filter(r => r.id !== id);
    saveRecordsData(filtered);
  }
};

export default qrService;
