import { z } from "zod";
import { publicProcedure } from ".";
import { commonResponse } from "../interfaces/MessageResponse";
import { prisma } from "../app";

export const newMatch = publicProcedure.input(z.object({
    userName: z.string(),
    gameType: z.enum(['v1v1', "BattleRoyale"]),
    betAmount: z.number(),
    totalPlayers: z.number().optional(),
    matchType: z.enum(['MatchMaking', "InviteFriend"]),
})).output(commonResponse(z.object({
    gameId: z.number(),
    playerTwo: z.string(),
    betAmount: z.number(),
    totalPlayers: z.number().optional(),
}))).mutation(async (req): Promise<any> => {
    const { userName, gameType, betAmount, totalPlayers, matchType } = req.input;
    let firstPlayer, secondPlayer;

    if (matchType === "MatchMaking") {
        firstPlayer = await prisma.user.findFirst({
            select: {
                id: true,
                isOnline: true,
                profilePicture: true,
                username: true
            },
            where: {
                isOnline: true,
                username: userName
            }
        });
        secondPlayer = await prisma.user.findFirst({
            select: {
                id: true,
                isOnline: true,
                profilePicture: true,
                username: true
            },
            where: {
                isOnline: true,
                username: {
                    not: userName
                },
            }
        })
    }

    try {
        const game = await prisma.game.create({
            data: {
                buyIn: betAmount,
                maxPlayers: totalPlayers || 2,
                firstPlayerId: firstPlayer?.id!,
                secondPlayerId: secondPlayer?.id,
                gameType: gameType,
            }
        });


        // Ensure gameId and playerTwo are not undefined
        if (typeof game.id === "undefined" || typeof game.secondPlayerId === "undefined") {
            throw new Error("Game ID or Player Two ID is undefined");
        }

        return {
            status: 200,
            result: {
                gameId: game.id,
                playerTwo: game.secondPlayerId,
                betAmount: game.buyIn,
                totalPlayers: game.maxPlayers,
            }
        };
    } catch (error) {
        console.error("Error creating game:", error);
        return {
            status: 400,
            result: null,
            error: "Something went wrong"
        }
    }
})