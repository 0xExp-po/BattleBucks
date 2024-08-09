import Eng from "../../assets/eng.avif";
import Rus from "../../assets/rus.avif";
import { LANGUAGE_ENGLISH, LANGUAGE_RUSSIAN, useLanguage } from "../../hooks/useLocalization";
import "./LanguageBubble.scss";

function LanguageBubble() {
  const { language, setLanguage } = useLanguage();

  return (
    <button className="languageBubble" onClick={() => setLanguage(language.NAME === LANGUAGE_ENGLISH.NAME ? LANGUAGE_RUSSIAN : LANGUAGE_ENGLISH)}>
      <img src={language.NAME === LANGUAGE_ENGLISH.NAME ? Eng : Rus} alt="language bubble" />
    </button>
  );
}

export default LanguageBubble;
