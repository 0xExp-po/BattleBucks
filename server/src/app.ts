import express from 'express';
import cors from 'cors';
import { appRouter } from './api/router';
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { createContext } from './context';
import { expressHandler } from "trpc-playground/handlers/express";
import { PrismaClient } from '@prisma/client';
const app = express();
import { Server } from "socket.io";


// ROUTES
app.get("/", (req, res) => {
  res.send("hello, world!");
});

// initialize trpc on express server with playground
const TRPC_ENDPOINT = "/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/trpc-playground";
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create()
export const prisma = new PrismaClient()



const io = new Server({
  cors: {
    origin: "*" ||  ["http://localhost:5173"],
  },
});

io.listen(5001);

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.on("userOnline" , async (data) => {
    console.log(data);
    const result = await prisma.user.update({
      where: {
        username: data.userName
      },
      data: {
        isOnline: true
      }
    });
    console.log(result);
  })

  socket.on("userOffline" , async (data) => {
    console.log(data);
    const result = await prisma.user.update({
      where: {
        username: data.userName
      },
      data: {
        isOnline: false
      }
    });
    console.log(result);
  })

  socket.on("newGame", async (data) => {
    console.log(data);
    const { userName, gameType, totalPlayers, buyIn, matchType } = data;
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
        console.log("First Player", firstPlayer)
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
        console.log("Second Player", secondPlayer)
    }
    socket.emit(`newGameReq-${secondPlayer?.id}` , {firstPlayer})

})

    // player two accpeted
    socket.on(`acceptRequest` , async (data) => {
      const { buyIn, totalPlayers, firstPlayer, secondPlayer, gameType } = data
    try {
        const game = await prisma.game.create({
            data: {
                buyIn : buyIn,
                maxPlayers: totalPlayers || 2,
                firstPlayerId: firstPlayer?.id!,
                secondPlayerId: secondPlayer?.id,
                gameType: gameType,
            },
            include : {
              firstPlayer: true,
              secondPlayer: true
            }
        });


        // Ensure gameId and playerTwo are not undefined
        if (typeof game.id === "undefined" || typeof game.secondPlayerId === "undefined") {
          io.emit("gameError", "Game ID or Player Two ID is undefined");
        }
    io.emit("matchPlayer", game);
  } catch (error) {
    console.log("Error creating game:", error);
    io.emit("gameError", error);
    }
    })

// TODO:
socket.on("gamePlay", async (data) => {
    const { matchId, playerOnePlay, playerTwoPlay } = data;
    socket.join(`gameRoom-${matchId}`);

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

    if (game.secondPlayerId !== playerOnePlay.playerId || game.firstPlayerId !== playerTwoPlay.playerId) {
      return {
        status: 400,
        error: "Invalid player"
      }
    }

    let seleted = {
      playerOneSelected: playerOnePlay.selected,
      playerTwoSelected: playerTwoPlay.selected
    }
    let gameResult;

    // rock paper scissors logic
    if (seleted.playerOneSelected === seleted.playerTwoSelected) {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winner: undefined
        }
      });
    } else if (seleted.playerOneSelected === "rock" && seleted.playerTwoSelected === "scissors") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game.firstPlayerId
        }
      });
    } else if (seleted.playerOneSelected === "rock" && seleted.playerTwoSelected === "paper") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game?.secondPlayerId
        }
      });
    } else if (seleted.playerOneSelected === "paper" && seleted.playerTwoSelected === "rock") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game?.firstPlayerId
        }
      });
    } else if (seleted.playerOneSelected === "paper" && seleted.playerTwoSelected === "scissors") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game?.secondPlayerId
        }
      });
    } else if (seleted.playerOneSelected === "scissors" && seleted.playerTwoSelected === "rock") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game?.secondPlayerId
        }
      });
    } else if (seleted.playerOneSelected === "scissors" && seleted.playerTwoSelected === "paper") {
      gameResult = await prisma.game.update({
        where: {
          id: matchId
        },
        data: {
          winnerId: game.firstPlayerId
        }
      });
    }

  io.to(`gameRoom-${matchId}`).emit("gameResult", gameResult);

  socket.on("disconnect", () => {
    console.log(`socket ${socket.id} disconnected`);
  });
});
});

// MIDDLEWARE
io.use((socket, next) => {
  let token = socket.handshake.query.key;
  if (token === process.env.SOCKET_TOKEN) {
    next();
  }
})



app.use(cors({ origin: "*" }));
app.use(
  TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

expressHandler({
  trpcApiEndpoint: TRPC_ENDPOINT,
  playgroundEndpoint: TRPC_PLAYGROUND_ENDPOINT,
  router: appRouter,
  // uncomment this if you're using superjson
  request: {
    // superjson: true,
  },
}).then((handeler: any) => {
  app.use(handeler);
});


export default app;