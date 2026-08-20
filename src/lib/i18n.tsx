import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DICT, type Lang, type TKey } from "./i18n-dict";

export type { Lang, TKey } from "./i18n-dict";

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}>({ lang: "id", setLang: () => {}, t: (k) => DICT[k].id });

let currentLang: Lang = "id";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    const stored = window.localStorage.getItem("scoffey-lang");
    if (stored === "id" || stored === "en") {
      currentLang = stored;
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    currentLang = next;
    setLangState(next);
    try {
      window.localStorage.setItem("scoffey-lang", next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(
    () => ({ lang, setLang, t: (key: TKey) => DICT[key][lang] }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useI18n = () => useContext(LangContext);
