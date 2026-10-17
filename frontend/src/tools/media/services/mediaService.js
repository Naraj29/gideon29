// Offline-first Media Tracker service using localStorage
// Zero backend dependencies - ultra fast and reliable

const GROUPS_KEY = 'media_groups';
const ITEMS_KEY = 'media_items';

const INITIAL_GROUPS = [
  {
    id: 'sci-fi-classics',
    name: 'Sci-Fi Universes',
    description: 'Exploration of interstellar worlds and futuristic futures',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60',
    parent_id: null,
    parent_group: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'cinema-hall',
    name: 'Cinema Masterpieces',
    description: 'Hall of fame films and award-winning cinema',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60',
    parent_id: null,
    parent_group: null,
    created_at: new Date().toISOString()
  }
];

const INITIAL_ITEMS = [
  {
    id: 'media-1',
    title: 'Interstellar',
    media_type: 'Movie',
    category: 'Sci-Fi, Adventure',
    language: 'English',
    country: 'United States',
    start_year: 2014,
    end_year: null,
    is_favorite: true,
    status: 'Completed',
    rating: 10,
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    notes: 'A masterpiece of physics, love, and human survival across gargantua.',
    group: 'sci-fi-classics',
    group_id: 'sci-fi-classics',
    created_at: new Date().toISOString()
  },
  {
    id: 'media-2',
    title: 'Inception',
    media_type: 'Movie',
    category: 'Sci-Fi, Thriller',
    language: 'English',
    country: 'United States',
    start_year: 2010,
    end_year: null,
    is_favorite: true,
    status: 'Completed',
    rating: 10,
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60',
    notes: 'Subconscious heist architecture and the timeless spinning totem.',
    group: 'cinema-hall',
    group_id: 'cinema-hall',
    created_at: new Date().toISOString()
  },
  {
    id: 'media-3',
    title: 'Cyberpunk 2077',
    media_type: 'Game',
    category: 'RPG, Open World',
    language: 'English',
    country: 'Poland',
    start_year: 2020,
    end_year: null,
    is_favorite: true,
    status: 'Active',
    rating: 9,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    notes: 'V, Johnny Silverhand, and the neon lights of Night City.',
    group: null,
    group_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'media-4',
    title: 'Dune: Part Two',
    media_type: 'Movie',
    category: 'Sci-Fi, Epic',
    language: 'English',
    country: 'United States',
    start_year: 2024,
    end_year: null,
    is_favorite: true,
    status: 'Completed',
    rating: 10,
    image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60',
    notes: 'Cinematic grandeur on Arrakis, Shai-Hulud, and the spice.',
    group: 'sci-fi-classics',
    group_id: 'sci-fi-classics',
    created_at: new Date().toISOString()
  }
];

const getGroupsData = () => {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
      return INITIAL_GROUPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading media_groups from localStorage", e);
    return INITIAL_GROUPS;
  }
};

const saveGroupsData = (groups) => {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error("Error saving media_groups to localStorage", e);
  }
};

const getItemsData = () => {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading media_items from localStorage", e);
    return INITIAL_ITEMS;
  }
};

const saveItemsData = (items) => {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving media_items to localStorage", e);
  }
};

