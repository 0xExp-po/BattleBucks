import { router } from "../trpc";
import {
  authenticateUser,
  getProfile,
  searchPlayer,
  updateProfile,
  getUserFriends,
  getUserGameHistory,
} from "../controllers/userController";

export default router({
  authenticateUser,
  getProfile,
  searchPlayer,
  updateProfile,
  getUserFriends,
  getUserGameHistory,
});
