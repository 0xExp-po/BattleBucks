import { Server, Socket } from 'socket.io';
import { prisma } from '../../prisma';

export const friendEvents = (socket: Socket, io: Server) => {
  // Send friend request notification
  socket.on('C2S_FRIEND_REQUEST_SENT', async (data: { senderId: string, receiverId: string }) => {
    console.log(`Notifying user ${data.receiverId} about friend request from ${data.senderId}`);
    
    try {
      // Create a notification for the receiver
      await prisma.notification.create({
        data: {
          userId: data.receiverId,
          message: 'You have a new friend request',
          type: 'friend request'
        }
      });

      io.to(data.receiverId).emit('S2C_FRIEND_REQUEST_RECEIVED', {
        senderId: data.senderId
      });
    } catch (error) {
      console.error('Failed to send friend request notification:', error);
      socket.emit('S2C_ERROR', { message: 'Failed to send friend request notification.' });
    }
  });

  // Notify about accepted friend request
  socket.on('C2S_FRIEND_REQUEST_ACCEPTED', async (data: { requestId: number, accepterId: string, requesterId: string }) => {
    console.log(`Notifying user ${data.requesterId} about accepted friend request ${data.requestId}`);
    
    try {
      // Create a notification for the requester
      await prisma.notification.create({
        data: {
          userId: data.requesterId,
          message: 'Your friend request has been accepted',
          type: 'friend request'
        }
      });

      io.to(data.requesterId).emit('S2C_FRIEND_REQUEST_ACCEPTED', {
        friendId: data.accepterId
      });
    } catch (error) {
      console.error('Failed to send friend request accepted notification:', error);
      socket.emit('S2C_ERROR', { message: 'Failed to send friend request accepted notification.' });
    }
  });
};