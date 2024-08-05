import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const token = ctx.req.headers["authorization"];

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch (err) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Failed to authenticate token",
    });
  }
});

export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  // console.log(`${new Date().toISOString()} - ${type} - ${path}`);
  return next();
});

export const publicProcedure = t.procedure.use(loggerMiddleware);
export const privateProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthenticated);
