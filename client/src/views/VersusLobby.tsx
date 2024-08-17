import { useNavigate } from "react-router";
import { useContext, useRef } from "react";
import { trpc } from "../trpc/trpc";
import { useTelegram } from "../utils/telegram";
import { timeout } from "../utils/timeout";
import Button from "../components/Button/Button";
import Logo from "../components/Logo/Logo";
import SocketContext from "../utils/socket";

function VersusLobby() {
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const mutation = trpc.game.joinGame.useMutation();
  const telegramData = useTelegram();

  const joinGame = () => {
    if (!inputRef.current?.value) {
      return;
    }
    if (!telegramData.initDataUnsafe.user) {
      console.info("no user");
      return;
    }
    mutation.mutate({ gameId: inputRef.current.value, playerId: telegramData.initDataUnsafe.user.username, team: 1 });
    socket.emit("C2S_JOIN_GAME");

    socket.on("C2S_GAME_CREATED", async () => {
      console.log("CRATED")
      await timeout(2000);
      navigate("/versus");
    });
  };

  return (
    <div className="flexCol flex" style={{ margin: "5em 1em" }}>
      <Logo />
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Button type="big" className="flex" onClick={() => navigate("/vs/buyin", { state: { matchMethod: "matchmaking" } })}>Find a Match</Button>
        </div>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Button type="big" className="flex" onClick={() => navigate("/vs/buyin", { state: { matchMethod: "invite" } })}>Invite a friend</Button>
          <Button type="big" className="flex" onClick={joinGame}>Join Game</Button>
        </div>
        <input type="text" ref={inputRef} />
      </div>
      <Button type="cancel" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default VersusLobby;