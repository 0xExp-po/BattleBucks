import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

function BRGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(location.state.game);

  useEffect(() => {
    if (!game) navigate("/");

  }, []);
  if (!game) return <div></div>

  return (
    <div>{game.id}</div>
  );
}

export default BRGame;
