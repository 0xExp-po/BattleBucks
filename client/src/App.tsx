import React from "react";
import Welcome from "./views/Welcome";
import Profile from "./views/Profile";
import Versus from "./views/Versus/Versus";
import BattleRoyale from "./views/BattleRoyale";
import MatchHistory from "./views/MatchHistory";
import VersusLobby from "./views/VersusLobby";
import VersusBuyin from "./views/VersusBuyin";
import GameEnd from "./views/GameEnd";
import ViewTransition from "./components/ViewTransition";
import { useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.scss";

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
      path: "/matches",
      element: <ViewTransition><MatchHistory /></ViewTransition>
    },
    {
      path: "/end",
      element: <ViewTransition><GameEnd /></ViewTransition>
    },
  ]);

  const location = useLocation();

  if (!element) return <div></div>;

  return (
    <>
      <div className="flexCol flex" style={{ overflowX: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          {React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
      </div>
      {/* {true && <Tutorial />} */}
    </>
  );
}

export default App;
