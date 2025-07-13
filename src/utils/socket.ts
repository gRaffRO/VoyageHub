import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const socketUrl = apiUrl.replace('/api', '');
  
  socket = io(socketUrl, {
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ [Socket] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('🔌 [Socket] Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ [Socket] Connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [Socket] Socket disconnected and cleared');
  }
};