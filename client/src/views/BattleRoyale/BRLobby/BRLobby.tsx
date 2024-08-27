import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { timeout } from "../../../utils/timeout";
import Loader from "../../../components/Loader/Loader";
import Logo from "../../../components/Logo/Logo";
import Button from "../../../components/Button/Button";
import MatchFoundOverlay from "../../../components/MatchFoundOverlay/MatchFoundOverlay";
import "./BRLobby.scss";

function BRLobby() {
  const [currentPlayers, setCurrentPlayers] = useState(15);
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [gameReady, setGameReady] = useState(false);
  const rendered = useRef(true);
  const location = useLocation();
  const [gameId] = useState(location.state?.gameId);
  const navigate = useNavigate();

  const textDuration = 2000;

  const startGame = async () => {
    await timeout(3000);
    setGameReady(true)
    //await timeout(textDuration);
    //rendered.current && navigate("/br");
  }

  useEffect(() => {
    startGame();
    return () => { rendered.current = false };
  }, []);

  useEffect(() => {
    if (!gameId) {
      console.error("game id undefined");
      navigate("/");
      return;
    }
    console.log("game id", gameId);
  }, []);

  if (!gameId) return <div></div>;

  return (
    <div className="brLobby flexCol flex center">
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
