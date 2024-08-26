import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTelegram } from "../../../utils/telegram";
import GameView from "../../../components/GameView/GameView";
import MatchFoundOverlay from "../../../components/MatchFoundOverlay/MatchFoundOverlay";

function BRGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(location.state.game);
  const [showingTitle, setShowingTitle] = useState(false);
  const telegram = useTelegram();

  useEffect(() => void !game && navigate("/"), []);
  if (!game) return <div></div>

  return showingTitle ? <RoundShow trigger={showingTitle} player1={telegram.initData?.user.name || ""} player2={"Player2"} /> : <GameView onGameEnd={() => setShowingTitle(false)} />;
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
