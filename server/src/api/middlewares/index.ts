import { TRPCError } from "@trpc/server";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { t } from "../trpc";
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
}

export const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const initData = new URLSearchParams(
    ctx.req.get("telegramInitData") as string | undefined
  );
  const hash = initData.get("hash");
  let isAuth;
  let dataToCheck: string[] = [];

  initData.sort();
  initData.forEach(
    (val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`)
  );

  const secret = TELEGRAM_BOT_TOKEN
    ? CryptoJS.HmacSHA256(TELEGRAM_BOT_TOKEN, "WebAppData")
    : null;
  const _hash = CryptoJS.HmacSHA256(
    dataToCheck.join("\n"),
    secret ?? ""
  ).toString(CryptoJS.enc.Hex);

  isAuth = _hash === hash;
  if (isAuth) {
    return next({
      ctx: {
        ...ctx,
        user: {
          isLoggedIn: isAuth,
        },
      },
    });
  } else {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Not authorized" });
  }
});

export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  console.log(`${new Date().toISOString()} - ${type} - ${path}`);
  return next();
});

export const publicProcedure = t.procedure.use(loggerMiddleware);
export const privateProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthenticated);
