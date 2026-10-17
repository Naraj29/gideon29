// Demo version using localStorage instead of backend API

const GROUPS_KEY = 'media_groups';
const ITEMS_KEY = 'media_items';

const getGroupsData = () => {
  const data = localStorage.getItem(GROUPS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveGroupsData = (groups) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

const getItemsData = () => {
  const data = localStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveItemsData = (items) => {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

const mediaService = {
  // GROUPS
  getGroups: async (parentId = '') => {
    const groups = getGroupsData();
    const filtered = parentId ? groups.filter(g => g.parent_id === parentId) : groups.filter(g => !g.parent_id || g.parent_id === 'root');
    return { results: filtered, count: filtered.length };
  },
  
  createGroup: async (data) => {
    const groups = getGroupsData();
    const newGroup = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    groups.unshift(newGroup);
    saveGroupsData(groups);
    return newGroup;
  },

  updateGroup: async (id, data) => {
    const groups = getGroupsData();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...data };
      saveGroupsData(groups);
      return groups[index];
    }
    throw new Error('Group not found');
  },

  deleteGroup: async (id) => {
    const groups = getGroupsData();
    const filtered = groups.filter(g => g.id !== id);
    saveGroupsData(filtered);
  },

  getBreadcrumbs: async (id) => {
    if (!id) return { breadcrumbs: [] };
    const groups = getGroupsData();
    const breadcrumbs = [];
    let current = groups.find(g => g.id === id);
    while (current) {
      breadcrumbs.unshift(current);
      current = groups.find(g => g.id === current.parent_id);
    }
    return { breadcrumbs };
  },

  // ITEMS
  getItems: async (params = {}) => {
    let items = getItemsData();
    if (params.group_id) items = items.filter(i => i.group_id === params.group_id);
    return { results: items, count: items.length };
  },

  createItem: async (data) => {
    const items = getItemsData();
    const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    items.unshift(newItem);
    saveItemsData(items);
    return newItem;
  },

  updateItem: async (id, data) => {
    const items = getItemsData();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      saveItemsData(items);
      return items[index];
    }
    throw new Error('Item not found');
  },

  deleteItem: async (id) => {
    const items = getItemsData();
    const filtered = items.filter(i => i.id !== id);
    saveItemsData(filtered);
  },

  getCategories: async () => {
    return { results: ['Movies', 'TV Shows', 'Books', 'Games', 'Music'] };
  },

  exportData: async () => {
    return { items: getItemsData(), groups: getGroupsData() };
  },

  importData: async (data) => {
    if (data.items) saveItemsData(data.items);
    if (data.groups) saveGroupsData(data.groups);
    return { success: true };
  },

  getMediaTypes: async () => {
    return { results: ['Video', 'Audio', 'Text', 'Image'] };
  }
};

export default mediaService;
