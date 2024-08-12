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

  function determineWinner(gameLogs: { playerId: string; move: string }[]): { playerId: string } | null {
    // Validate input
    if (gameLogs.length < 2) {
      throw new Error("At least two players are required to determine a winner.");
    }
  
    // Define the rules of the game
    const rules: { [key: string]: string } = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper",
    };
  
    // Initialize a map to track wins
    const winCounts: { [key: string]: number } = {};
  
    // Iterate over all possible matchups
    for (let i = 0; i < gameLogs.length; i++) {
      for (let j = i + 1; j < gameLogs.length; j++) {
        const player1 = gameLogs[i];
        const player2 = gameLogs[j];
  
        if (player1.move === player2.move) {
          continue; // It's a tie for this round
        }
  
        if (rules[player1.move] === player2.move) {
          // Player 1 wins
          winCounts[player1.playerId] = (winCounts[player1.playerId] || 0) + 1;
        } else {
          // Player 2 wins
          winCounts[player2.playerId] = (winCounts[player2.playerId] || 0) + 1;
        }
      }
    }
  
    // Determine the player with the most wins
    let winner: { playerId: string } | null = null;
    let maxWins = 0;
  
    for (const playerId in winCounts) {
      if (winCounts[playerId] > maxWins) {
        maxWins = winCounts[playerId];
        winner = { playerId };
      } else if (winCounts[playerId] === maxWins) {
        winner = null; // If there's a tie in win counts, return null (no clear winner)
      }
    }
  
    return winner;
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
