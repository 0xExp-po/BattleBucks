import { z } from "zod";
import { privateProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import { prisma } from "../../prisma";

const recordTransactionSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  amount: z.number(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "GAME_WIN", "GAME_LOSS"]),
  gameId: z.string().optional(),
});

export const recordTransaction = privateProcedure
  .input(recordTransactionSchema)
  .output(commonResponse(z.object({ transaction: z.any() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });
      return {
        status: 200,
        result: { transaction },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getUserTransactions = privateProcedure
  .output(
    commonResponse(z.object({ transactions: z.array(z.any()) }).nullable())
  )
  .query(async ({ ctx }): Promise<any> => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
      });
      return {
        status: 200,
        result: { transactions },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
