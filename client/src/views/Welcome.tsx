import viteLogo from "/vite.svg";
import Button from "../components/Button/Button";
import useTelegramUser from "../hooks/useTelegramUser";
import { useNavigate } from "react-router";
import { useLanguage } from "../hooks/useLocalization";
import { LanguageString } from "../utils/types";
import { trpc } from "../trpc/trpc";


function Welcome() {
  const navigate = useNavigate();
  const { data, error, isLoading } = trpc.test.useQuery({hello : "world"});

  console.log(data, error, isLoading);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket");
    });
    socket.emit("newGame", {
      betAmount : 20,
      gameType : "BattleRoyale",
      userName : '@VJBass',
      matchType : "MatchMaking",
    });
  }, []);

  const user = useTelegramUser();

  const { l } = useLanguage();

  const { data, error, isLoading } = trpc.test.useQuery({ hello: " hi" });
  console.log("in welcome:", data, error, isLoading);

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <div style={{ display: "flex", gap: "0.25em", marginBottom: "2em" }}>
        <Button className="flex"><div style={{ fontSize: "1em" }}>Balance: <b>$250</b></div></Button>
        <Button className="flex">
          <div style={{ fontSize: "0.7em" }}>Selected mode</div>
          <div style={{ fontWeight: "bold" }}>Normal</div>
        </Button>
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>BattleBits</h1>
      <h4>{l(LanguageString.welcomeBack)}, <b style={{ color: "rgb(238, 188, 188)" }}>{user?.first_name ?? "Player"}</b>!</h4>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <Button type="big" colorfulBorder onClick={() => navigate("/vs/lobby")}><b>1v1</b></Button>
        <Button type="big"><b>Battle Royale</b></Button>
      </div>
      <Button onClick={() => navigate("/profile")}><div style={{ fontSize: "1em" }}>Profile</div></Button>
    </div>
  )
}

export default Welcome;