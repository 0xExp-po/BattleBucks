import { useEffect } from "react";
import { useNavigate } from "react-router";
import GameView from "../../../components/GameView/GameView";
import MatchFoundOverlay from "../../../components/MatchFoundOverlay/MatchFoundOverlay";

function BRGame(props: { game?: Game, player?: Participant }) {
  const navigate = useNavigate();
  const game = props.game;

  useEffect(() => void !game && navigate("/"), []);
  if (!game) return <div></div>

  return <GameView game={game} onGameEnd={() => console.log("GAME END")} />;
}

function RoundShow(props: { trigger: boolean, player1: string, player2: string }) {
  return (
    <div>
      <MatchFoundOverlay trigger={props.trigger} duration={300}>
        <>
          <div>{props.player1}</div>
          <div>vs</div>
          <div>{props.player2}</div>
        </>
      </MatchFoundOverlay>
    </div>
  );
}

export default BRGame;
