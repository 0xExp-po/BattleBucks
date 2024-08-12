import { z } from "zod";
import { privateProcedure } from "../middlewares";
import { commonResponse } from "../../interfaces/MessageResponse";
import { prisma } from "../../prisma";
import { determineWinner } from "../../utils/game";

const submitMoveSchema = z.object({
  gameId: z.string(),
  move: z.string(),
});

const getGameLogsSchema = z.object({
  gameId: z.string(),
});

export const submitMove = privateProcedure
  .input(submitMoveSchema)
  .output(
    commonResponse(
      z
        .object({ success: z.boolean(), winner: z.string().nullable() })
        .nullable()
    )
  )
  .mutation(async ({ input, ctx }): Promise<any> => {
    try {
      await prisma.gameLog.create({
        data: {
          gameId: input.gameId,
          playerId: ctx.user.id,
          move: input.move,
        },
      });

      // Check if all players have submitted their moves
      const game = await prisma.game.findUnique({
        where: { id: input.gameId },
        include: { participants: true },
      });

      if (game) {
        // All players have submitted their moves, determine the winner
        const gameLogs = await prisma.gameLog.findMany({
          where: { gameId: input.gameId },
          orderBy: { createdAt: "asc" },
        });
        if (gameLogs.length % game.maxPlayers !== 0) {
          return {
            status: 200,
            result: { success: false, winner: null },
          };
        }
        const winner = determineWinner(gameLogs.slice(-game.maxPlayers));

        // Update the game with the winner
        await prisma.game.update({
          where: { id: input.gameId },
          data: { winner: winner?.playerId || null, status: "CLOSED" },
        });

        return {
          status: 200,
          result: { success: true, winner: winner?.playerId || null },
        };
      }

      return {
        status: 200,
        result: { success: true, winner: null },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
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
        orderBy: { createdAt: "asc" },
      });
      return {
        status: 200,
        result: { logs },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
