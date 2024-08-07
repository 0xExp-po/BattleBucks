import { router } from "../trpc";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendsList } from "../controllers/friendController";

export default router({
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
});
