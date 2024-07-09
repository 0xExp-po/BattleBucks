import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <div className="flexCol flex" style={{ overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/versus" element={<Versus />} />
          <Route path="/vs/lobby" element={<VersusLobby />} />
          <Route path="/vs/buyin" element={<VersusBuyin />} />
          <Route path="/br" element={<BattleRoyale />} />
          <Route path="/matches" element={<MatchHistory />} />
          <Route path="/end" element={<GameEnd />} />
        </Routes>
        <div style={{ padding: "3em 0" }}></div>
      </div>
      <Navbar />
    </BrowserRouter>
  );
}

export default App;
