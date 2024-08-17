import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { timeout } from "../../utils/timeout";
import { useNavigate } from "react-router";
import Chooser from "../../components/Chooser/Chooser";
import Pill from "../../components/Pill";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/Button/Button";

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
    currentPlayers: 1,
    maxPlayers: 16,
    buyin: 10,
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
  const navigate = useNavigate();

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

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <Pill>
        <h3 style={{ fontFamily: "Bangers" }}>Battle Royale</h3>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Chooser label="Buyin:" options={[undefined, 1, 2]} onChange={(e) => setBuyin(e as number | undefined)} />
          <Chooser label="Max Players:" options={[undefined, 8, 16, 32, 64]} onChange={e => setMaxPlayers(e as number | undefined)} />
        </div>
        <Button type="accept" style={{ fontSize: "0.75em", marginTop: "2em", padding: "0" }} onClick={() => navigate("/br/create")}>Create Game</Button>
      </Pill>
      <motion.div animate={{ opacity: loading ? 1 : 0, transition: { duration: 0.15, ease: "easeOut" } }}>
        <Loader />
      </motion.div>
      {games.length > 0 &&
        <Pill style={{ alignItems: "stretch", gap: "1em", padding: "1em" }}>
          {games.map((game, i) => (
            <button key={i} onClick={() => joinGame(game)}>
              <Pill style={{ alignItems: "stretch" }}>
                <div className="flexRow flex" style={{ justifyContent: "space-between" }}>
                  <div>bo1/bo3/bo5</div>
                  <div>Distribucija nagrada</div>
                </div>
                <div className="flexRow flex" style={{ justifyContent: "space-between" }}>
                  <div><b>{game.currentPlayers}</b> / <b>{game.maxPlayers}</b></div>
                  <div>${game.buyin}</div>
                </div>
              </Pill>
            </button>
          ))}
        </Pill>
      }
    </div >
  );
}

export default BRGameList;
