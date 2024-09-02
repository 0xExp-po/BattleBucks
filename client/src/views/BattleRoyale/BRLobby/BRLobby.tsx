import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { timeout } from "../../../utils/timeout";
import { useTelegramColors } from "../../../utils/telegram";
import Loader from "../../../components/Loader/Loader";
import Button from "../../../components/Button/Button";
import MatchFoundOverlay from "../../../components/MatchFoundOverlay/MatchFoundOverlay";
import Token from "../../../components/Token/Token";
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
  useTelegramColors({ header: "#fff9cb" });

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

  return (
    <div className="brLobby flexCol flex" style={{ overflow: "auto", width: "100%" }}>
      <div className="brGameListHeader flexCol">
        <div className="flexCol">
          {/* <div style={{ padding: "0 2em" }}><Logo /></div> */}
          <h3 className="outline2 altfont" style={{ flex: 5 }}>Battle Royale</h3>
          <Loader label="Waiting for players..." />
        </div>
        <div className="flexCol center">
        </div>
      </div>
      <div className="flexCol flex center" style={{ gap: "0.5em", margin: "0 1em" }}>
        <div className="flexRow center" style={{ fontSize: "1.2em", gap: "1em" }}>
          <div className="flexCol">
            <b>Buy-in: </b><Token>{game.buyIn}</Token>
          </div>
          <div className="flexCol">
            <b>Match Type:</b>BO1
          </div>
        </div>
        <h3 className="flexRow" style={{ gap: "1em " }}>
          Players:
          <div className="flexRow center" style={{ gap: "0.5em" }}>
            <b>{game.participants.length}</b> / <b>{game.maxPlayers}</b>
          </div>
        </h3>
        <div className="flexRow flex" style={{ alignSelf: "stretch", alignContent: "flex-start", justifyContent: "space-around", gap: "0.5em", flexWrap: "wrap" }}>
          {new Array(game.maxPlayers).fill("").map((_, i) => {
            const item = i < game.participants.length && game.participants[i];
            const flexBasis = game.maxPlayers < 16 ? "40%" : "30%";
            console.log("item", item)
            if (!item) return <div key={i} style={{ flexBasis }} className="brLobbyPlayerMissing center">Waiting...</div>
            return (
              <div key={i} style={{ flexBasis }} className="brLobbyPlayerPresent center">Player ID: {item.gameParticipant.id}</div>
            );
          })}
        </div>
      </div>
      <div className="flexRow" style={{ width: "100%" }}>
        <Button className="flexRow flex" style={{ margin: "2em" }} onClick={props.onLeave}>Exit</Button>
      </div>
      <MatchFoundOverlay trigger={props.gameReady} duration={textDuration} />
    </div>
  );
}

export default BRLobby;
