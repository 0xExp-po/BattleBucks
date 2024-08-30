import { useContext, useEffect, useState } from "react";
import { useTelegramColors } from "../../../utils/telegram";
import SocketContext from "../../../utils/socket";
import Chooser from "../../../components/Chooser/Chooser";
import Button from "../../../components/Button/Button";
import Back from "../../../components/Back/Back";
import "./BRCreate.scss";

interface BRCreateProps {
  onGameCreate: (game: Game) => void;
}

function BRCreate(props: BRCreateProps) {
  const [buyin, setBuyin] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const socket = useContext(SocketContext);
  useTelegramColors({ header: "#fff9cb" });

  // game create
  useEffect(() => {
    socket.on("S2C_GAME_CREATED", res => {
      props.onGameCreate(res.game);
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
      <div className="brGameListHeader flexCol">
        <div className="flexRow">
          <div className="flex center"><Back /></div>
          <h3 className="outline2" style={{ fontFamily: "Bangers", flex: 5 }}>Battle Royale</h3>
          <div className="flex"></div>
        </div>
      </div>
      <div className="flexCol center flex" style={{ gap: "1em", marginBottom: "5em" }}>
        <h2 className="brCreateGameText outline2" style={{ margin: "1em" }}>Create Game</h2>
        <div className="flexRow center" style={{ width: "100%" }}>
          <Chooser labelPosition="top" style={{ fontSize: "1.8em", flex: 1 }} label="Buy-in:" options={[undefined, 1, 2, 5]} onChange={e => setBuyin(e as number | undefined)} />
          <Chooser labelPosition="top" style={{ fontSize: "1.8em", flex: 1 }} label="Max Players:" options={[undefined, 4, 8, 16, 32, 64]} onChange={e => setMaxPlayers(e as number | undefined)} />
        </div>
        <Button style={{ background: "#fff9cb", marginTop: "1em" }} onClick={createGame}>Create</Button>
      </div>
    </div>
  );
}

export default BRCreate;
