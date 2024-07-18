import express from 'express';
import cors from 'cors';
import { appRouter } from './api/router';
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { createContext } from './context';
import { expressHandler } from "trpc-playground/handlers/express";
import { PrismaClient, User } from '@prisma/client';
const app = express();
import { Server } from "socket.io";
import { randomUUID } from 'crypto';
import { userOffline, userOnline } from './socket/userEvents';
import { acceptRequest, findMatch, gamePlay } from './socket/gameEvents';


// ROUTES
app.get("/", (req, res) => {
  res.send("hello, world!");
});

// initialize trpc on express server with playground
const TRPC_ENDPOINT = "/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/trpc-playground";
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create()
export const prisma = new PrismaClient()



export const io = new Server({
  cors: {
    origin: "*" ||  ["http://localhost:5173"],
  },
});

io.listen(5001);

io.on("connection", async (socket) => {
  console.log(`socket ${socket.id} connected`);

  // whern user Join
  userOnline(socket).then(currentUser => {
    console.log(currentUser, "currentUser");
    if (currentUser) {
      findMatch(socket, currentUser).then(() => {
        acceptRequest(socket, currentUser).then((gameInfo) => {
          gamePlay(socket, gameInfo);
        })
      })
    } else {
      console.log("No current user set. Unable to find match.");
    }
  })


  await userOffline(socket);



  socket.on("disconnect", () => {
    console.log(`socket ${socket.id} disconnected`);
  });
});

// MIDDLEWARE
io.use((socket, next) => {
  let token = socket.handshake.query.key;
  if (token === process.env.SOCKET_TOKEN) {
    next();
  }
})



app.use(cors({ origin: "*" }));
app.use(
  TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

expressHandler({
  trpcApiEndpoint: TRPC_ENDPOINT,
  playgroundEndpoint: TRPC_PLAYGROUND_ENDPOINT,
  router: appRouter,
  // uncomment this if you're using superjson
  request: {
    // superjson: true,
  },
}).then((handeler: any) => {
  app.use(handeler);
});


export default app;