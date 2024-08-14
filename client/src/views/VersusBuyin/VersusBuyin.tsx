import Logo from "../../components/Logo/Logo";
import Button from "../../components/Button/Button";
import Loader from "../../components/Loader/Loader";
import SocketContext from "../../utils/socket";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { timeout } from "../../utils/timeout";
import { trpc } from "../../trpc/trpc";
import { Game } from "../../utils/types";
import "./VersusBuyin.scss";

enum State {
  Idle,
  Searching,
  Found
};

const matchFoundTextDuration = 2000;

function VersusBuyin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<State>(State.Idle);
  const [game, setGame] = useState<Game>();
  const socket = useContext(SocketContext);

  const mutation = trpc.game.createGame.useMutation();

  useEffect(() => {
    location.state?.matchMethod === undefined && navigate("/");
  }, []);

  if (location.state?.matchMethod == undefined) {
    return <div></div>;
  }

  const startMatchmaking = async () => {
    // TODO
    console.log("matchmaking");
  }

  // example implementation
  const startCustomLobby = async () => {
    setState(State.Searching);

    const response = await mutation.mutateAsync({ gameType: "v1v1", buyIn: 1, maxPlayers: 2 })

    if (!response.result || response.status != 200) {
      console.error("Error while starting new game: ", response.error);
      setState(State.Idle);
      return;
    }
    const g = response.result.game;

    const game = {
      id: g.id,
      gameType: g.gameType,
      maxPlayers: g.maxPlayers,
      buyIn: g.buyIn,
      status: g.status,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
    };

    socket.on("S2C_GAME_CREATED", async () => {
      console.log("CRATED")
      await timeout(matchFoundTextDuration);
      navigate("/versus");
    });

    console.info(game);
  }

  const startNewFakeGame = async () => {
    setState(State.Searching);
    await timeout(3766);
    setState(State.Found);
    await timeout(matchFoundTextDuration);
    navigate("/versus");
  };

  const messageStyle = {
    opacity: state === State.Idle ? 0 : 1,
    transform: state === State.Idle ? "scaleY(0)" : "",
    display: "grid",
    gridTemplateRows: state === State.Idle ? "0fr" : "1fr",
    transition: "grid-template-rows 500ms, opacity 500ms, transform 500ms",
  };

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <Logo />
      <h2>Choose buy-in!</h2>
      {game && <div style={{ height: "2em" }}>{game.id}</div>}
      <motion.div style={messageStyle}>
        <Loader style={{ overflow: "hidden", fontWeight: "bold" }} label={state === State.Found ? "Match found!" : "Searching..."} />
      </motion.div>
      <motion.div className="flexCol center" style={{ margin: "1em 0", gap: "1em" }}>
        <Button type="big" disabled={state !== State.Idle} style={{ width: "60%" }} onClick={() => startCustomLobby()}>$1</Button>
        <Button type="big" disabled={state !== State.Idle} style={{ width: "60%" }} onClick={() => startNewFakeGame()}>$2</Button>
        <Button type="big" disabled={state !== State.Idle} style={{ width: "60%" }} onClick={() => navigate("/versus")}>$5</Button>
      </motion.div>
      <Button type="cancel" disabled={state !== State.Idle} onClick={() => navigate(-1)}>Back</Button>
      <motion.div
        style={{ transform: state === State.Found ? "translateX(100%)" : "translateX(-100%)", transitionDuration: matchFoundTextDuration + "ms" }}
        className="matchFoundOverlay"
      >
        <h1 className="matchFoundText">Match Found!</h1>
      </motion.div>
    </div>
  );
}

export default VersusBuyin;