import { Server } from 'socket.io';
import { gameEvents } from './events/gameEvents';
import { userEvents } from './events/userEvents';

export const setupSocket = (io: Server) => {

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Initialize event handlers
    gameEvents(socket, io);
    userEvents(socket, io);

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
