import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus } from "@prisma/client";

export const gameEvents = (socket: Socket, io: Server) => {
  // Notify game created
  socket.on('C2S_CREATE_GAME', (gameId: string) => {
    console.log(`Game ${gameId} created`);
    io.emit('S2C_GAME_CREATED', { gameId });
  });

  // Handle player joining a game room
  socket.on("C2S_JOIN_GAME", (data: { gameId: string; playerId: string }) => {
    console.log(`Player ${data.playerId} joined game ${data.gameId}`);
    socket.join(data.gameId);
    io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
      playerId: data.playerId,
    });
  });

  // Handle game start notification
  socket.on("C2S_START_GAME", async (gameId: string) => {
    console.log(`Game ${gameId} started`);
    try {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: GameStatus.IN_PROGRESS }
      });
    } catch (error) {
      console.error(`Failed to update game status for game ${gameId}:`, error);
      socket.emit('S2C_ERROR', { message: 'Failed to start the game. Please try again.' });
      return;
    }

    io.to(gameId).emit("S2C_GAME_STARTED", {
      gameId: gameId,
    });
  });

  // Handle move submission in a game
  socket.on(
    "C2S_SUBMIT_MOVE",
    (data: { gameId: string; playerId: string; move: string }) => {
      console.log(
        `Player ${data.playerId} submitted move in game ${data.gameId}`
      );
      io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
        playerId: data.playerId,
        move: data.move,
      });
    }
  );

  // Handle game result notification
  socket.on("C2S_END_GAME", async (data: { gameId: string; winnerId: string }) => {
    console.log(`Game ${data.gameId} ended. Winner is ${data.winnerId}`);

    // Update the status of all participants
    for (const userId in userStatus) {
      if (userStatus[userId].gameId === data.gameId) {
        userStatus[userId] = { status: "ONLINE" };
      }
    }
    try {
      await prisma.game.update({
        where: { id: data.gameId },
        data: { status: GameStatus.CLOSED }
      });
    } catch (error) {
      console.error(`Failed to update game status for game ${data.gameId}:`, error);
      socket.emit('S2C_ERROR', { message: 'Failed to end the game. Please try again.' });
      return;
    }

    io.to(data.gameId).emit("S2C_GAME_ENDED", {
      winnerId: data.winnerId,
    });
  });

  // Update game state
  socket.on('C2S_UPDATE_GAME_STATE', (data: { gameId: string; state: any }) => {
    console.log(`Updating game state for ${data.gameId}`);
    io.to(data.gameId).emit('S2C_GAME_STATE_UPDATED', {
      gameId: data.gameId,
      state: data.state,
    });
  });
};