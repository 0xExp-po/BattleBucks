import viteLogo from "/vite.svg";
import Button from "../components/Button";
import { useNavigate } from "react-router";

function Welcome() {
  const navigate = useNavigate();
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
      <h4>Welcome back, <b style={{ color: "rgb(238, 188, 188)" }}>Player</b>!</h4>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" onClick={() => navigate("/vs/lobby")}><b>1v1</b></Button>
        <Button type="big"><b>Battle Royale</b></Button>
      </div>
      <Button onClick={() => navigate("/matches")}><div style={{ fontSize: "1em" }}>Match history</div></Button>
    </div>
  )
};

export default Welcome;