import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import viteLogo from "/vite.svg";
import SocketContext from "../utils/socket";
import { useContext } from "react";
import Logo from "../components/Logo/Logo";

function VersusBuyin() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  // example implementation
  const startNewGake = () => {
    socket.emit("newGame" , {
      gameType : "BattleRoyale",
      userName : '@VJBass',
      matchType : "MatchMaking",
    })
    navigate("/vs/buyin")
  }

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <Logo />
      <h2>What's your bet?</h2>
      <div className="flexCol center" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" style={{ width: "60%"}} onClick={() => startNewGake()}><b>$1</b></Button>
        <Button type="big" style={{ width: "60%"}} onClick={() => navigate("/versus")}><b>$2</b></Button>
        <Button type="big" style={{ width: "60%"}} onClick={() => navigate("/versus")}><b>$5</b></Button>
      </div>
      <Button type="cancel" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default VersusBuyin;