// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'promise_entries';

const getEntriesData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveEntriesData = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const promiseService = {
  getEntries: async (params = {}) => {
    const entries = getEntriesData();
    return { results: entries, count: entries.length };
  },
  createEntry: async (data) => {
    const entries = getEntriesData();
    const newEntry = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    entries.unshift(newEntry);
    saveEntriesData(entries);
    return newEntry;
  },
  updateEntry: async (id, data) => {
    const entries = getEntriesData();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data };
      saveEntriesData(entries);
      return entries[index];
    }
    throw new Error('Entry not found');
  },
  deleteEntry: async (id) => {
    const entries = getEntriesData();
    const filtered = entries.filter(e => e.id !== id);
    saveEntriesData(filtered);
  }
};

export default promiseService;
