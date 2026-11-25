// Funciones que llaman a cada endpoint de la API.
// Las páginas usan estas funciones y nunca escriben URLs directamente.
import { apiRequest, toQueryString } from './client.js';

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  me: () => apiRequest('/auth/me'),
};

export const tasksApi = {
  list: (filters) => apiRequest(`/tasks${toQueryString(filters)}`),
  stats: () => apiRequest('/tasks/stats'),
  create: (data) => apiRequest('/tasks', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list: () => apiRequest('/users'),
  create: (data) => apiRequest('/users', { method: 'POST', body: data }),
  remove: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};
