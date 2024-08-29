import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus, MoveType } from "@prisma/client";
import { GameType } from "@prisma/client"; // Import GameType for validation
import { determineWinner } from "../../utils/game";
import { CustomSocket } from "..";

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
      }
      socket.join(data.gameId);

      // Fetch all users in the same room
      const usersInRoom = await prisma.gameParticipant.findMany({
        where: { gameId: data.gameId },
        include: { player: true },
      });

      io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
        playerId: socket.user.userId,
        gameParticipant,
        usersInRoom: usersInRoom.map((participant) => ({
          userId: participant.player.id,
          username: participant.player.username,
        })),
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
      let result: { remainingPlayers: string[]; eliminatedPlayers: string[] } | "draw" | undefined;
      if (allMovesSubmitted) {
        result = determineWinner(gameLogs);
      }

      if (result === "draw" || result === undefined) {
        io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
          playerId: socket.user.userId,
          move: data.move,
          gameId: data.gameId,
          round: data.round,
          submittedMoves,
          totalMoves: participantCount,
          winner: null,
        });
      } else {
        const { remainingPlayers, eliminatedPlayers } = result;

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
            gameId: data.gameId,
            round: data.round,
            submittedMoves,
            totalMoves: participantCount,
            winner: winnerId,
          });

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
            winnerId: game.winner,
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
            remainingPlayers,
            eliminatedPlayers,
          });

          // Notify the eliminated players
          eliminatedPlayers.forEach(playerId => {
            io.to(playerId).emit("S2C_ELIMINATED", {
              message: "You have been eliminated from the game.",
              gameId: data.gameId,
              round: data.round,
            });
          });
        }
      }
    } catch (error) {
      console.error(`Failed to submit move:`, error);
      socket.emit("S2C_ERROR", {
        message: error instanceof Error ? error.message : "Failed to submit the move. Please try again.",
      });
    }
  });

  // Handle game result notification
  socket.on("C2S_END_GAME", async (data: { gameId: string; winnerId: string }) => {
    if (typeof data === "string") data = JSON.parse(data);
    if (!data || !data.gameId || !data.winnerId) {
      socket.emit("S2C_ERROR", {
        message: "Invalid game end data. Game ID and winner ID are required.",
      });
      return;
    }
    console.log(`Game ${data?.gameId} ended. Winner is ${data?.winnerId}`);
    // Update the status of all participants
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
      winnerId: data.winnerId,
    });
  });

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
        },
      });

      if (!participant) {
        socket.emit("S2C_ERROR", {
          message: "You are not a participant in this game.",
        });
        return;
      }

      // Remove the player from the game participants
      await prisma.gameParticipant.delete({
        where: {
          gameId_playerId: {
            gameId: data.gameId,
            playerId: socket.user.userId,
          },
        },
      });

      socket.leave(data.gameId);
      io.to(data.gameId).emit("S2C_PLAYER_LEFT", {
        playerId: socket.user.userId,
      });

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
