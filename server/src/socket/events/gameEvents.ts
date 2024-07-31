import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";

export const gameEvents = (socket: Socket, io: Server) => {
  // Handle player joining a game room
  socket.on("joinGame", (data: { gameId: string; playerId: string }) => {
    console.log(`Player ${data.playerId} joined game ${data.gameId}`);
    socket.join(data.gameId);
    io.to(data.gameId).emit("playerJoined", {
      playerId: data.playerId,
    });
  });

  // Handle game start notification
  socket.on("startGame", (gameId: string) => {
    console.log(`Game ${gameId} started`);
    io.to(gameId).emit("gameStarted", {
      gameId: gameId,
    });
  });

  // Handle move submission in a game
  socket.on(
    "submitMove",
    (data: { gameId: string; playerId: string; move: string }) => {
      console.log(
        `Player ${data.playerId} submitted move in game ${data.gameId}`
      );
      io.to(data.gameId).emit("moveSubmitted", {
        playerId: data.playerId,
        move: data.move,
      });
    }
  );

  // Handle game result notification
  socket.on("endGame", (data: { gameId: string; winnerId: string }) => {
    console.log(`Game ${data.gameId} ended. Winner is ${data.winnerId}`);

    // Update the status of all participants
    for (const userId in userStatus) {
      if (userStatus[userId].gameId === data.gameId) {
        userStatus[userId] = { status: "ONLINE" };
      }
    }

    io.to(data.gameId).emit("gameEnded", {
      winnerId: data.winnerId,
    });
  });
};
