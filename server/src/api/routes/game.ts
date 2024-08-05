import { router } from "../trpc";
import { createGame, joinGame, getGameDetails, getUserGameHistory } from "../controllers/gameController";

export default router({
  createGame,
  joinGame,
  getGameDetails,
  getUserGameHistory,
});
