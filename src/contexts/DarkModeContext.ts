/** @author Harry Vasanth (harryvasanth.com) */
import { createContext } from "react";

export interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
);
