import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { createContext } from "../context";

type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

export const router = t.router;

