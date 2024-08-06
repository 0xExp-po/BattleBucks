import { router, t } from "./trpc";
import gameRouter from "./routes/game";
import userRouter from "./routes/user";
import { getProfile, searchPlayer } from "./controllers/userController";
import gameActionRouter from "./routes/gameAction";
import transactionRouter from "./routes/transaction";
import notificationRouter from "./routes/notification";

export const appRouter = router({
  game: gameRouter,
  user: userRouter,
  gameAction: gameActionRouter,
  transaction: transactionRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;