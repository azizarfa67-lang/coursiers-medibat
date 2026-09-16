// src/services/api.js
// Centralise les appels REST vers le backend, avec injection automatique
// du token JWT admin stocké en localStorage.

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function loginAdmin(email, mot_de_passe) {
  const { data } = await api.post('/auth/admin/login', { email, mot_de_passe });
  return data;
}

export async function getCoursiers(statut) {
  const { data } = await api.get('/coursiers', { params: statut ? { statut } : {} });
  return data.coursiers;
}

export async function getMissions(params = {}) {
  const { data } = await api.get('/missions', { params });
  return data.missions;
}

export async function creerMission(payload) {
  const { data } = await api.post('/missions', payload);
  return data;
}

export async function assignerMission(missionId, coursierId) {
  const { data } = await api.patch(`/missions/${missionId}/assigner`, { coursier_id: coursierId });
  return data;
}

export default api;
