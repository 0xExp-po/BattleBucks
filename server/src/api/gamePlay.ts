import { z } from "zod";
import { publicProcedure } from ".";
import { prisma } from "../app";

export const gamePlay = publicProcedure.input(z.object({
    matchId: z.number(),
    player: z.string(),
    selected: z.string()
})).output(z.object({
    matchId: z.string(),
    playerId: z.string(),
    selected: z.string().or(z.literal("rock")).or(z.literal("paper")).or(z.literal("scissors"))
}))
    .mutation(async (req): Promise<any> => {
        const { matchId, playerId, selected } = req.input;

        const game = await prisma.game.findUnique({
            where: {
                id: matchId
            }
        });

        if (!game) {
            return {
                status: 404,
                error: "Game not found"
            }
        }

        if (game.secondPlayerId !== playerId || game.firstPlayerId !== playerId) {
            return {
                status: 400,
                error: "Invalid player"
            }
        }

        // rock paper scissors logic
        // if (game.firstPlayerSelected && game.secondPlayerSelected) {
        //     if (game.firstPlayerSelected === game.secondPlayerSelected) {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: "draw"
        //             }
        //         });
        //     } else if (game.firstPlayerSelected === "rock" && game.secondPlayerSelected === "scissors") {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: game.firstPlayerId
        //             }
        //         });
        //     } else if (game.firstPlayerSelected === "scissors" && game.secondPlayerSelected === "rock") {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: game.secondPlayerId
        //             }
        //         });
        //     } else if (game.firstPlayerSelected === "paper" && game.secondPlayerSelected === "rock") {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: game.firstPlayerId
        //             }
        //         });
        //     } else if (game.firstPlayerSelected === "rock" && game.secondPlayerSelected === "paper") {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: game.secondPlayerId
        //             }
        //         });
        //     } else if (game.firstPlayerSelected === "scissors" && game.secondPlayerSelected === "paper") {
        //         await prisma.game.update({
        //             where: {
        //                 id: matchId
        //             },
        //             data: {
        //                 winner: game.firstPlayerId
        //             }
        //         });
        //     }
        // }




        return {
            matchId,
            playerId,
            selected
        }
    });