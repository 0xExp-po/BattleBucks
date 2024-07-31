import { router } from "../index";
import { createUser, getProfile } from "../controllers/userController";

export default router({
  createUser,
  getProfile,
  // searchPlayer: publicProcedure.query(userController.searchPlayer),
});
