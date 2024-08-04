import Button from "../components/Button/Button";
import useTelegramUser from "../hooks/useTelegramUser";
import Logo from "../components/Logo/Logo";
import LanguageBubble from "../LanguageBubble/LanguageBubble";
import { useNavigate } from "react-router";
import { useLanguage } from "../hooks/useLocalization";
import { LanguageString } from "../utils/types";


function Welcome() {
  const navigate = useNavigate();

  const user = useTelegramUser();

  const { l } = useLanguage();

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <div style={{ display: "flex", gap: "0.25em", marginBottom: "2em" }}>
        <Button className="flex"><div style={{ fontSize: "1em" }}>Balance: <b>$250</b></div></Button>
        <Button className="flex">
          <div style={{ fontSize: "0.7em" }}>Selected mode</div>
          <div style={{ fontWeight: "bold" }}>Normal</div>
        </Button>
      </div>
      <div style={{ display: "flex", position: "relative" }}>
        <div style={{ position: "absolute", right: 0, zIndex: 1 }}>
          <LanguageBubble />
        </div>
        <Logo />
      </div>
      <h4>{l(LanguageString.welcomeBack)}, <b style={{ color: "rgb(229, 243, 255)" }}>{user?.first_name ?? "Player"}</b>!</h4>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <Button type="big" colorfulBorder onClick={() => navigate("/vs/lobby")}>1v1</Button>
        <Button type="big" comingSoonBanner>Battle Royale</Button>
      </div>
      <Button onClick={() => navigate("/profile")}><div style={{ fontSize: "1em" }}>Profile</div></Button>
    </div>
  )
}

export default Welcome;