/** @author Harry Vasanth (harryvasanth.com) */
import React, { useState, useEffect } from "react";
import type { Language } from "./I18nTranslations";
import { translations } from "./I18nTranslations";
import { I18nContext } from "./I18nContext";

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "pt-PT";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultValue?: string) => {
    return translations[language][key] || defaultValue || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
