import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createContext } from "./context";
import { PrismaClient } from "@prisma/client";

// Initialize tRPC
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

// Initialize Prisma client once
export const prisma = new PrismaClient();