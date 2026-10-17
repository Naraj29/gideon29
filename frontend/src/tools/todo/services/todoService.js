// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'todo_items';

const getItems = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveItems = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const todoService = {
  getItems: async (params = {}) => {
    const items = getItems();
    return { results: items, count: items.length };
  },
  
  createItem: async (data) => {
    const items = getItems();
    const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    items.unshift(newItem);
    saveItems(items);
    return newItem;
  },
  
  updateItem: async (id, data) => {
    const items = getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      saveItems(items);
      return items[index];
    }
    throw new Error('Item not found');
  },
  
  deleteItem: async (id) => {
    const items = getItems();
    const filtered = items.filter(item => item.id !== id);
    saveItems(filtered);
  }
};

export default todoService;
