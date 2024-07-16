/*
 Step One -  Find the match or second Player
 Step two - send a req to that player
 Setp Three - if he accept the request - save createGame and
 Step Four - GameLogice
 Step FIve - transactions

*/

import { Game, GameLog, GameType, User } from "@prisma/client";
import { Socket } from "socket.io";
import { io, prisma } from "../app";
import { randomUUID } from "crypto";

export async function findMatch(socket: Socket, currentUser: User | undefined): Promise<User> {
 return new Promise<User>(async (resolve, reject) => {
  const eventName = `findMatch-${currentUser?.id}`;

  console.log(currentUser ,"currentuser" , eventName)
  socket.on(`findMatch-${currentUser?.id}`, async (data) => {
   const { userName, gameType, totalPlayers, buyIn, matchType } = data;
   console.log(data);

   const onFindMatch = async (data : any) => {
    let secondPlayer;
    try {
     if (matchType === "MatchMaking") {
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

     if (secondPlayer === undefined || secondPlayer === null) {
      socket.emit("gameError", "Unable to Find User Please Try again Later")
     }
     console.log(secondPlayer)
     socket.emit(`newGameReqest-${secondPlayer?.id}`, { currentUser })
    } catch (error) {
     socket.emit("gameError", error)
    } finally {
     socket.off(eventName, onFindMatch);
    }
   }

   socket.on(eventName, onFindMatch);
  })
 })
}

export async function acceptRequest(socket: Socket, currentUser: User | undefined): Promise<Game> {
 return new Promise<Game>(async(resolve, reject) => {
  socket.on(`acceptRequest-${currentUser?.id}`, async (data) => {
   const { buyIn, totalPlayers, firstPlayer, secondPlayer, gameType } = data
   console.log(data);
   try {
    const game = await prisma.game.create({
     data: {
      id: randomUUID(),
      buyIn: buyIn,
      maxPlayers: totalPlayers || 2,
      firstPlayerId: firstPlayer?.id!,
      secondPlayerId: secondPlayer?.id,
      gameType: gameType,
     },
     include: {
      firstPlayer: true,
      secondPlayer: true
     }
    });


    // Ensure gameId and playerTwo are not undefined
    if (typeof game.id === "undefined" || typeof game.secondPlayerId === "undefined") {
     socket.emit("gameError", "Game ID or Player Two ID is undefined");
    }
    console.log(game);

    socket.join(`GameRoom-${game.id}`)
    socket.emit("matchPlayer", game);
    resolve(game);
   } catch (error) {
    console.log("Error creating game:", error);
    socket.emit("gameError", error);
   }
  })
 })
}


export async function gamePlay(socket:Socket , gameInfo : Game) : Promise<any> {
 return new Promise(async (resolve , reject) => {
  socket.on(`gamePlay-${gameInfo?.id}`, async (data) => {
   const { matchId, playerOnePlay, playerTwoPlay } = data;

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
   resolve(gameResult)
 })
})}
