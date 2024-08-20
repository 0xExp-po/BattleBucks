import { router } from "../trpc";
import { getGameDetails, getUserGameHistory } from "../controllers/gameController";

export default router({
  getGameDetails,
  getUserGameHistory,
});
