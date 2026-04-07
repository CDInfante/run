/** @author Harry Vasanth (harryvasanth.com) */
import axios from "axios";
import type { WeatherWarning } from "../types";

export const IPMA_REGIONS = {
  NORTH_COAST: "MCN",
  MOUNTAIN_REGIONS: "MRM",
  SOUTH_COAST: "MCS",
  PORTO_SANTO: "MPS",
};

export const REGION_COORDS: Record<string, [number, number]> = {
  MCN: [32.8, -16.9],
  MRM: [32.75, -17.0],
  MCS: [32.65, -16.9],
  MPS: [33.06, -16.33],
};

export const REGION_URLS: Record<string, string> = {
  MCN: "https://www.ipma.pt/en/otempo/prev-sam/?p=MCN",
  MRM: "https://www.ipma.pt/en/otempo/prev-sam/?p=MRM",
  MCS: "https://www.ipma.pt/en/otempo/prev-sam/?p=MCS",
  MPS: "https://www.ipma.pt/en/otempo/prev-sam/?p=MPS",
};

export const AWARENESS_TYPES = [
  "Agitação Marítima",
  "Nevoeiro",
  "Tempo Frio",
  "Tempo Quente",
  "Precipitação",
  "Neve",
  "Trovoada",
  "Vento",
];

export const fetchWeatherWarnings = async (): Promise<WeatherWarning[]> => {
  try {
    const response = await axios.get(
      "https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json",
      { timeout: 8000 },
    );

    const madeiraIds = Object.values(IPMA_REGIONS);
    const allWarnings = response.data.filter((w: WeatherWarning) =>
      madeiraIds.includes(w.idAreaAviso),
    );

    const result: WeatherWarning[] = [];

    // For each region, ensure we have an entry for each awareness type
    madeiraIds.forEach((regionId) => {
      AWARENESS_TYPES.forEach((type) => {
        const activeWarning = allWarnings.find(
          (w: WeatherWarning) =>
            w.idAreaAviso === regionId &&
            w.awarenessTypeName === type &&
            w.awarenessLevelID !== "green",
        );

        if (activeWarning) {
          result.push(activeWarning);
        } else {
          result.push({
            idAreaAviso: regionId,
            awarenessTypeName: type,
            awarenessLevelID: "green",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            description: "No active warnings for this category.",
            instructions: "Safe to proceed.",
          });
        }
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching IPMA warnings:", error);
    // THROW the error instead of returning [] so React Query knows it failed
    throw new Error("Failed to fetch IPMA warnings");
  }
};
