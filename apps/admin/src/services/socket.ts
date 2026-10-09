import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4005';

export const adminSocket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

adminSocket.on('connect', () => {
  console.log('[Socket Admin] Conectado al servidor');
  adminSocket.emit('unirse_admin');
});
