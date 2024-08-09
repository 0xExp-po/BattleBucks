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

      if (game && game.participants.length === game.maxPlayers) {
        // All players have submitted their moves, determine the winner
        const gameLogs = await prisma.gameLog.findMany({
          where: { gameId: input.gameId },
        });

        const winner = determineWinner(gameLogs);

        // Update the game with the winner
        await prisma.game.update({
          where: { id: input.gameId },
          data: { winner: winner?.playerId || null },
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

function determineWinner(gameLogs: any[]): { playerId: string } | null {
  // Implement rock-paper-scissors logic here
  // This is a simplified version for two players
  if (gameLogs.length !== 2) return null;

  const [player1, player2] = gameLogs;
  if (player1.move === player2.move) return null; // It's a tie

  if (
    (player1.move === "rock" && player2.move === "scissors") ||
    (player1.move === "paper" && player2.move === "rock") ||
    (player1.move === "scissors" && player2.move === "paper")
  ) {
    return { playerId: player1.playerId };
  } else {
    return { playerId: player2.playerId };
  }
}

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
