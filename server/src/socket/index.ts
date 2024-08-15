import { Server, Socket } from "socket.io";
import { gameEvents } from "./events/gameEvents";
import { userEvents } from "./events/userEvents";
import { friendEvents } from "./events/friendEvents";
import jwt from "jsonwebtoken";
import { userStatus } from "./userStatus";

// Extend the Socket interface
interface CustomSocket extends Socket {
  user?: any;
}

// Update the setupSocket function to use CustomSocket
const setupSocket = (io: Server) => {
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.headers.token as string;
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET || "",
        (err: any, decoded: any) => {
          socket.user = decoded;
          next();
        }
      );
    } else next();
  });

  io.on("connection", (socket: CustomSocket) => {
    userStatus[socket.id] = { status: "ONLINE", userId: socket.user?.userId };
    socket.join(socket.user?.userId);

    console.log(userStatus);

    gameEvents(socket, io);
    userEvents(socket, io);
    friendEvents(socket, io);

    socket.on("disconnect", (reason) => {
      userStatus[socket.id] = { ...userStatus[socket.id], status: "OFFLINE" };
      console.log(userStatus[socket.id].userId, "goes offline...")
    });
  });
};

export { setupSocket, CustomSocket };
