import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SocketContext from "../../../utils/socket";
import Chooser from "../../../components/Chooser/Chooser";
import Button from "../../../components/Button/Button";
import Logo from "../../../components/Logo/Logo";
import "./BRCreate.scss";

interface BRCreateProps {
  onGameCreate: (game: Game) => void;
}

function BRCreate(props: BRCreateProps) {
  const [buyin, setBuyin] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  // game create
  useEffect(() => {
    socket.on("S2C_GAME_CREATED", res => {
      props.onGameCreate
      navigate("/br/lobby", { state: { gameId: res.gameId } });
    });
    return () => void socket.off("S2C_GAME_CREATED");
  }, []);

  const createGame = () => {
    if (!buyin || !maxPlayers) return;
    socket.emit("C2S_CREATE_GAME", {
      buyIn: buyin,
      maxPlayers: maxPlayers,
      gameType: "BattleRoyale",
    });
  };

  return (
    <div className="brCreate flexCol flex">
      <Logo />
      <h2>Create Game</h2>
      <Chooser label="Buyin:" options={[undefined, 1, 2, 5]} onChange={e => setBuyin(e as number | undefined)} />
      <Chooser label="Max Players:" options={[undefined, 8, 16, 32, 64]} onChange={e => setMaxPlayers(e as number | undefined)} />
      <Button onClick={createGame}>Create</Button>
    </div>
  );
}

export default BRCreate;
