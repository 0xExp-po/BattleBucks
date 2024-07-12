import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import viteLogo from "/vite.svg";

function VersusLobby() {
  const navigate = useNavigate();

  return (
    <div className="flexCol flex" style={{ margin: "5em 1em" }}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h2>BattleBits</h2>
      <div className="flexRow" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" className="flex" onClick={() => navigate("/vs/buyin")}><b>Find a Match</b></Button>
        <Button type="big" className="flex"><b>Invite a Friend</b></Button>
      </div>
    </div>
  );
}

export default VersusLobby;