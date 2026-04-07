/** @author Harry Vasanth (harryvasanth.com) */
import type { Trail, TrailsData } from "../types";

export const fetchTrails = async (): Promise<Trail[]> => {
  try {
    let response: Response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Try GitHub raw first to bypass local PWA cache
    try {
      response = await fetch(
        "https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/trails-madeira.json",
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("GitHub fetch failed");
    } catch {
      clearTimeout(timeoutId);
      // Fallback to local (cached) file
      response = await fetch("/trails-madeira.json");
    }

    const data: TrailsData = await response.json();

    return data.trails.sort((a, b) => {
      if (a.island !== b.island) {
        return a.island === "Madeira" ? -1 : 1;
      }
      const numA = parseFloat(a.pr.replace(/[^\d.]/g, "")) || 0;
      const numB = parseFloat(b.pr.replace(/[^\d.]/g, "")) || 0;
      return numA - numB;
    });
  } catch (err) {
    console.error("Error loading trails:", err);
    return [];
  }
};
