import { io, Socket } from "socket.io-client";
import { GameType, GameStatus, MoveType } from "@prisma/client";
import jwt from 'jsonwebtoken';

// Game Library
const gameLibrary = {
  createGame: (socket: Socket, buyIn: number, maxPlayers: number, gameType: GameType) => {
    socket.emit("C2S_CREATE_GAME", { buyIn, maxPlayers, gameType });
  },
  joinGame: (socket: Socket, gameId: string) => {
    socket.emit("C2S_JOIN_GAME", { gameId });
  },
  startGame: (socket: Socket, gameId: string) => {
    socket.emit("C2S_START_GAME", { gameId });
  },
  submitMove: (socket: Socket, gameId: string, move: MoveType, round: number) => {
    socket.emit("C2S_SUBMIT_MOVE", { gameId, move, round });
  },
  leaveGame: (socket: Socket, gameId: string) => {
    socket.emit("C2S_LEAVE_GAME", { gameId });
  },
  fetchOpenGames: (socket: Socket) => {
    socket.emit("C2S_FETCH_BATTLE_LOYAL_GAMES");
  }
};

const GAME_ID = "5b7465ee-9b6a-48fb-b7a2-edebc7f14fe4";
// Mock multiple user connections and game logic
const mockGame = async () => {
  const token1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NzEyMWI3OS1iNDI3LTQzNTUtOWE2My00OGM2NTkwY2VhZGMiLCJpYXQiOjE3MjU2MDQ5OTZ9.ZG46khmxl3YwCQUli2VvFnr6dcq-JL5pp_2lbUZLNok";
  const token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZjQzZjFiZS05ZmYyLTRmMjItOThjZS00ODM3MjYzOTViZDIiLCJpYXQiOjE3MjU2MDUwMzd9.buXKBmFx8YHxTUN8MJYybcyKe1hY64WVdLSzpLh_cP4"

  const player1 = io("http://localhost:5000", {
    extraHeaders: {
      token: token1
    }
  });
  const player2 = io("http://localhost:5000", {
    extraHeaders: {
      token: token2
    }
  });

  let gameId: string;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Step 1: Player1 creates a game
  await delay(1000);
//   console.log("Player 1 creates a game");
//   gameLibrary.createGame(player1, 100, 2, GameType.v1v1);

  // Step 2: Both players receive game created event
  player1.on("S2C_GAME_CREATED", async (data: { game: any }) => {
    console.log("Game created:", data);
    gameId = data.game.id;
    
    // Step 3: Player1 joins the game
    await delay(1000);
    console.log("Player 1 joins the game");
    gameLibrary.joinGame(player1, GAME_ID);
  });

  player2.on("S2C_GAME_CREATED", async (data: { game: any }) => {
    // Step 4: Player2 joins the game
    await delay(2000);
    console.log("Player 2 joins the game");
    gameLibrary.joinGame(player2, data.game.id);
  });

  gameLibrary.joinGame(player1, GAME_ID);
  gameLibrary.joinGame(player2, GAME_ID);

  // Step 5: Both players receive player joined events
  player1.on("S2C_PLAYER_JOINED", async (data: { playerId: string; game: any }) => {
    console.log("Player joined:", data);
    if (data.game.participants.length === 2) {
      // Step 6: Player1 starts the game
      await delay(1000);
      console.log("Player 1 starts the game");
      gameLibrary.startGame(player1, GAME_ID);
    }
  });

  player2.on("S2C_PLAYER_JOINED", (data: { playerId: string; game: any }) => {
    console.log("Player joined:", data);
  });

  // Step 7: Both players receive game started event
  player1.on("S2C_GAME_STARTED", async (data: { gameId: string; bracket: any; currentRound: number }) => {
    console.log("Game started:", data);
    // Step 8: Player1 submits a move
    await delay(1000);
    console.log("Player 1 submits ROCK");
    gameLibrary.submitMove(player1, GAME_ID, MoveType.ROCK, data.currentRound);
  });

  player2.on("S2C_GAME_STARTED", async (data: { gameId: string; bracket: any; currentRound: number }) => {
    console.log("Game started:", data);
    // Step 9: Player2 submits a move
    await delay(2000);
    console.log("Player 2 submits PAPER");
    gameLibrary.submitMove(player2, GAME_ID, MoveType.PAPER, data.currentRound);
  });

  // Step 10: Both players receive move submitted events
  player1.on("S2C_MOVE_SUBMITTED", (data: { gameId: string; round: number; playerId: string }) => {
    console.log("Move submitted:", data);
  });

  player2.on("S2C_MOVE_SUBMITTED", (data: { gameId: string; round: number; playerId: string }) => {
    console.log("Move submitted:", data);
  });

  // Step 11: Both players receive matchup result
  player1.on("S2C_MATCHUP_RESULT", (data: { gameId: string; round: number; winner: string; loser: string }) => {
    console.log("Matchup result:", data);
  });

  player2.on("S2C_MATCHUP_RESULT", (data: { gameId: string; round: number; winner: string; loser: string }) => {
    console.log("Matchup result:", data);
  });

  // Step 12: Both players receive round complete event
  player1.on("S2C_ROUND_COMPLETE", (data: { gameId: string; round: number }) => {
    console.log("Round complete:", data);
  });

  player2.on("S2C_ROUND_COMPLETE", (data: { gameId: string; round: number }) => {
    console.log("Round complete:", data);
  });

  // Step 13: Both players receive game ended event
  player1.on("S2C_GAME_ENDED", (data: { gameId: string; winner: string }) => {
    console.log("Game ended. Winner is:", data.winner);
    player1.disconnect();
  });

  player2.on("S2C_GAME_ENDED", (data: { gameId: string; winner: string }) => {
    console.log("Game ended. Winner is:", data.winner);
    player2.disconnect();
  });

  player1.on("S2C_ERROR", (error: { message: string }) => {
    console.error("Player 1 Error:", error.message);
  });

  player2.on("S2C_ERROR", (error: { message: string }) => {
    console.error("Player 2 Error:", error.message);
  });
};

// Run the mock game
mockGame();
