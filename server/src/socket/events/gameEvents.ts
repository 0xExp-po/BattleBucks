import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus, MoveType } from "@prisma/client";
import { GameType } from "@prisma/client"; // Import GameType for validation
import { determineWinner } from "../../utils/game";
import { CustomSocket } from "..";

export const gameEvents = (socket: CustomSocket, io: Server) => {
  // Notify game created
  socket.on(
    "C2S_CREATE_GAME",
    async (data: {
      buyIn?: number;
      maxPlayers: number;
      gameType: GameType;
    }) => {
      console.log(`Creating game with data:`, data);
      try {
        const game = await prisma.game.create({
          data: {
            buyIn: data.buyIn,
            maxPlayers: data.maxPlayers,
            eliminatedPlayersCnt: 0,
            gameType: data.gameType,
            status: GameStatus.OPEN,
          },
        });
        io.emit("S2C_GAME_CREATED", { gameId: game.id });
      } catch (error) {
        console.error(`Failed to create game:`, error);
        socket.emit("S2C_ERROR", {
          message: "Failed to create the game. Please try again.",
        });
      }
    }
  );

  // Handle player joining a game room
  socket.on("C2S_JOIN_GAME", async (data: { gameId: string }) => {
    console.log(`Player ${socket.user.userId} joining game ${data.gameId}`);
    try {
      const gameParticipant = await prisma.gameParticipant.create({
        data: {
          gameId: data.gameId,
          playerId: userStatus[socket.id].userId || "",
        },
      });
      socket.join(data.gameId);
      io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
        playerId: socket.user.userId,
        gameParticipant,
      });
    } catch (error) {
      console.error(`Failed to join game:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to join the game. Please try again.",
      });
    }
  });

  // Handle game start notification
  socket.on("C2S_START_GAME", async (gameId: string) => {
    console.log(`Game ${gameId} started`);
    try {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: GameStatus.IN_PROGRESS },
      });
    } catch (error) {
      console.error(`Failed to update game status for game ${gameId}:`, error);
      socket.emit("S2C_ERROR", {
        message: "Failed to start the game. Please try again.",
      });
      return;
    }

    io.to(gameId).emit("S2C_GAME_STARTED", {
      gameId: gameId,
    });
  });

  // Handle move submission in a game
  socket.on(
    "C2S_SUBMIT_MOVE",
    async (data: { gameId: string; move: MoveType; round: number }) => {
      console.log(
        `Player ${socket.user.userId} submitted move in game ${data.gameId}`
      );
      try {
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
        const game = await prisma.game.findUnique({
          where: { id: data.gameId },
          include: {
            participants: true, // Include participants to check how many are left
          },
        });

        if (game) {
          // All players have submitted their moves, determine the remaining players
          const num = game.maxPlayers - game.eliminatedPlayersCnt;
          const gameLogs = await prisma.gameLog.findMany({
            where: { gameId: data.gameId, round: data.round },
            orderBy: { createdAt: "asc" },
            take: num,
          });

          if (gameLogs.length < game.maxPlayers - game.eliminatedPlayersCnt) {
            return {
              status: 200,
              result: { success: false, winner: null },
            };
          }

          // Determine the remaining and eliminated players
          const result = determineWinner(gameLogs);

          if (result === "draw") {
            io.to(data.gameId).emit("S2C_DRAW", {
              message: "It's a draw! Replay the round.",
            });
          } else {
            // Handle the remaining and eliminated players
            const { remainingPlayers, eliminatedPlayers } = result;

            // Update the game with the winner or continue with remaining players
            if (remainingPlayers.length === 1) {
              // Only one player remains, declare them the winner
              const winnerId = remainingPlayers[0];
              await prisma.game.update({
                where: { id: data.gameId },
                data: { winner: winnerId, status: GameStatus.CLOSED },
              });

              io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
                playerId: socket.user.userId,
                move: data.move,
                winner: winnerId,
              });
            } else {
              // Multiple players remain, continue the game
              io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
                playerId: socket.user.userId,
                move: data.move,
                remainingPlayers,
                eliminatedPlayers,
              });

              // Optionally, notify the eliminated players
              for (const playerId of eliminatedPlayers) {
                io.to(playerId).emit("S2C_ELIMINATED", {
                  message: "You have been eliminated from the game.",
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to submit move:`, error);
        socket.emit("S2C_ERROR", {
          message: "Failed to submit the move. Please try again.",
        });
      }
    }
  );

  // Handle game result notification
  socket.on(
    "C2S_END_GAME",
    async (data: { gameId: string; winnerId: string }) => {
      console.log(`Game ${data.gameId} ended. Winner is ${data.winnerId}`);

      // Update the status of all participants
      for (const socketId in userStatus) {
        const user = userStatus[socketId];
        if (user.gameId === data.gameId) {
          userStatus[socketId] = { ...user, status: "ONLINE" };
        }
      }

      try {
        await prisma.game.update({
          where: { id: data.gameId },
          data: { status: GameStatus.CLOSED },
        });
      } catch (error) {
        console.error(
          `Failed to update game status for game ${data.gameId}:`,
          error
        );
        socket.emit("S2C_ERROR", {
          message: "Failed to end the game. Please try again.",
        });
        return;
      }

      io.to(data.gameId).emit("S2C_GAME_ENDED", {
        winnerId: data.winnerId,
      });
    }
  );

  // Update game state
  socket.on("C2S_UPDATE_GAME_STATE", (data: { gameId: string; state: any }) => {
    console.log(`Updating game state for ${data.gameId}`);
    io.to(data.gameId).emit("S2C_GAME_STATE_UPDATED", {
      gameId: data.gameId,
      state: data.state,
    });
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
