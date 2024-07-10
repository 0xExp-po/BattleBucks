import express from 'express';
import cors from 'cors';
import { appRouter } from './api/router';
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { createContext } from './context';
import { expressHandler } from "trpc-playground/handlers/express";
import { PrismaClient } from '@prisma/client';
const app = express();


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