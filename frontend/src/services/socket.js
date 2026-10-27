import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const socket = io(SOCKET_URL, { autoConnect: false });

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export const joinTracking = () => {
  if (socket.connected) {
    socket.emit('join_tracking');
  } else {
    socket.once('connect', () => {
      socket.emit('join_tracking');
    });
  }
};

export const joinVessel = (vesselId) => {
  if (socket.connected) {
    socket.emit('join_vessel', vesselId);
  } else {
    socket.once('connect', () => {
      socket.emit('join_vessel', vesselId);
    });
  }
};
