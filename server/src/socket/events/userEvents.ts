import { Server, Socket } from 'socket.io';
import { userStatus } from '../userStatus';

export const userEvents = (socket: Socket, io: Server) => {
  // Handle user joining the socket (set status to ONLINE)
  socket.on('join', (userId: string) => {
    console.log(`User ${userId} joined the socket`);
    userStatus[userId] = { status: 'ONLINE' };
    socket.join(userId);
  });

  // Handle user disconnecting (set status to OFFLINE)
  socket.on('disconnect', () => {
    console.log('User disconnected');
    const userId = socket.handshake.query.userId as string; // Assuming userId is passed as a query param
    if (userId) {
      userStatus[userId] = { status: 'OFFLINE' };
    }
  });

  // Handle user joining a game (set status to GAMING)
  socket.on('joinGame', (data: { userId: string; gameId: string }) => {
    console.log(`User ${data.userId} joined game ${data.gameId}`);
    userStatus[data.userId] = { status: 'GAMING', gameId: data.gameId };
    socket.join(data.gameId);
  });

  // Handle user leaving a game (set status back to ONLINE)
  socket.on('leaveGame', (data: { userId: string }) => {
    console.log(`User ${data.userId} left the game`);
    userStatus[data.userId] = { status: 'ONLINE' };
  });
};
