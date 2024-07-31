import express from "express";
import cors from "cors";
import { appRouter } from "./api/router";
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createContext } from "./context";
import { expressHandler } from "trpc-playground/handlers/express";
import { PrismaClient } from "@prisma/client";

const app = express();
const TRPC_ENDPOINT = "/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/trpc-playground";

// Initialize tRPC
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

// Initialize Prisma client once
export const prisma = new PrismaClient();

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
