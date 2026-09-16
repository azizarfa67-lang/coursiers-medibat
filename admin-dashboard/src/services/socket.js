// src/services/socket.js
// Connexion WebSocket temps réel pour le dashboard admin : reçoit les
// changements de statut et de position de tous les coursiers.

import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

let socket = null;

export function connectAdminSocket() {
  const token = localStorage.getItem('admin_access_token');
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectAdminSocket() {
  socket?.disconnect();
  socket = null;
}
