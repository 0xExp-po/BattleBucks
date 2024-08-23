import { createContext, useContext, useState } from "react";

export enum LanguageString {
  welcomeBack = "welcomeBack",
};

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

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(LANGUAGE_ENGLISH);

  const getString = (s: LanguageString, ...s2: string[]) => {
    let str = language[s] as string || LANGUAGE_ENGLISH[s];
    if (!str) return "?";
    for (let i = 0; i < s2.length; i++) {
      str.replace("$" + i, s2[i]);
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ l: getString, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
