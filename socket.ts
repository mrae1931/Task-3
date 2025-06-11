import { io, Socket } from 'socket.io-client';
import { Operation } from '../models/types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

let socket: Socket;

export const connectSocket = (token: string) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket']
  });
  return socket;
};

export const joinDocument = (docId: string) => {
  socket.emit('join-document', docId);
};

export const leaveDocument = (docId: string) => {
  socket.emit('leave-document', docId);
};

export const sendOperation = (docId: string, operation: Operation) => {
  socket.emit('operation', { docId, operation });
};

export const onDocumentUpdate = (callback: (content: string) => void) => {
  socket.on('document-update', callback);
};

export const onUsersUpdate = (callback: (users: User[]) => void) => {
  socket.on('users-update', callback);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
