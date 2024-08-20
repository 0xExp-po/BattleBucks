import React from "react";
import Welcome from "./views/Welcome/Welcome";
import Profile from "./views/Profile";
import Versus from "./views/Versus/Versus";
import MatchHistory from "./views/MatchHistory";
import VersusLobby from "./views/VersusLobby";
import VersusBuyin from "./views/VersusBuyin/VersusBuyin";
import GameEnd from "./views/GameEnd";
import ViewTransition from "./components/ViewTransition/ViewTransition";
import BRGameList from "./views/BRGameList/BRGameList";
import BRCreate from "./views/BRCreate/BRCreate";
import BRLobby from "./views/BRLobby/BRLobby";
import BattleRoyale from "./views/BattleRoyale";
import { useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SocketProvider } from "./utils/socket";
import { useTelegram } from "./utils/telegram";

function App() {
  const element = useRoutes([
    {
      path: "/",
      element: <ViewTransition><Welcome /></ViewTransition>
    },
    {
      path: "/profile",
      element: <ViewTransition><Profile /></ViewTransition>
    },
    {
      path: "/versus",
      element: <ViewTransition><Versus /></ViewTransition>
    },
    {
      path: "/vs/lobby",
      element: <ViewTransition><VersusLobby /></ViewTransition>
    },
    {
      path: "/vs/buyin",
      element: <ViewTransition><VersusBuyin /></ViewTransition>
    },
    {
      path: "/br",
      element: <ViewTransition><BattleRoyale /></ViewTransition>
    },
    {
      path: "/br/games",
      element: <ViewTransition><BRGameList /></ViewTransition>
    },
    {
      path: "/br/create",
      element: <ViewTransition><BRCreate /></ViewTransition>
    },
    {
      path: "/br/lobby",
      element: <ViewTransition><BRLobby /></ViewTransition>
    },
    {
      path: "/matches",
      element: <ViewTransition><MatchHistory /></ViewTransition>
    },
    {
      path: "/end",
      element: <ViewTransition><GameEnd /></ViewTransition>
    },
  ]);

  if (!element) return <div></div>;

  const telegram = useTelegram();
  const token = telegram.initData?.token;

  if (!token) return <div></div>;

  return (
    <SocketProvider token={token}>
      <div className="flexCol flex" style={{ overflow: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          {React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
      </div>
      {/* {true && <Tutorial />} */}
    </SocketProvider>
  );
}

export default App;
