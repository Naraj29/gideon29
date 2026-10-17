import api from '../lib/api';

const mediaService = {
  // --- Groups ---
  getGroups: async (parentId = null) => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await api.get('tools/media/groups/', { params });
    return response.data;
  },
  
  getGroup: async (id) => {
    const response = await api.get(`tools/media/groups/${id}/`);
    return response.data;
  },
  
  getGroupBreadcrumbs: async (id) => {
    const response = await api.get(`tools/media/groups/${id}/breadcrumbs/`);
    return response.data.breadcrumbs;
  },
  
  createGroup: async (data) => {
    const response = await api.post('tools/media/groups/', data);
    return response.data;
  },
  
  updateGroup: async (id, data) => {
    const response = await api.patch(`tools/media/groups/${id}/`, data);
    return response.data;
  },
  
  deleteGroup: async (id) => {
    await api.delete(`tools/media/groups/${id}/`);
  },

  // --- Items ---
  getItems: async (filters = {}) => {
    const response = await api.get('tools/media/items/', { params: filters });
    return response.data;
  },
  
  getItem: async (id) => {
    const response = await api.get(`tools/media/items/${id}/`);
    return response.data;
  },
  
  createItem: async (data) => {
    const response = await api.post('tools/media/items/', data);
    return response.data;
  },
  
  updateItem: async (id, data) => {
    const response = await api.patch(`tools/media/items/${id}/`, data);
    return response.data;
  },
  
  deleteItem: async (id) => {
    await api.delete(`tools/media/items/${id}/`);
  }
};

export default mediaService;
