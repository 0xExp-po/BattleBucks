import { z } from "zod";
import { publicProcedure } from ".";
import { commonResponse } from "../interfaces/MessageResponse";
import { prisma } from "../app";

const inputSchema = z.object({
  userName: z.string(),
  gameType: z.enum(["v1v1", "BattleRoyale"]),
  betAmount: z.number(),
  totalPlayers: z.number().optional(),
  matchType: z.enum(["MatchMaking", "InviteFriend"]),
});

const outputSchema = commonResponse(
  z.object({
    gameId: z.string(),
    playerTwo: z.string(),
    betAmount: z.number(),
    totalPlayers: z.number().optional(),
  }).nullable()
);

export const newMatch = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }): Promise<any> => {
    const { userName, gameType, betAmount, totalPlayers, matchType } = input;

    if (matchType !== "MatchMaking") {
      return {
        status: 400,
        result: null,
        error: "Only MatchMaking is currently supported",
      };
    }

    const [firstPlayer, secondPlayer] = await Promise.all([
      prisma.user.findFirst({
        select: { id: true },
        where: { isOnline: true, username: userName },
      }),
      prisma.user.findFirst({
        select: { id: true },
        where: { isOnline: true, username: { not: userName } },
      }),
    ]);

    if (!firstPlayer || !secondPlayer) {
      return {
        status: 404,
        result: null,
        error: "Unable to find players",
      };
    }

    try {
      const game = await prisma.game.create({
        data: {
          buyIn: betAmount,
          maxPlayers: totalPlayers || 2,
          firstPlayerId: firstPlayer.id,
          secondPlayerId: secondPlayer.id,
          gameType: gameType,
        },
      });

      return {
        status: 200,
        result: {
          gameId: game.id,
          playerTwo: game.secondPlayerId,
          betAmount: game.buyIn,
          totalPlayers: game.maxPlayers,
        },
      };
    } catch (error) {
      console.error("Error creating game:", error);
      return {
        status: 500,
        result: null,
        error: "Internal server error occurred while creating the game",
      };
    }
  });
