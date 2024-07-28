import Logo from "../components/Logo/Logo";
import Button from "../components/Button/Button";
import SocketContext from "../utils/socket";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { timeout } from "../utils/timeout";

enum State {
  Idle,
  Searching,
  Found
};

function VersusBuyin() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [state, setState] = useState<State>(State.Idle);

  // example implementation
  const startNewGame = () => {
    socket.emit("newGame", {
      gameType: "BattleRoyale",
      userName: "@VJBass",
      matchType: "MatchMaking",
    });
  }

  const startNewFakeGame = async () => {
    setState(State.Searching);
    await timeout(3766);
    setState(State.Found);
    await timeout(1000);
    navigate("/versus");
  };

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <Logo />
      <h2>Choose buy-in!</h2>
      <motion.div style={{ opacity: state === State.Idle ? 0 : 1, transition: { duration: 0.2, ease: "easeOut" } }}>
        {state === State.Found ? "Match found!" : "Searching..."}
      </motion.div>
      <div className="flexCol center" style={{ margin: "1em 0", gap: "1em" }}>
        <Button type="big" style={{ width: "60%" }} onClick={() => startNewGame()}><b>$1</b></Button>
        <Button type="big" style={{ width: "60%" }} onClick={() => startNewFakeGame()}><b>$2</b></Button>
        <Button type="big" style={{ width: "60%" }} onClick={() => navigate("/versus")}><b>$5</b></Button>
      </div>
      <Button type="cancel" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default VersusBuyin;