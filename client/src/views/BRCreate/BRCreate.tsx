import { useState } from "react";
import Chooser from "../../components/Chooser/Chooser";
import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import { useNavigate } from "react-router";

function BRCreate() {
  const [buyin, setBuyin] = useState<number>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const navigate = useNavigate();

  const createGame = () => {
    navigate("/br/lobby");
  };

  return (
    <div className="flexCol flex" style={{ margin: "1em", gap: "1em" }}>
      <Logo />
      <h2>Create Game</h2>
      <Chooser label="Buyin:" options={[undefined, 1, 2, 5]} onChange={e => setBuyin(e as number | undefined)} />
      <Chooser label="Max Players:" options={[undefined, 8, 16, 32, 64]} onChange={e => setMaxPlayers(e as number | undefined)} />
      <Button onClick={createGame}>Create</Button>
    </div>
  );
}

export default BRCreate;
