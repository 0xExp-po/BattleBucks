import Button from "../../components/Button/Button";
import Logo from "../../components/Logo/Logo";
import LanguageBubble from "../../components/LanguageBubble/LanguageBubble";
import { useTelegram } from "../../utils/telegram";
import { useNavigate } from "react-router";
import { LanguageString, useLanguage } from "../../utils/localization";
import "./Welcome.scss";

function Welcome() {
  const navigate = useNavigate();

  const { initDataUnsafe } = useTelegram();

  const { l } = useLanguage();

  return (
    <div className="welcome flexCol flex" style={{ padding: "1em", overflow: "auto" }}>
      <div style={{ position: "absolute", right: "1em", top: "1.5em", zIndex: 1 }}>
        <LanguageBubble />
      </div>
      <div className="flexCol" style={{ marginTop: "4em"}}>
        <div style={{ display: "flex", position: "relative" }}>
          <Logo />
        </div>
        <h4>{l(LanguageString.welcomeBack)}, <b style={{ color: "rgb(229, 243, 255)" }}>{initDataUnsafe.user?.first_name ?? "Player"}</b>!</h4>
        <div className="flexCol" style={{ margin: "1.5em 0", gap: "1em" }}>
          <Button type="firstPlan" onClick={() => navigate("/br/games")}>⚔️ Battle Royale</Button>
          <Button type="big" comingSoonBanner onClick={() => navigate("/vs/lobby")}>1v1</Button>
        </div>
        <Button onClick={() => navigate("/profile")}><div style={{ fontSize: "1em" }}>👤 Profile</div></Button>

      </div>
    </div>
  )
}

export default Welcome;