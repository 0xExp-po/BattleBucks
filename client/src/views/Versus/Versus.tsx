import { useNavigate } from "react-router";
import GameView from "../../components/GameView/GameView";

function Versus() {
  const navigate = useNavigate();

  return <GameView onGameEnd={data => navigate("/end", { state: { game: data } })} />;
}

export default Versus;
