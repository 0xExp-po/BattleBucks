import Eng from "../assets/eng.avif";
import Rus from "../assets/rus.avif";
import { LANUGAGE_ENGLISH, LANUGAGE_RUSSIAN, useLanguage } from "../hooks/useLocalization";
import "./LanguageBubble.scss";

function LanguageBubble() {
  const { language, setLanguage } = useLanguage();

  return (
    <button className="languageBubble" onClick={() => setLanguage(language === LANUGAGE_ENGLISH ? LANUGAGE_RUSSIAN : LANUGAGE_ENGLISH)}>
      <img src={language === LANUGAGE_ENGLISH ? Eng : Rus} alt="language bubble" />
    </button>
  );
}

export default LanguageBubble;
