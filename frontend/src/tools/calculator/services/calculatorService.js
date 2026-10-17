// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'calculator_history';

const getHistoryData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveHistoryData = (history) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const calculatorService = {
  getHistory: async () => {
    const history = getHistoryData();
    return { results: history, count: history.length };
  },
  
  saveCalculation: async (data) => {
    const history = getHistoryData();
    const newCalc = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    history.unshift(newCalc);
    saveHistoryData(history);
    return newCalc;
  },
  
  deleteHistoryItem: async (id) => {
    const history = getHistoryData();
    const filtered = history.filter(h => h.id !== id);
    saveHistoryData(filtered);
  }
};

export default calculatorService;
