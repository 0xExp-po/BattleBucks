import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { CustomSocket } from "..";

export const userEvents = (socket: CustomSocket, io: Server) => {
  // Handle user joining a game (set status to GAMING)
  socket.on("C2S_JOIN_GAME", (data: { gameId: string }) => {
    console.log(`User ${socket.id} joined game ${data.gameId}`);
    userStatus[socket.id] = { status: "GAMING", gameId: data.gameId };
    socket.join(data.gameId);
  });

  // Handle user leaving a game (set status back to ONLINE)
  socket.on("C2S_LEAVE_GAME", (data: { gameId: string }) => {
    console.log(`User ${socket.user.id} left the game`);
    userStatus[socket.id] = { status: "ONLINE" };
    socket.leave(data.gameId);
  });
};
