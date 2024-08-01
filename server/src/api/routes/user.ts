import { router } from "../index";
import {
  createUser,
  getProfile,
  searchPlayer,
} from "../controllers/userController";

export default router({
  createUser,
  getProfile,
  searchPlayer,
});
