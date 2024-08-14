import React, { useState } from "react";
import Welcome from "./views/Welcome";
import Profile from "./views/Profile";
import Versus from "./views/Versus/Versus";
import MatchHistory from "./views/MatchHistory";
import VersusLobby from "./views/VersusLobby";
import VersusBuyin from "./views/VersusBuyin/VersusBuyin";
import GameEnd from "./views/GameEnd";
import ViewTransition from "./components/ViewTransition";
import BRLobby from "./views/BRLobby/BRLobby";
import { useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageContext, LANGUAGE_ENGLISH } from "./hooks/useLocalization";
import { LanguageString } from "./utils/types";

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

  const [language, setLanguage] = useState(LANGUAGE_ENGLISH);

  const location = useLocation();

  const getString = (s: LanguageString, ...s2: string[]) => {
    let str = language[s] as string || LANGUAGE_ENGLISH[s];
    if (!str) return "?";
    for (let i = 0; i < s2.length; i++) {
      str.replace("$" + i, s2[i]);
    }
    return str;
  }

  if (!element) return <div></div>;

  return (
    <LanguageContext.Provider value={{ l: getString, language, setLanguage }}>
      <div className="flexCol flex" style={{ overflowX: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          {React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
      </div>
      {/* {true && <Tutorial />} */}
    </LanguageContext.Provider>
  );
}

export default App;
