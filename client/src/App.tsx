import { useLocation, useRoutes } from "react-router-dom";
import "./App.css"
import Welcome from "./views/Welcome";
import Profile from "./views/Profile";
import Versus from "./views/Versus";
import BattleRoyale from "./views/BattleRoyale";
import Navbar from "./components/Navbar";
import MatchHistory from "./views/MatchHistory";
import VersusLobby from "./views/VersusLobby";
import VersusBuyin from "./views/VersusBuyin";
import GameEnd from "./views/GameEnd";
import { AnimatePresence } from "framer-motion";
import React from "react";
import SlideRight from "./components/SlideRight";
import { getQueryClient } from "@trpc/react-query/shared";

function App() {
  const element = useRoutes([
    {
      path: "/",
      element: <SlideRight><Welcome /></SlideRight>
    },
    {
      path: "/profile",
      element: <SlideRight><Profile /></SlideRight>
    },
    {
      path: "/versus",
      element: <SlideRight><Versus /></SlideRight>
    },
    {
      path: "/vs/lobby",
      element: <SlideRight><VersusLobby /></SlideRight>
    },
    {
      path: "/vs/buyin",
      element: <SlideRight><VersusBuyin /></SlideRight>
    },
    {
      path: "/br",
      element: <SlideRight><BattleRoyale /></SlideRight>
    },
    {
      path: "/matches",
      element: <SlideRight><MatchHistory /></SlideRight>
    },
    {
      path: "/end",
      element: <SlideRight><GameEnd /></SlideRight>
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
        <div style={{ padding: "3em 0" }}></div>
      </div>
      <Navbar />
    </>
  );
}

export default App;
