/** @author Harry Vasanth (harryvasanth.com) */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./contexts/I18nProvider";
import { DarkModeProvider } from "./contexts/DarkModeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 mins
      retry: 2, // Auto-retry failed requests twice
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
