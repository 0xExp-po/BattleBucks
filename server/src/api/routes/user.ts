import { router } from "../trpc";
import { getProfile, searchPlayer } from "../controllers/userController";

export default router({
  getProfile,
  searchPlayer,
});
