import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://live-online-auction-platform.onrender.com';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      autoConnect: true,
    });
  }
  return socketInstance;
}