const mediaService = {
  // GROUPS
  getGroups: async (parentId = '') => {
    const groups = getGroupsData();
    const isRoot = !parentId || parentId === 'root';
    const filtered = groups.filter(g => {
      const pid = g.parent_id || g.parent_group || null;
      return isRoot ? (!pid || pid === 'root') : pid === parentId;
    });
    return { results: filtered, count: filtered.length };
  },

  getGroup: async (id) => {
    const groups = getGroupsData();
    const found = groups.find(g => g.id === id);
    if (!found) throw new Error("Folder not found");
    return found;
  },
  
  createGroup: async (data) => {
    const groups = getGroupsData();
    const pid = data.parent_id || data.parent_group || null;
    const cleanPid = (!pid || pid === 'root') ? null : pid;
    const newGroup = {
      ...data,
      id: Date.now().toString(),
      parent_id: cleanPid,
      parent_group: cleanPid,
      created_at: new Date().toISOString()
    };
    groups.unshift(newGroup);
    saveGroupsData(groups);
    return newGroup;
  },

  updateGroup: async (id, data) => {
    const groups = getGroupsData();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      const pid = data.parent_id !== undefined ? data.parent_id : (data.parent_group !== undefined ? data.parent_group : groups[index].parent_id);
      const cleanPid = (!pid || pid === 'root') ? null : pid;
      groups[index] = { 
        ...groups[index], 
        ...data,
        parent_id: cleanPid,
        parent_group: cleanPid
      };
      saveGroupsData(groups);
      return groups[index];
    }
    throw new Error('Folder not found');
  },

  deleteGroup: async (id) => {
    const groups = getGroupsData();
    // Also delete or orphan nested items
    const filteredGroups = groups.filter(g => g.id !== id && g.parent_id !== id && g.parent_group !== id);
    saveGroupsData(filteredGroups);

    // Remove items belonging to this group
    const items = getItemsData();
    const filteredItems = items.filter(i => i.group_id !== id && i.group !== id);
    saveItemsData(filteredItems);
  },

  getBreadcrumbs: async (id) => {
    if (!id || id === 'root') return { breadcrumbs: [] };
    const groups = getGroupsData();
    const breadcrumbs = [];
    let current = groups.find(g => g.id === id);
    while (current) {
      breadcrumbs.unshift(current);
      const pid = current.parent_id || current.parent_group || null;
      current = pid && pid !== 'root' ? groups.find(g => g.id === pid) : null;
    }
    return { breadcrumbs };
  },

  // ITEMS
  getItems: async (params = {}) => {
    let items = getItemsData();
    const targetGroupId = params.group_id || params.group || '';
    if (targetGroupId && targetGroupId !== 'root') {
      items = items.filter(i => (i.group_id === targetGroupId || i.group === targetGroupId));
    }
    return { results: items, count: items.length };
  },

  getItem: async (id) => {
    const items = getItemsData();
    const found = items.find(i => i.id === id);
    if (!found) throw new Error("Media unit not found");
    return found;
  },

  createItem: async (data) => {
    const items = getItemsData();
    const gid = data.group_id || data.group || null;
    const cleanGid = (!gid || gid === 'root') ? null : gid;
    const newItem = { 
      ...data, 
      id: Date.now().toString(),
      group: cleanGid,
      group_id: cleanGid,
      created_at: new Date().toISOString() 
    };
    items.unshift(newItem);
    saveItemsData(items);
    return newItem;
  },

  updateItem: async (id, data) => {
    const items = getItemsData();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      const gid = data.group_id !== undefined ? data.group_id : (data.group !== undefined ? data.group : items[index].group_id);
      const cleanGid = (!gid || gid === 'root') ? null : gid;
      items[index] = { 
        ...items[index], 
        ...data,
        group: cleanGid,
        group_id: cleanGid
      };
      saveItemsData(items);
      return items[index];
    }
    throw new Error('Media unit not found');
  },

  deleteItem: async (id) => {
    const items = getItemsData();
    const filtered = items.filter(i => i.id !== id);
    saveItemsData(filtered);
  },

  getCategories: async () => {
    return ['Sci-Fi', 'Action', 'Adventure', 'Drama', 'Comedy', 'Thriller', 'Animation', 'Fantasy', 'Horror', 'Documentary', 'RPG', 'Classic'];
  },

  getMediaTypes: async () => {
    return ["Movie", "Series", "Anime", "Comic", "Book", "Game", "Podcast", "Other"];
  },

  exportData: async () => {
    return { 
      items: getItemsData(), 
      groups: getGroupsData(),
      exported_at: new Date().toISOString()
    };
  },

  importData: async (data) => {
    if (Array.isArray(data.items)) saveItemsData(data.items);
    if (Array.isArray(data.groups)) saveGroupsData(data.groups);
    return { success: true };
  }
};

export default mediaService;
