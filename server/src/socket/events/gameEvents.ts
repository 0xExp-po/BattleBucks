import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus, MoveType } from "@prisma/client";
import { GameType } from "@prisma/client"; // Import GameType for validation
import { determineWinner } from "../../utils/game";
import { CustomSocket } from "..";
import { bountyDistribution, commissionRate } from "../../../config/settings.json";

export const gameEvents = (socket: CustomSocket, io: Server) => {
  // Notify game created
  socket.on("C2S_CREATE_GAME", async (data: { buyIn?: number; maxPlayers: number; gameType: GameType }) => {
    console.log(`Creating game with data:`, data);
    try {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data) {
        socket.emit("S2C_ERROR", {
          message: "Invalid data. Please provide game details.",
        });
        return;
      }
      if (!data.maxPlayers || data.maxPlayers <= 0) {
        socket.emit("S2C_ERROR", {
          message: "Invalid max players. Please enter a positive number.",
        });
        return;
      }
      if (!data.gameType) {
        socket.emit("S2C_ERROR", {
          message: "Game type is required.",
        });
        return;
      }
      const game = await prisma.game.create({
        data: {
          buyIn: data.buyIn,
          maxPlayers: data.maxPlayers,
          eliminatedPlayersCnt: 0,
          gameType: data.gameType,
          status: GameStatus.OPEN,
        },
        include: {
          participants: true,
        },
      });

      // Automatically add the creator to the game
      await prisma.gameParticipant.create({
        data: {
          gameId: game.id,
          playerId: socket.user.userId,
        },
      });

      // Fetch the updated game with participants
      const updatedGame = await prisma.game.findUnique({
        where: { id: game.id },
        include: {
          participants: true,
        },
      });

      io.emit("S2C_GAME_CREATED", { game: updatedGame });
    } catch (error) {
      console.error(`Failed to create game:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to create the game. Please try again.",
      });
    }
  });

  // Handle player joining a game room
  socket.on("C2S_JOIN_GAME", async (data: { gameId: string }) => {
    try {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || !data.gameId) {
        socket.emit("S2C_ERROR", {
          message: "Game ID is required.",
        });
        return;
      }
      console.log(`Player ${socket.user.userId} joining game ${data?.gameId}`);
      const game = await prisma.game.findUnique({
        where: {
          id: data.gameId,
        },
        include: {
          participants: true,
        },
      });
      if (!game) {
        socket.emit("S2C_ERROR", {
          message: "Game not found.",
        });
        return;
      }
      if (game.participants.length + 1 > game.maxPlayers) {
        socket.emit("S2C_ERROR", {
          message: "The game is already full.",
        });
        return;
      }
      let gameParticipant = await prisma.gameParticipant.findUnique({
        where: {
          gameId_playerId: {
            gameId: data.gameId,
            playerId: socket.user.userId,
          },
        },
      });
      if (!gameParticipant) {
        gameParticipant = await prisma.gameParticipant.create({
          data: {
            gameId: data.gameId,
            playerId: userStatus[socket.id]?.userId || "",
          },
        });
      } else {
        await prisma.gameParticipant.update({
          where: {
            gameId_playerId: {
              gameId: data.gameId,
              playerId: socket.user.userId,
            },
          },
          data: {
            eliminated: false,
          },
        });
      }
      socket.join(data.gameId);

      io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
        playerId: socket.user.userId,
        game,
      });
    } catch (error) {
      console.error(`Failed to join game:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to join the game. Please try again.",
      });
    }
  });

  // Handle game start notification
  socket.on("C2S_START_GAME", async (data: { gameId: string }) => {
    try {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || !data.gameId) {
        socket.emit("S2C_ERROR", {
          message: "Game ID is required.",
        });
        return;
      }

      // Check if the socket is in the game room, if not, join it
      if (!socket.rooms.has(data.gameId)) {
        socket.join(data.gameId);
      }

      await prisma.game.update({
        where: { id: data.gameId },
        data: { status: GameStatus.IN_PROGRESS },
      });
      console.log(`Game ${data?.gameId} started`);
      io.to(data.gameId).emit("S2C_GAME_STARTED", {
        gameId: data.gameId,
      });
    } catch (error) {
      console.error(`Failed to update game status for game ${data.gameId}:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to start the game. Please try again.",
      });
    }
  });

  // Handle move submission in a game
  socket.on("C2S_SUBMIT_MOVE", async (data: { gameId: string; move: MoveType; round: number }) => {
    try {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || !data.gameId || !data.move || typeof data.round !== "number" || data.round < 0) {
        throw new Error("Invalid game ID, move, or round.");
      }

      // Check if the game has started and has the correct number of participants
      const game = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: { participants: true },
      });

      if (!game || game.status !== GameStatus.IN_PROGRESS) {
        throw new Error("The game has not started or is already finished.");
      }

      // Ensure the socket is in the game room
      if (!socket.rooms.has(data.gameId)) {
        socket.join(data.gameId);
      }

      // Check if the player has already submitted a move for this round
      const existingMove = await prisma.gameLog.findFirst({
        where: {
          gameId: data.gameId,
          playerId: socket.user.userId,
          round: data.round,
        },
      });

      if (existingMove) {
        throw new Error("You have already submitted a move for this round.");
      }

      console.log(`Player ${socket.user.userId} submitted move in game ${data.gameId}`);

      // Log the move in the database
      await prisma.gameLog.create({
        data: {
          gameId: data.gameId,
          playerId: socket.user.userId,
          move: data.move,
          round: data.round,
        },
      });

      // Check if all players have submitted their moves
      const participantCount = game.maxPlayers - game.eliminatedPlayersCnt; // This may change afterward development
      const gameLogs = await prisma.gameLog.findMany({
        where: { gameId: data.gameId, round: data.round },
        orderBy: { createdAt: "asc" },
        take: participantCount,
      });
      console.log("gameLogs", gameLogs);
      console.log("participantCount", participantCount);
      const submittedMoves = gameLogs.length % participantCount;
      const allMovesSubmitted = submittedMoves === 0;

      // Determine the remaining and eliminated players if all moves are submitted
      let result: { remainingPlayers: string[]; eliminatedPlayers: string[] } = { remainingPlayers: [], eliminatedPlayers: [] };
      if (allMovesSubmitted) {
        result = determineWinner(gameLogs);
      }

      const { remainingPlayers, eliminatedPlayers } = result;

      let payouts: { [key: number]: number } = {};

      if (eliminatedPlayers.length > 0) {
        // Calculate total pool and commission
        const totalPool = game.buyIn * game.maxPlayers;
        const commission = totalPool * commissionRate;
        const remainingPool = totalPool - commission;

        // Calculate bounty payouts based on rank
        payouts = {
          1: remainingPool * bountyDistribution[1],
          2: remainingPool * bountyDistribution[2],
          3: remainingPool * bountyDistribution[3],
        };

        for (const [index, playerId] of eliminatedPlayers.entries()) {
          const rank = remainingPlayers.length + index + 1; // Rank starts from 1

          if (rank <= Object.keys(bountyDistribution).length + 1) {
            const payout = payouts[rank as keyof typeof payouts];
            // Update the player's balance with their earnings
            // await prisma.user.update({
            //   where: { id: playerId },
            //   data: { balance: { increment: payout } },
            // });

            // Notify the player of their rank and earnings
            io.to(playerId).emit("S2C_ELIMINATED", {
              message: `You have been eliminated and ranked #${rank}. You earned ${payout.toFixed(2)}!`,
              gameId: data.gameId,
              round: data.round,
            });
          }

          // Update the player as eliminated in the game participants
          // await prisma.gameParticipant.update({
          //   where: {
          //     gameId_playerId: {
          //       gameId: data.gameId,
          //       playerId: playerId,
          //     },
          //   },
          //   data: {
          //     eliminated: true,
          //   },
          // });
        }
      }

      if (remainingPlayers.length === 1) {
        // Only one player remains, declare them the winner
        const winnerId = remainingPlayers[0];
        await prisma.game.update({
          where: { id: data.gameId },
          data: { winner: winnerId, status: GameStatus.CLOSED },
        });

        // Update user status
        for (const socketId in userStatus) {
          const user = userStatus[socketId];
          if (user?.gameId === data.gameId) {
            userStatus[socketId] = { ...user, status: "ONLINE" };
          }
        }

        try {
          await prisma.game.update({
            where: { id: data.gameId },
            data: { status: GameStatus.CLOSED },
          });
        } catch (error) {
          console.error(`Failed to update game status for game ${data.gameId}:`, error);
          socket.emit("S2C_ERROR", {
            message: "Failed to end the game. Please try again.",
          });
          return;
        }

        io.to(data.gameId).emit("S2C_GAME_ENDED", {
          remainers: remainingPlayers,
          losers: eliminatedPlayers,
          bountyResults: [
            ...eliminatedPlayers.map((playerId, index) => {
              const rank = remainingPlayers.length + index + 1;
              const payout = payouts[rank as keyof typeof payouts];
              return { playerId, rank, payout: payout ? payout.toFixed(2) : "0.00" };
            }),
            {
              playerId: winnerId,
              rank: 1,
              payout: payouts[1] ? payouts[1].toFixed(2) : "0.00",
            },
          ],
        });
      } else {
        // Multiple players remain, continue the game
        io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
          playerId: socket.user.userId,
          move: data.move,
          gameId: data.gameId,
          round: data.round,
          submittedMoves,
          totalMoves: participantCount,
          remainers: remainingPlayers,
          losers: eliminatedPlayers,
          bountyResults: eliminatedPlayers.map((playerId, index) => {
            const rank = remainingPlayers.length + index + 1;
            const payout = payouts[rank as keyof typeof payouts];
            return { playerId, rank, payout: payout ? payout.toFixed(2) : "0.00" };
          }),
        });

        // Notify the eliminated players
        eliminatedPlayers.forEach((playerId) => {
          io.to(playerId).emit("S2C_ELIMINATED", {
            message: "You have been eliminated from the game.",
            gameId: data.gameId,
            round: data.round,
          });
        });
      }
    } catch (error) {
      console.error(`Failed to submit move:`, error);
      socket.emit("S2C_ERROR", {
        message: error instanceof Error ? error.message : "Failed to submit the move. Please try again.",
      });
    }
  });

  // Handle game result notification
  // socket.on("C2S_END_GAME", async (data: { gameId: string; winnerId: string }) => {
  //   if (typeof data === "string") data = JSON.parse(data);
  //   if (!data || !data.gameId || !data.winnerId) {
  //     socket.emit("S2C_ERROR", {
  //       message: "Invalid game end data. Game ID and winner ID are required.",
  //     });
  //     return;
  //   }
  //   console.log(`Game ${data?.gameId} ended. Winner is ${data?.winnerId}`);
  //   // Update the status of all participants
  //   for (const socketId in userStatus) {
  //     const user = userStatus[socketId];
  //     if (user?.gameId === data.gameId) {
  //       userStatus[socketId] = { ...user, status: "ONLINE" };
  //     }
  //   }

  //   try {
  //     await prisma.game.update({
  //       where: { id: data.gameId },
  //       data: { status: GameStatus.CLOSED },
  //     });
  //   } catch (error) {
  //     console.error(`Failed to update game status for game ${data.gameId}:`, error);
  //     socket.emit("S2C_ERROR", {
  //       message: "Failed to end the game. Please try again.",
  //     });
  //     return;
  //   }

  //   io.to(data.gameId).emit("S2C_GAME_ENDED", {
  //     winnerId: data.winnerId,
  //   });
  // });

  // Update game state
  socket.on("C2S_UPDATE_GAME_STATE", (data: { gameId: string; state: any }) => {
    if (typeof data === "string") data = JSON.parse(data);
    if (!data || !data.gameId || data.state === undefined) {
      socket.emit("S2C_ERROR", {
        message: "Invalid game state update data.",
      });
      return;
    }
    console.log(`Updating game state for ${data.gameId}`);
    io.to(data.gameId).emit("S2C_GAME_STATE_UPDATED", {
      gameId: data.gameId,
      state: data.state,
    });
  });

  // Handle user leaving a game
  socket.on("C2S_LEAVE_GAME", async (data: { gameId: string }) => {
    if (typeof data === "string") data = JSON.parse(data);
    console.log(`Player ${socket.user.userId} attempting to leave game ${data?.gameId}`);
    try {
      if (!data || !data.gameId) {
        socket.emit("S2C_ERROR", {
          message: "Game ID is required.",
        });
        return;
      }

      // Check if the user is actually in the game
      const participant = await prisma.gameParticipant.findUnique({
        where: {
          gameId_playerId: {
            gameId: data.gameId,
            playerId: socket.user.userId,
          },
          eliminated: false,
        },
      });

      if (!participant) {
        socket.emit("S2C_ERROR", {
          message: "You are not a participant in this game.",
        });
        return;
      }
      // Update the player as eliminated in the game participants
      await prisma.gameParticipant.update({
        where: {
          gameId_playerId: {
            gameId: data.gameId,
            playerId: socket.user.userId,
          },
        },
        data: {
          eliminated: true,
        },
      });

      io.to(data.gameId).emit("S2C_PLAYER_LEFT", {
        playerId: socket.user.userId,
      });
      socket.leave(data.gameId);
      userStatus[socket.id] = { ...userStatus[socket.id], status: "ONLINE" };

      console.log(`Player ${socket.user.userId} successfully left game ${data.gameId}`);
    } catch (error) {
      console.error(`Failed to leave game:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to leave the game. Please try again.",
      });
    }
  });

  socket.on("C2S_FETCH_BATTLE_LOYAL_GAMES", async () => {
    console.log("Fetching list of open games");
    try {
      const games = await prisma.game.findMany({
        where: { status: GameStatus.OPEN },
        include: {
          participants: true,
        },
      });
      socket.emit("S2C_FETCH_BATTLE_LOYAL_GAMES", games);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      socket.emit("S2C_ERROR", {
        message: "Failed to fetch games. Please try again.",
      });
    }
  });
};
