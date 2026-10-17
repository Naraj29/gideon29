// src/tools/diary/services/diary.api.js
// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'diary_entries';

const getEntries = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const diaryApi = {
  /** List all entries */
  list: (params = {}) => {
    const entries = getEntries();
    return Promise.resolve({ results: entries, count: entries.length });
  },

  /** Single full entry */
  get: (id) => {
    const entries = getEntries();
    const entry = entries.find(e => e.id === id);
    return Promise.resolve(entry || null);
  },

  /** Create new entry */
  create: (payload) => {
    const entries = getEntries();
    const newEntry = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() };
    entries.unshift(newEntry);
    saveEntries(entries);
    return Promise.resolve(newEntry);
  },

  /** Full update */
  update: (id, payload) => {
    const entries = getEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...payload };
      saveEntries(entries);
      return Promise.resolve(entries[index]);
    }
    return Promise.reject(new Error('Entry not found'));
  },

  /** Partial update */
  patch: (id, payload) => {
    return diaryApi.update(id, payload);
  },

  /** Soft-delete */
  delete: (id) => {
    const entries = getEntries();
    const filtered = entries.filter(e => e.id !== id);
    saveEntries(filtered);
    return Promise.resolve();
  },

  /** Mood distribution stats */
  stats: () => {
    const entries = getEntries();
    const moodCounts = {};
    entries.forEach(e => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
    });
    return Promise.resolve(moodCounts);
  },

  /** Today's entry */
  today: () => {
    const entries = getEntries();
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.created_at?.startsWith(today));
    return Promise.resolve(todayEntry || null);
  },
};
