import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import viteLogo from "/vite.svg";

function VersusBuyin() {
  const navigate = useNavigate();

  return (
    <div className="flexCol flex" style={{ margin: "3em 1em" }}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h2>Whats's your bet?</h2>
      <div className="flexCol center" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" style={{ width: "60%"}} onClick={() => navigate("/versus")}><b>$1</b></Button>
        <Button type="big" style={{ width: "60%"}} onClick={() => navigate("/versus")}><b>$2</b></Button>
        <Button type="big" style={{ width: "60%"}} onClick={() => navigate("/versus")}><b>$5</b></Button>
      </div>
    </div>
  );
}

export default VersusBuyin;