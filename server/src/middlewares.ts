import { TRPCError } from "@trpc/server";
import { t } from "./app";
import CryptoJS from "crypto-js";

const TELEGRAM_BOT_TOKEN = '110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw';

export const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const initData = new URLSearchParams(ctx.req.get("telegramInitData") as string | undefined);
  const hash = initData.get("hash");
  let isAuth;
  let dataToCheck: string[] = [];

  initData.sort();
  initData.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));

  const secret = CryptoJS.HmacSHA256(TELEGRAM_BOT_TOKEN, "WebAppData");
  const _hash = CryptoJS.HmacSHA256(dataToCheck.join("\n"), secret).toString(CryptoJS.enc.Hex);

  _hash === hash ? isAuth = true : isAuth = false;
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