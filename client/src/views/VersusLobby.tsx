import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Logo from "../components/Logo/Logo";

function VersusLobby() {
  const navigate = useNavigate();

  return (
    <div className="flexCol flex" style={{ margin: "5em 1em" }}>
      <Logo />
      <div className="flexRow" style={{ margin: "2em 0", gap: "1em"}}>
        <Button type="big" className="flex" onClick={() => navigate("/vs/buyin")}>Find a Match</Button>
        <Button type="big" className="flex">Invite a Friend</Button>
      </div>
      <Button type="cancel" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default VersusLobby;