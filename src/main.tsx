/** @author Harry Vasanth (harryvasanth.com) */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./contexts/I18nProvider";
import { DarkModeProvider } from "./contexts/DarkModeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DarkModeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </DarkModeProvider>
  </StrictMode>,
);
