// src/lib/api.js
// Demo stub - no backend API in standalone demo

const api = {
  get: () => Promise.reject(new Error('Backend API not available in demo mode')),
  post: () => Promise.reject(new Error('Backend API not available in demo mode')),
  put: () => Promise.reject(new Error('Backend API not available in demo mode')),
  patch: () => Promise.reject(new Error('Backend API not available in demo mode')),
  delete: () => Promise.reject(new Error('Backend API not available in demo mode')),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;
