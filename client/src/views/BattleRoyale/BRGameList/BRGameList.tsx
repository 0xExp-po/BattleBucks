import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useTelegramColors } from "../../../utils/telegram";
import Chooser from "../../../components/Chooser/Chooser";
import Pill from "../../../components/Pill";
import Loader from "../../../components/Loader/Loader";
import Button from "../../../components/Button/Button";
import Back from "../../../components/Back/Back";
import Token from "../../../components/Token/Token";
import SocketContext from "../../../utils/socket";
import "./BRGameList.scss";

interface BRGameListProps {
  onGameJoin: (game: Game) => void;
}

function BRGameList(props: BRGameListProps) {
  const [loading, setLoading] = useState(false);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [buyin, setBuyin] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const socket = useContext(SocketContext);

  useTelegramColors({ header: "#fff9cb" });
  const navigate = useNavigate();

  // games fetch
  useEffect(() => {
    socket.on("S2C_FETCH_BATTLE_LOYAL_GAMES", (res) => {
      console.log(res);
      setAllGames(res);
      setLoading(false);
    });

    const refetch = async () => {
      setLoading(true);
      socket.emit("C2S_FETCH_BATTLE_LOYAL_GAMES");
    }

    const interval = setInterval(refetch, 3000);
    refetch();

    return () => {
      clearInterval(interval);
      socket.off("S2C_FETCH_BATTLE_LOYAL_GAMES");
    }
  }, []);

  // join game
  const joinGame = (game: Game) => {
    props.onGameJoin(game);
  };

  let games = allGames;
  if (buyin) games = games.filter(game => game.buyIn === buyin);
  if (maxPlayers) games = games.filter(game => game.maxPlayers === maxPlayers);
  games = games.sort((g1, g2) => g1.participants.length / g1.maxPlayers - g2.participants.length / g2.maxPlayers);

  return (
    <div className="brGameList">
      <div className="flexCol flex" style={{ overflow: "auto" }}>
        <div className="brGameListHeader flexCol">
          <div className="flexRow">
            <div className="flex center"><Back /></div>
            <h3 className="outline2" style={{ fontFamily: "Bangers", flex: 5 }}>Battle Royale</h3>
            <div className="flex"></div>
          </div>
          <div className="flexCol center">
            <div className="flexRow" style={{ gap: "1em" }}>
              <Chooser label="Buyin:" options={["All", 1, 2]} onChange={(e) => setBuyin(typeof e === "number" ? e : undefined)} />
              <Chooser label="Max Players:" options={["All", 8, 16, 32, 64]} onChange={e => setMaxPlayers(typeof e === "number" ? e : undefined)} />
            </div>
          </div>
        </div>
        <div className="flexCol flex" style={{ alignItems: "stretch", gap: "0.5em", padding: "0.5em 1em", overflowY: "auto" }}>
          <motion.div animate={{ opacity: loading ? 1 : 0, transition: { duration: 0.15, ease: "easeOut" } }}>
            <Loader />
          </motion.div>
          {games.map((game, i) => (
            <button key={i} onClick={() => joinGame(game)} style={{ borderRadius: 9999 }}>
              <Pill style={{ alignItems: "stretch", color: "white", borderRadius: "inherit" }}>
                <div className="flexRow flex" style={{ justifyContent: "space-between" }}>
                  <div>BO1</div>
                  <div>Winner Only</div>
                </div>
                <div className="flexRow flex" style={{ justifyContent: "space-between" }}>
                  <div><b>{game.participants.length}</b> / <b>{game.maxPlayers}</b></div>
                  <div><Token>{game.buyIn}</Token></div>
                </div>
              </Pill>
            </button>
          ))}
        </div>
      </div>
      <div className="flexCol center" style={{ padding: "1em", backgroundColor: "white", boxShadow: "rgba(0,0,0,0.2) 0 0 5px 1px", borderTop: "1px solid grey" }}>
        <Button type="accept" onClick={() => navigate("/br/create")}>Create Game</Button>
      </div>
    </div >
  );
}

export default BRGameList;
