import { Server } from "socket.io";
import { gameEvents } from "./events/gameEvents";
import { userEvents } from "./events/userEvents";

const setupSocket = (io: Server) => {
  // io.use((socket, next) => {
  //   const token = socket.handshake.auth.token;
  //   if (token === process.env.SOCKET_TOKEN) {
  //     next();
  //   } else {
  //     next(new Error("Authentication error"));
  //   }
  // });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Initialize event handlers
    gameEvents(socket, io);
    userEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export { setupSocket };
