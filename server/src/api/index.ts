import { isAuthenticated, loggerMiddleware } from "./middlewares";
import { t } from "../app";

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);
export const privateProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthenticated);
