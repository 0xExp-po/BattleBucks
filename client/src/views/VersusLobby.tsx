import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Logo from "../components/Logo/Logo";

function VersusLobby() {
  const navigate = useNavigate();

  return (
    <div className="flexCol flex" style={{ margin: "5em 1em" }}>
      <Logo />
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Button type="big" className="flex" onClick={() => navigate("/vs/buyin", { state: { matchMethod: "matchmaking" } })}>Find a Match</Button>
        </div>
        <div className="flexRow" style={{ gap: "1em" }}>
          <Button type="big" className="flex" onClick={() => navigate("/vs/buyin", { state: { matchMethod: "invite" } })}>Invite a friend</Button>
          <Button type="big" className="flex">Join Game</Button>
        </div>
      </div>
      <Button type="cancel" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}

export default VersusLobby;