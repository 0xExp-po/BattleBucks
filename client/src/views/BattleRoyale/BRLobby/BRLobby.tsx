import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { timeout } from "../../../utils/timeout";
import Loader from "../../../components/Loader/Loader";
import Logo from "../../../components/Logo/Logo";
import Button from "../../../components/Button/Button";
import MatchFoundOverlay from "../../../components/MatchFoundOverlay/MatchFoundOverlay";
import "./BRLobby.scss";

interface BRLobbyProps {
  game?: Game;
  gameReady: boolean;
  onGameReady: () => void;
  onLeave: () => void;
}

function BRLobby(props: BRLobbyProps) {
  const rendered = useRef(true);
  const navigate = useNavigate();
  const game = props.game;

  const textDuration = 2000;

  const startGame = async () => {
    await timeout(textDuration);
    //props.onGameReady();
  }

  useEffect(() => {
    if (!props.gameReady) return;
    startGame();
  }, [props.gameReady]);

  useEffect(() => {
    console.log("entered game", game);
    return () => { rendered.current = false };
  }, []);

  // validate game
  useEffect(() => {
    if (!game) {
      console.error("game undefined");
      navigate("/");
      return;
    }
    console.log("game id", game);
  }, []);

  if (!game) return <div></div>;

  console.log(props.gameReady);

  return (
    <div className="brLobby flexCol flex center">
      <Logo />
      <Loader label="Waiting for game..." />
      <h3>
        Players:
        <div className="flexRow center" style={{ gap: "1em" }}>
          <b>{game.participants.length}</b> / <b>{game.maxPlayers}</b>
        </div>
      </h3>
      <div className="flexRow" style={{ width: "100%" }}>
        <Button className="flexRow flex" style={{ margin: "2em" }} onClick={props.onLeave}>Exit</Button>
      </div>
      <MatchFoundOverlay trigger={props.gameReady} duration={textDuration} />
    </div>
  );
}

export default BRLobby;
