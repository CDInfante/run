/** @author Harry Vasanth (harryvasanth.com) */
import { createContext } from "react";
import type { Language } from "./I18nTranslations";

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(
  undefined,
);
