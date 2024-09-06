import { Server, Socket } from "socket.io";
import { userStatus } from "../userStatus";
import { prisma } from "../../prisma";
import { GameStatus, MoveType } from "@prisma/client";
import { GameType } from "@prisma/client"; // Import GameType for validation
import { determineWinner, createBracket, advanceBracket, fillBracket, getRank } from "../../utils/game";
import { CustomSocket } from "..";
import { bountyDistribution, commissionRate } from "../../../config/settings.json";

export const gameEvents = (socket: CustomSocket, io: Server) => {
  // Notify game created
  socket.on("C2S_CREATE_GAME", async (data: { buyIn?: number; maxPlayers: number; gameType: GameType }) => {
    console.log("Creating game");
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
      if (![2, 4, 8, 16, 32, 64].includes(data.maxPlayers)) {
        socket.emit("S2C_ERROR", {
          message: "Max players must be 2, 4, 8, 16, 32, or 64.",
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
          brackets: {
            create: createBracket(data.maxPlayers),
          },
        },
        include: {
          participants: true,
          brackets: true,
        },
      });

      // Automatically add the creator to the game
      await prisma.gameParticipant.create({
        data: {
          gameId: game.id,
          playerId: socket.user.userId,
        },
      });

      // Fill the bracket with the creator
      await fillBracket(prisma, game.id, socket.user.userId);

      // Fetch the updated game with participants and brackets
      const updatedGame = await prisma.game.findUnique({
        where: { id: game.id },
        include: {
          participants: true,
          brackets: true,
        },
      });

      io.emit("S2C_GAME_CREATED", { game: updatedGame });
    } catch (error) {
      console.error("Failed to create game");
      socket.emit("S2C_ERROR", {
        message: "Failed to create the game. Please try again.",
      });
    }
  });

  // Handle player joining a game room
  socket.on("C2S_JOIN_GAME", async (data: { gameId: string }) => {
    console.log("C2S_JOIN_GAME event received");
    try {
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || !data.gameId) {
        console.log("Error: Game ID is required");
        socket.emit("S2C_ERROR", {
          message: "Game ID is required.",
        });
        return;
      }
      console.log("Player joining game");
      const game = await prisma.game.findUnique({
        where: {
          id: data.gameId,
        },
        include: {
          participants: true,
          brackets: true,
        },
      });
      console.log("Game found");
      if (!game) {
        console.log("Error: Game not found");
        socket.emit("S2C_ERROR", {
          message: "Game not found.",
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
      console.log("Existing game participant");
      if (!gameParticipant) {
        console.log("Creating new game participant");
        if (game.participants.length + 1 > game.maxPlayers) {
          console.log("Error: Game is full");
          socket.emit("S2C_ERROR", {
            message: "The game is already full.",
          });
          return;
        }
        gameParticipant = await prisma.gameParticipant.create({
          data: {
            gameId: data.gameId,
            playerId: socket.user.userId,
          },
        });

        // Fill the bracket with the new player
        await fillBracket(prisma, data.gameId, socket.user.userId);
      } else {
        console.log("Updating existing game participant");
        // Check if the participant is already in a bracket
        const existingBracket = game.brackets.find(b => 
          b.player1Id === socket.user.userId || b.player2Id === socket.user.userId
        );
        
        if (!existingBracket) {
          // If not in a bracket, fill one
          await fillBracket(prisma, data.gameId, socket.user.userId);
        }
        
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
      console.log("Joining socket to game room");
      socket.join(data.gameId);

      // Fetch the updated game with participants and brackets
      const updatedGame = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: {
          participants: true,
          brackets: true,
        },
      });

      console.log("Emitting S2C_PLAYER_JOINED event");
      io.to(data.gameId).emit("S2C_PLAYER_JOINED", {
        playerId: socket.user.userId,
        game: updatedGame,
      });
      console.log("C2S_JOIN_GAME process completed successfully");
    } catch (error) {
      console.error("Failed to join game");
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

      const game = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: { participants: true, brackets: true },
      });

      if (!game || game.participants.length !== game.maxPlayers) {
        socket.emit("S2C_ERROR", {
          message: "Cannot start the game. Not all slots are filled.",
        });
        return;
      }

      await prisma.game.update({
        where: { id: data.gameId },
        data: {
          status: GameStatus.IN_PROGRESS,
          currentRound: 1,
        },
      });
      console.log("Game started");
      io.to(data.gameId).emit("S2C_GAME_STARTED", {
        gameId: data.gameId,
        bracket: game.brackets,
        currentRound: 1,
      });
    } catch (error) {
      console.error("Failed to update game status");
      socket.emit("S2C_ERROR", {
        message: "Failed to start the game. Please try again.",
      });
    }
  });

  // Handle move submission in a game
  socket.on("C2S_SUBMIT_MOVE", async (data: { gameId: string; move: MoveType; round: number }) => {
    try {
      console.log("C2S_SUBMIT_MOVE event received");
      if (typeof data === "string") data = JSON.parse(data);
      if (!data || !data.gameId || !data.move || typeof data.round !== "number" || data.round < 0) {
        throw new Error("Invalid game ID, move, or round.");
      }

      console.log("Fetching game data");
      const game = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: { participants: true, brackets: true },
      });
      console.log("Game data fetched");

      if (!game || game.status !== GameStatus.IN_PROGRESS || game.currentRound !== data.round) {
        throw new Error("Invalid game state or round.");
      }

      // Ensure the socket is in the game room
      if (!socket.rooms.has(data.gameId)) {
        console.log("Joining socket to game room");
        socket.join(data.gameId);
      }

      console.log("Checking for existing move");
      // Check if the player has already submitted a move for this round
      const existingMove = await prisma.gameLog.findFirst({
        where: {
          gameId: data.gameId,
          playerId: socket.user.userId,
          round: data.round,
        },
      });
      console.log("Existing move checked");

      if (existingMove) {
        throw new Error("You have already submitted a move for this round.");
      }

      console.log("Player submitted move in game");

      console.log("Logging move in database");
      // Log the move in the database
      await prisma.gameLog.create({
        data: {
          gameId: data.gameId,
          playerId: socket.user.userId,
          move: data.move,
          round: data.round,
        },
      });
      console.log("Move logged successfully");

      console.log("Finding current matchup");
      const currentMatchup = game?.brackets.find(
        (bracket) =>
          bracket.round === data.round &&
          (bracket.player1Id === socket.user.userId || bracket.player2Id === socket.user.userId)
      );
      console.log("Current matchup found");

      if (!currentMatchup) {
        throw new Error("Player not found in current round matchups.");
      }

      // Check if both players are in the matchup
      if (!currentMatchup.player1Id || !currentMatchup.player2Id) {
        throw new Error("Matchup is not ready yet.");
      }

      console.log("Fetching moves for matchup");
      const movesForMatchup = await prisma.gameLog.findMany({
        where: {
          gameId: data.gameId,
          round: data.round,
          playerId: { in: [currentMatchup.player1Id, currentMatchup.player2Id].filter((id): id is string => id !== null) },
        },
      });
      console.log("Moves for matchup fetched");
      console.log("Moves for matchup:", movesForMatchup);
      if (movesForMatchup.length === 2) {
        console.log("Both players have submitted moves. Determining winner");
        const winner = determineWinner(movesForMatchup);
        const loser = winner === currentMatchup.player1Id ? currentMatchup.player2Id : currentMatchup.player1Id;
        console.log("Winner and loser determined");

        console.log("Updating bracket");
        // Update bracket and get information about eliminated players
        const { eliminatedPlayers, nextRound, isGameOver } = await advanceBracket(prisma, game.id, data.round, winner);

        // Notify about the matchup result
        io.to(data.gameId).emit("S2C_MATCHUP_RESULT", {
          gameId: data.gameId,
          round: data.round,
          winner: winner,
          loser: loser,
        });

        // Notify eliminated players
        for (const eliminatedPlayer of eliminatedPlayers) {
          const rank = await getRank(prisma, game.id, eliminatedPlayer);
          io.to(eliminatedPlayer).emit("S2C_PLAYER_ELIMINATED", {
            gameId: data.gameId,
            round: data.round,
            rank: rank,
          });
        }

        if (isGameOver) {
          // Game is over, we have a winner
          await prisma.game.update({
            where: { id: data.gameId },
            data: {
              status: GameStatus.CLOSED,
              winner: winner,
            },
          });

          io.to(data.gameId).emit("S2C_GAME_ENDED", {
            gameId: data.gameId,
            winner: winner,
          });
        } else if (nextRound) {
          // Move to next round
          await prisma.game.update({
            where: { id: data.gameId },
            data: { currentRound: nextRound },
          });

          io.to(data.gameId).emit("S2C_ROUND_COMPLETE", {
            gameId: data.gameId,
            nextRound: nextRound,
          });
        }
      } else {
        console.log("Notifying that a move has been submitted");
        // Notify that a move has been submitted
        io.to(data.gameId).emit("S2C_MOVE_SUBMITTED", {
          gameId: data.gameId,
          round: data.round,
          playerId: socket.user.userId,
        });
      }
    } catch (error) {
      console.error("Failed to submit move");
      socket.emit("S2C_ERROR", {
        message: error instanceof Error ? error.message : "Failed to submit the move. Please try again.",
      });
    }
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
    console.log("Updating game state");
    io.to(data.gameId).emit("S2C_GAME_STATE_UPDATED", {
      gameId: data.gameId,
      state: data.state,
    });
  });

  // Handle user leaving a game
  socket.on("C2S_LEAVE_GAME", async (data: { gameId: string }) => {
    if (typeof data === "string") data = JSON.parse(data);
    console.log("Player attempting to leave game");
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
          brackets: true,
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
