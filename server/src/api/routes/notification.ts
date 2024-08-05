import { router } from "../trpc";
import { sendNotification, getNotifications } from "../controllers/notificationController";

export default router({
  sendNotification,
  getNotifications,
});