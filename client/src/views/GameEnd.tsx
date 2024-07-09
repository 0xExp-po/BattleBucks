
import { useNavigate } from "react-router";
import Button from "../components/Button";
import viteLogo from "/vite.svg";

function GameEnd() {
  const navigate = useNavigate();

  return (
    <div className="flexCol flex" style={{ margin: "3em 1em" }}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h2>You won!</h2>
      <h3>+$5</h3>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" className="flex"><b>Rematch</b></Button>
        <Button type="big" className="flex"><b>New Match</b></Button>
        <Button type="big" className="flex" onClick={() => navigate("/")}><b>Exit</b></Button>
      </div>
    </div>
  );
}

export default GameEnd;