import { router } from "../trpc";
import { authenticateUser, getProfile, searchPlayer } from "../controllers/userController";

export default router({
  authenticateUser,
  getProfile,
  searchPlayer,
});
