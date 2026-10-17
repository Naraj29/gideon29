// src/lib/auth.js
// Simple auth helpers — centralises localStorage key names.

export const AUTH_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

export function getAccessToken() {
  return localStorage.getItem(AUTH_KEYS.ACCESS);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function saveTokens({ access, refresh }) {
  localStorage.setItem(AUTH_KEYS.ACCESS, access);
  localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(AUTH_KEYS.ACCESS);
  localStorage.removeItem(AUTH_KEYS.REFRESH);
}
