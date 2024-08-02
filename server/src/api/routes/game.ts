import { router } from "../trpc";
import { createGame, joinGame } from "../controllers/gameController";

export default router({
  createGame,
  joinGame,
  //   startGame,
  //   submitMove,
  //   closeGame,
});
