import { router, t } from "./trpc";
import gameRouter from "./routes/game";
import userRouter from "./routes/user";

export const appRouter = router({
  game: gameRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
