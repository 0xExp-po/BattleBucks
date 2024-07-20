import { createContext, useContext } from "react";
import { Language, LanguageString } from "../utils/types";

export const LANGUAGE_ENGLISH: Language = {
  NAME: "eng",
  welcomeBack: "Welcome back",
};

export const LANGUAGE_RUSSIAN: Language = {
  NAME: "rus",
  welcomeBack: "Добро пожаловать",
};

export const LanguageContext = createContext<{
  l: (s: LanguageString, ...s2: string[]) => string,
  language: Language,
  setLanguage: React.Dispatch<React.SetStateAction<Language>>
}>({
  l: (s) => s,
  language: LANGUAGE_ENGLISH,
  setLanguage: (l) => l,
});

export function useLanguage() {
  return useContext(LanguageContext);
}
