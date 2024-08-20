import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { timeout } from "../../utils/timeout";
import { useNavigate } from "react-router";
import Chooser from "../../components/Chooser/Chooser";
import Pill from "../../components/Pill";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/Button/Button";
import Back from "../../components/Back/Back";
import Token from "../../components/Token/Token";
import vars from "../../variables.module.scss";
import "./BRGameList.scss";
import { useTelegramColors } from "../../utils/telegram";

interface Game {
  currentPlayers: number;
  maxPlayers: number;
  buyin: number;
}

const initGames = [
  {
    currentPlayers: 5,
    maxPlayers: 32,
    buyin: 5,
  },
  {
    currentPlayers: 12,
    maxPlayers: 64,
    buyin: 2,
  },
  {
    currentPlayers: 8,
    maxPlayers: 16,
    buyin: 10,
  },
  {
    currentPlayers: 7,
    maxPlayers: 8,
    buyin: 2,
  },
  {
    currentPlayers: 2,
    maxPlayers: 16,
    buyin: 1,
  },
  {
    currentPlayers: 24,
    maxPlayers: 32,
    buyin: 5,
  },
  {
    currentPlayers: 33,
    maxPlayers: 64,
    buyin: 2,
  }
];

function BRGameList() {
  const [loading, setLoading] = useState(false);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [buyin, setBuyin] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  useTelegramColors({ header: "#fff9cb"});
  const navigate = useNavigate();

  useEffect(() => {
    console.log(vars);
  }, []);

  useEffect(() => {
    const refetch = async () => {
      setLoading(true);
      await timeout(1000);
      setAllGames(initGames);
      setLoading(false);
    }
    const interval = setInterval(refetch, 2000);
    refetch();
    return () => clearInterval(interval);
  }, []);

  const joinGame = (game: Game) => {
    console.log("joined game", game);
    navigate("/br/lobby");
  };

  let games = allGames;
  if (buyin) games = games.filter(game => game.buyin === buyin);
  if (maxPlayers) games = games.filter(game => game.maxPlayers === maxPlayers);
  games = games.sort((g1, g2) => g1.currentPlayers / g1.maxPlayers - g2.currentPlayers / g2.maxPlayers);

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
                  <div><b>{game.currentPlayers}</b> / <b>{game.maxPlayers}</b></div>
                  <div><Token>{game.buyin}</Token></div>
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
