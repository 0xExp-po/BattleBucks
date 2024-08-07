import { router } from "../trpc";
import { submitMove, getGameLogs } from "../controllers/gameActionController";

export default router({
  submitMove,
  getGameLogs,
});