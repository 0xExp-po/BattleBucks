import express from "express";
import cors from "cors";
import { appRouter } from "./api/router";
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createContext } from "./context";
import { expressHandler } from "trpc-playground/handlers/express";
import { PrismaClient, User } from "@prisma/client";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import { userOffline, userOnline } from "./socket/userEvents";
import { acceptRequest, findMatch, gamePlay } from "./socket/gameEvents";

const app = express();
const TRPC_ENDPOINT = "/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/trpc-playground";

// Initialize Prisma client once
export const prisma = new PrismaClient();

// Initialize tRPC
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

// Configure Socket.IO
export const io = new Server({
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS : "*",
  },
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS : "*",
  })
);
app.use(express.json()); // Add JSON parsing middleware

// Routes
app.get("/", (req, res) => {
  res.send("hello, world!");
});

// tRPC setup
app.use(
  TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === process.env.SOCKET_TOKEN) {
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  console.log(`Socket ${socket.id} connected`);

  try {
    const currentUser = await userOnline(socket);
    if (currentUser) {
      await findMatch(socket, currentUser);
      const gameInfo = await acceptRequest(socket, currentUser);
      await gamePlay(socket, gameInfo);
    } else {
      console.log("No current user set. Unable to find match.");
    }
  } catch (error) {
    console.error("Error in connection handling:", error);
  }

  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);
    await userOffline(socket);
  });
});

// tRPC Playground setup
expressHandler({
  trpcApiEndpoint: TRPC_ENDPOINT,
  playgroundEndpoint: TRPC_PLAYGROUND_ENDPOINT,
  router: appRouter,
  // uncomment this if you're using superjson
  request: {
    // superjson: true,
  },
}).then((handler) => {
  app.use(handler);
});

export default app;
