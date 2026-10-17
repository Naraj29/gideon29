// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'vault_entries';

const getVaultData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveVaultData = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const vaultService = {
  getEntries: async (params = {}) => {
    const entries = getVaultData();
    return { results: entries, count: entries.length };
  },
  
  getEntry: async (id) => {
    const entries = getVaultData();
    const entry = entries.find(e => e.id === id);
    return entry || null;
  },

  createEntry: async (data) => {
    const entries = getVaultData();
    const newEntry = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    entries.unshift(newEntry);
    saveVaultData(entries);
    return newEntry;
  },
  
  updateEntry: async (id, data) => {
    const entries = getVaultData();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data };
      saveVaultData(entries);
      return entries[index];
    }
    throw new Error('Entry not found');
  },
  
  deleteEntry: async (id) => {
    const entries = getVaultData();
    const filtered = entries.filter(e => e.id !== id);
    saveVaultData(filtered);
  }
};

export default vaultService;
