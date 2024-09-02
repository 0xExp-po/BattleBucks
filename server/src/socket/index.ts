import { Server, Socket } from 'socket.io';
import { gameEvents } from './events/gameEvents';
import { userEvents } from './events/userEvents';
import { friendEvents } from './events/friendEvents';
import jwt from 'jsonwebtoken';
import { userStatus } from './userStatus';
import { prisma } from '../prisma';

// Extend the Socket interface
interface CustomSocket extends Socket {
  user?: any;
}

// Update the setupSocket function to use CustomSocket
const setupSocket = (io: Server) => {
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.headers.token as string;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET || '', (err: any, decoded: any) => {
        socket.user = decoded;
        next();
      });
    } else next();
  });

  io.on('connection', (socket: CustomSocket) => {
    userStatus[socket.id] = { status: 'ONLINE', userId: socket.user?.userId };
    socket.join(socket.user?.userId);

    console.log(userStatus);

    gameEvents(socket, io);
    userEvents(socket, io);
    friendEvents(socket, io);

    socket.on('disconnect', async (reason) => {
      console.log(userStatus[socket.id], 'goes offline...', reason);
      try {
        const userId = userStatus[socket.id].userId;
        const games = await prisma.gameParticipant.findMany({
          where: { playerId: userId },
        });

        for (const game of games) {
          if (userId)
            await prisma.gameParticipant.update({
              where: {
                gameId_playerId: {
                  gameId: game.gameId,
                  playerId: userId,
                },
              },
              data: {
                eliminated: true,
              },
            });

          io.to(game.gameId).emit('S2C_PLAYER_LEFT', {
            playerId: userId,
          });
        }
      } catch (error) {
        console.error(`Failed to update player on disconnect:`, error);
      }
      delete userStatus[socket.id];
    });
  });
};

export { setupSocket, CustomSocket };
