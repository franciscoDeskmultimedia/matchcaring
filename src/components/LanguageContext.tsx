"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language } from "@/lib/types";
import { DICTIONARY } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof DICTIONARY["en"];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Check saved preference or browser language
    const saved = localStorage.getItem("preferred_lang") as Language | null;
    if (saved === "en" || saved === "es") {
      setLanguageState(saved);
    } else if (typeof navigator !== "undefined" && navigator.language?.startsWith("es")) {
      setLanguageState("es");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", lang);
    }
  };

  const t = DICTIONARY[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
