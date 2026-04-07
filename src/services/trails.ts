/** @author Harry Vasanth (harryvasanth.com) */
import type { TrailsData } from "../types";

export const fetchTrails = async (): Promise<TrailsData> => {
  try {
    let response: Response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      response = await fetch(
        "https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/trails-madeira.json",
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("GitHub fetch failed");
    } catch {
      clearTimeout(timeoutId);
      response = await fetch("/trails-madeira.json");
    }

    const data: TrailsData = await response.json();

    // Sort trails inside the object
    data.trails = data.trails.sort((a, b) => {
      if (a.island !== b.island) {
        return a.island === "Madeira" ? -1 : 1;
      }
      const numA = parseFloat(a.pr.replace(/[^\d.]/g, "")) || 0;
      const numB = parseFloat(b.pr.replace(/[^\d.]/g, "")) || 0;
      return numA - numB;
    });

    return data;
  } catch (err) {
    console.error("Error loading trails:", err);
    // Fallback if network totally fails
    return {
      meta: {
        scraped_at: new Date().toISOString(),
        site_last_updated: "",
        total_trails: 0,
      },
      trails: [],
    };
  }
};
