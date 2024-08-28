import { useNavigate, useRoutes } from "react-router";
import { AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useTelegram } from "../../utils/telegram";
import React, { useContext, useEffect, useState } from "react";
import SocketContext, { SocketBaseUrl } from "../../utils/socket";
import ViewTransition from "../../components/ViewTransition/ViewTransition";
import BRCreate from "./BRCreate/BRCreate";
import BRGame from "./BRGame/BRGame";
import BRGameList from "./BRGameList/BRGameList";
import BRLobby from "./BRLobby/BRLobby";

function BattleRoyale() {
  const socket = useContext(SocketContext);
  const telegram = useTelegram();
  const navigate = useNavigate();

  const [currentOpponent, setCurrentOpponent] = useState("BROpponent");

  useEffect(() => {
    socket.on("S2C_ERROR", (e) => {
      console.error(e);
    });
    return () => {
      socket.off("S2C_ERROR");
    }
  }, []);

  // game join
  const onGameJoin = (game: Game) => {
    if (!telegram.initData) return;

    console.log("joined game", game);
    console.log("attempting to join to nsp")

    socket.on("S2C_PLAYER_JOINED", (r) => {
      console.log("player join", r);
      if (r.playerId !== socket.id)
        return;

      console.info("confirmed", game.id);
      navigate("/game", { state: { game: game } });
    });

    socket.on("S2C_GAME_STARTED", r => {
      console.log("GAME STARTED RECEIVED", r)

      const game = {
        id: "gameid"
      };

      navigate("/br/game", { state: { game } });
    });

    socket.emit("C2S_JOIN_GAME", { gameId: game.id });
    //navigate("/br/lobby");
  };

  const element = useRoutes([
    {
      path: "game",
      element: <ViewTransition><BRGame /></ViewTransition>
    },
    {
      path: "games",
      element: <ViewTransition><BRGameList onGameJoin={onGameJoin} /></ViewTransition>
    },
    {
      path: "create",
      element: <ViewTransition><BRCreate onGameCreate={() => console.log("oof")} /></ViewTransition>
    },
    {
      path: "lobby",
      element: <ViewTransition><BRLobby /></ViewTransition>
    },
  ]);

  if (!element) return <div></div>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {React.cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

export default BattleRoyale;
