import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus } from "@prisma/client";
import { GameType } from "@prisma/client"; // Import GameType for validation

export const gameEvents = (socket: Socket, io: Server) => {
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
  socket.on(
    "C2S_JOIN_GAME",
    async (data: { gameId: string; playerId: string; team: number }) => {
      console.log(`Player ${data.playerId} joining game ${data.gameId}`);
      try {
        const gameParticipant = await prisma.gameParticipant.create({
          data: {
            gameId: data.gameId,
            playerId: data.playerId,
            team: data.team,
          },
        });
        socket.join(data.gameId);
        io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
          playerId: data.playerId,
          gameParticipant,
        });
      } catch (error) {
        console.error(`Failed to join game:`, error);
        socket.emit("S2C_ERROR", {
          message: "Failed to join the game. Please try again.",
        });
      }
    }
  );

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
    async (data: { gameId: string; playerId: string; move: string }) => {
      console.log(
        `Player ${data.playerId} submitted move in game ${data.gameId}`
      );
      try {
        // Log the move in the database
        await prisma.gameLog.create({
          data: {
            gameId: data.gameId,
            playerId: data.playerId,
            move: data.move,
          },
        });

        // Check if all players have submitted their moves
        const game = await prisma.game.findUnique({
          where: { id: data.gameId },
          include: { participants: true },
        });

        if (game && game.participants.length === game.maxPlayers) {
          // All players have submitted their moves, determine the winner
          const gameLogs = await prisma.gameLog.findMany({
            where: { gameId: data.gameId },
          });

          const winner = determineWinner(gameLogs);

          // Update the game with the winner
          await prisma.game.update({
            where: { id: data.gameId },
            data: { winner: winner?.playerId || null },
          });

          io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
            playerId: data.playerId,
            move: data.move,
            winner: winner?.playerId || null,
          });
        } else {
          io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
            playerId: data.playerId,
            move: data.move,
            winner: null,
          });
        }
      } catch (error) {
        console.error(`Failed to submit move:`, error);
        socket.emit("S2C_ERROR", {
          message: "Failed to submit the move. Please try again.",
        });
      }
    }
  );

  function determineWinner(gameLogs: any[]): { playerId: string } | null {
    // Implement rock-paper-scissors logic here
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

  // Handle game result notification
  socket.on(
    "C2S_END_GAME",
    async (data: { gameId: string; winnerId: string }) => {
      console.log(`Game ${data.gameId} ended. Winner is ${data.winnerId}`);

      // Update the status of all participants
      for (const userId in userStatus) {
        if (userStatus[userId].gameId === data.gameId) {
          userStatus[userId] = { status: "ONLINE" };
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
};