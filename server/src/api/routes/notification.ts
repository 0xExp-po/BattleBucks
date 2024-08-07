import { router } from "../trpc";
import {
  sendNotification,
  getNotifications,
  getUnreadNotifications,
  getReadNotifications,
  getGameInvites,
  getFriendRequestNotifications,
} from "../controllers/notificationController";

export default router({
  sendNotification,
  getNotifications,
  getUnreadNotifications,
  getReadNotifications,
  getGameInvites,
  getFriendRequestNotifications,
});
