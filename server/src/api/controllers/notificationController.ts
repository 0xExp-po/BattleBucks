import { z } from "zod";
import { privateProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import { prisma } from "../../prisma";

const sendNotificationSchema = z.object({
  recipientId: z.string(),
  message: z.string(),
  type: z.enum(['GAME_INVITE', 'FRIEND_REQUEST', 'SYSTEM']),
});

export const sendNotification = privateProcedure
  .input(sendNotificationSchema)
  .output(commonResponse(z.object({ notification: z.any() }).nullable()))
  .mutation(async ({ input }): Promise<any> => {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: input.recipientId,
          message: input.message,
          type: input.type,
        },
      });
      return {
        status: 200,
        result: { notification },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getNotifications = privateProcedure
  .output(commonResponse(z.object({ notifications: z.array(z.any()) }).nullable()))
  .query(async ({ ctx }): Promise<any> => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      });
      return {
        status: 200,
        result: { notifications },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
