/** @author Harry Vasanth (harryvasanth.com) */
import type { ShipStatus } from "../types";

interface RawShipData {
  ship: string;
  port_of_call: string;
  arrival: string;
  departure: string;
}

export const fetchShipStatus = async (): Promise<ShipStatus> => {
  try {
    // try github raw first, fallback to local if it fails (e.g., due to CORS or network issues)
    let response: Response;
    try {
      response = await fetch(
        "https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/ships-funchal.json",
      );
      if (!response.ok) throw new Error("GitHub fetch failed");
    } catch {
      response = await fetch("/ships-funchal.json");
    }

    const data: RawShipData[] = await response.json();
    const now = new Date();

    const processedShips = data
      .map((s: RawShipData) => ({
        name: s.ship,
        terminal: s.port_of_call,
        arrival: new Date(s.arrival),
        departure: new Date(s.departure),
      }))
      .filter((s: { departure: Date }) => s.departure > now)
      .sort(
        (a: { arrival: Date }, b: { arrival: Date }) =>
          a.arrival.getTime() - b.arrival.getTime(),
      );

    const currentlyDocked = processedShips.filter(
      (s: { arrival: Date; departure: Date }) =>
        now >= s.arrival && now <= s.departure,
    );

    let nextAvailableDate: Date | null = null;

    if (currentlyDocked.length === 0) {
      nextAvailableDate = now;
    } else {
      let chainEnd = new Date(
        Math.max(
          ...currentlyDocked.map((s: { departure: Date }) =>
            s.departure.getTime(),
          ),
        ),
      );

      for (const ship of processedShips) {
        if (ship.arrival <= chainEnd && ship.departure > chainEnd) {
          chainEnd = ship.departure;
        }
      }
      nextAvailableDate = chainEnd;
    }

    return {
      isDocked: currentlyDocked.length > 0,
      count: currentlyDocked.length,
      nextAvailableDate,
      ships: processedShips.map(
        (s: {
          name: string;
          terminal: string;
          arrival: Date;
          departure: Date;
        }) => ({
          name: s.name,
          terminal: s.terminal,
          arrivalDate: s.arrival,
          departureDate: s.departure,
          arrival: s.arrival.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          departure: s.departure.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isDockedNow: now >= s.arrival && now <= s.departure,
        }),
      ),
    };
  } catch {
    return {
      isDocked: false,
      ships: [],
      count: 0,
      nextAvailableDate: null,
    };
  }
};
