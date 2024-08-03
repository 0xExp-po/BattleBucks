import { TRPCError } from "@trpc/server";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { t } from "../trpc";
import { prisma } from "../../app";

dotenv.config()

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
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
    const user = {
      telegramID: initData.get("id"),
      username: initData.get("username"),
      firstName: initData.get("first_name"),
      lastName: initData.get("last_name"),
      bio: initData.get("bio"),
      phoneNo: initData.get("phone_number"),
      profilePicture: initData.get("photo_url"),
    };
    if (!user.telegramID) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Not authorized" });
    }
    let dbUser;
    dbUser = await prisma.user.findUnique({
      where: { telegramID: user.telegramID },
    });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          telegramID: user.telegramID,
          name: `${user.firstName} ${user.lastName}`,
          username: user.telegramID,
          bio: user.bio,
          phoneNo: user.phoneNo,
          profilePicture: user.profilePicture,
        },
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: dbUser,
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
