import { router, t } from "./trpc";
import gameRouter from "./routes/game";
import userRouter from "./routes/user";
import { getProfile, searchPlayer } from "./controllers/userController";

export const appRouter = router({
  game: gameRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
