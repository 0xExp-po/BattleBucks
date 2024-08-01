import { z } from "zod";
import { publicProcedure } from "../index";
import { prisma } from "../../app";
import { commonResponse } from "../../interfaces/MessageResponse";
import { Game, GameParticipant, GameType } from "@prisma/client";

const createGameSchema = z.object({
  buyIn: z.number().optional(),
  maxPlayers: z.number(),
  gameType: z.nativeEnum(GameType),
});

const joinGameSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
});

export const createGame = publicProcedure
  .input(createGameSchema)
  .output(commonResponse(z.object({ game: z.any() }).nullable()))
  .mutation(async ({ input }): Promise<any> => {
    try {
      const game = await prisma.game.create({
        data: input,
      });
      return {
        status: 200,
        result: { game },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export const joinGame = publicProcedure
  .input(joinGameSchema)
  .output(commonResponse(z.object({ gameParticipant: z.any() }).nullable()))
  .mutation(async ({ input }): Promise<any> => {
    try {
      const gameParticipant = await prisma.gameParticipant.create({
        data: {
          ...input,
          playerId: input.userId, // Assuming userId is the same as playerId
          team: 0, // Default value, adjust as needed
        },
      });
      return {
        status: 200,
        result: { gameParticipant },
      };
    } catch (error) {
      return {
        status: 500,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

// Other game controller functions...