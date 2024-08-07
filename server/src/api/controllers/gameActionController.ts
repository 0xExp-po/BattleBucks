import { z } from "zod";
import { privateProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import { prisma } from "../../prisma";

const submitMoveSchema = z.object({
  gameId: z.string(),
  move: z.string(),
});

const getGameLogsSchema = z.object({
  gameId: z.string(),
});

export const submitMove = privateProcedure
  .input(submitMoveSchema)
  .output(commonResponse(z.object({ success: z.boolean() }).nullable()))
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      await prisma.gameLog.create({
        data: {
          gameId: input.gameId,
          playerId: ctx.user.id,
          move: input.move,
        },
      });
      return {
        status: 200,
        result: { success: true },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const getGameLogs = privateProcedure
  .input(getGameLogsSchema)
  .output(commonResponse(z.object({ logs: z.array(z.any()) }).nullable()))
  .query(async ({ input }): Promise<any> => {
    try {
      const logs = await prisma.gameLog.findMany({
        where: { gameId: input.gameId },
        include: { player: true },
        orderBy: { createdAt: 'asc' },
      });
      return {
        status: 200,
        result: { logs },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
