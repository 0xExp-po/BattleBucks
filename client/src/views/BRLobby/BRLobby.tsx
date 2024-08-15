import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { timeout } from "../../utils/timeout";
import Loader from "../../components/Loader/Loader";
import Logo from "../../components/Logo/Logo";
import Button from "../../components/Button/Button";
import MatchFoundOverlay from "../../components/MatchFoundOverlay/MatchFoundOverlay";

function BRLobby() {
  const [currentPlayers, setCurrentPlayers] = useState(15);
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [gameReady, setGameReady] = useState(false);
  const rendered = useRef(true);
  const navigate = useNavigate();

  const textDuration = 2000;

  const startGame = async () => {
    await timeout(3000);
    setGameReady(true)
    await timeout(textDuration);
    rendered && navigate("/br");
  }

  useEffect(() => {
    startGame();
    return () => { rendered.current = false };
  }, []);

  return (
    <div className="flexCol flex center" style={{ margin: "1em", gap: "1em" }}>
      <Logo />
      <Loader label="Waiting for game..." />
      <h3>
        Players:
        <div className="flexRow center" style={{ gap: "1em" }}>
          <b>{currentPlayers}</b> / <b>{maxPlayers}</b>
        </div>
      </h3>
      <div className="flexRow" style={{ width: "100%" }}>
        <Button className="flexRow flex" style={{ margin: "2em" }} onClick={() => navigate("/")}>Exit</Button>
      </div>
      <MatchFoundOverlay trigger={gameReady} duration={textDuration} />
    </div>
  );
}

export default BRLobby;
