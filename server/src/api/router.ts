import { router, t } from "./trpc";
import userRouter from "./routes/user";
import { getProfile, searchPlayer } from "./controllers/userController";
import transactionRouter from "./routes/transaction";
import notificationRouter from "./routes/notification";

export const appRouter = router({
  user: userRouter,
  transaction: transactionRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;