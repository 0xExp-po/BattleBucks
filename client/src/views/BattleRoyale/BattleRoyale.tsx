import { useLocation, useNavigate, useRoutes } from "react-router";
import { AnimatePresence } from "framer-motion";
import { useTelegram } from "../../utils/telegram";
import React, { useContext, useEffect, useRef, useState } from "react";
import SocketContext from "../../utils/socket";
import ViewTransition from "../../components/ViewTransition/ViewTransition";
import BRCreate from "./BRCreate/BRCreate";
import BRGame from "./BRGame/BRGame";
import BRGameList from "./BRGameList/BRGameList";
import BRLobby from "./BRLobby/BRLobby";

function BattleRoyale() {
  const socket = useContext(SocketContext);
  const telegram = useTelegram();
  const n = useNavigate();
  const location = useLocation();

  const game = useRef<Game | undefined>(location.state?.game);
  const player = useRef<Participant | undefined>(location.state?.player);
  const gameStarted = useRef<boolean>(location.state?.gameStarted);

  const [_, rerender] = useState({});

  // navigate wrapper to preserve state
  const navigate = (to: string) => {
    console.log({ state: { game: game.current, player: player.current, gameStarted: gameStarted.current } })
    n(to, { state: { game: game.current, player: player.current, gameStarted: gameStarted.current } });
  }

  useEffect(() => {
    socket.on("S2C_ERROR", (e) => {
      console.error(e);
    });

    socket.on("S2C_PLAYER_JOINED", (r) => {
      console.log("player join", r)

      game.current?.participants.push(r);
      rerender({});

      if (r.playerId !== telegram.tokenData?.userId)
        return;

      player.current = r;
      console.log("confirmed game", game.current, ", entering lobby...");
      navigate("/br/lobby");
    });

    socket.on("S2C_GAME_STARTED", r => {
      console.log("GAME STARTED RECEIVED", r);
      gameStarted.current = true;
      rerender({});
    });

    return () => {
      socket.off("S2C_ERROR");
      socket.off("S2C_PLAYER_JOINED");
      socket.off("S2C_GAME_STARTED");
    };
  }, [rerender]);

  // game join
  const onGameJoin = (g: Game) => {
    if (!telegram.initData) return;

    console.log("joined game", g);
    game.current = g;
    player.current = undefined;

    // ***************
    // ** TEMPORARY **
    // ***************

    const interval = setInterval(() => {
      if (!player.current || !game.current) return;

      game.current.participants.push(player.current);

      if (game.current.participants.length > game.current.maxPlayers) {
        clearInterval(interval);
        gameStarted.current = true;
        navigate("/br/game");
      }
    }, 1000);

    // ***************
    // ** TEMPORARY **
    // ***************

    socket.emit("C2S_JOIN_GAME", { gameId: g.id });
  };

  // game create
  const onGameCreate = (g: Game) => {
    console.log("created game", g)
    if (!g) {
      console.error("NO GAME");
      return;
    }
    game.current = g;
    player.current = undefined;

    navigate("/br/lobby");
  };

  const element = useRoutes([
    {
      path: "game",
      element: <ViewTransition><BRGame game={game.current} player={player.current} /></ViewTransition>
    },
    {
      path: "games",
      element: <ViewTransition><BRGameList onGameJoin={onGameJoin} /></ViewTransition>
    },
    {
      path: "create",
      element: <ViewTransition><BRCreate onGameCreate={onGameCreate} /></ViewTransition>
    },
    {
      path: "lobby",
      element: <ViewTransition><BRLobby gameReady={gameStarted.current} onGameReady={() => navigate("/br/game")} game={game.current} /></ViewTransition>
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
