/** @author Harry Vasanth (harryvasanth.com) */
import type { ShipStatus } from "../types";

export const fetchShipStatus = async (): Promise<ShipStatus> => {
  try {
    let response: Response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      response = await fetch(
        "https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/ships-funchal.json",
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("GitHub fetch failed");
    } catch {
      clearTimeout(timeoutId);
      response = await fetch("/ships-funchal.json");
    }

    const rawResponse = await response.json();
    const now = new Date();

    // Fallback support for older cached versions of the JSON
    const data = Array.isArray(rawResponse) ? rawResponse : rawResponse.ships;
    const scrapedAt = Array.isArray(rawResponse)
      ? null
      : rawResponse.meta?.scraped_at;

    const processedShips = data
      .map((s: any) => ({
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

    const sulShips = processedShips.filter((s: any) =>
      s.terminal.includes("Terminal Sul"),
    );
    const currentlyDockedSul = sulShips.filter(
      (s: { arrival: Date; departure: Date }) =>
        now >= s.arrival && now <= s.departure,
    );

    let nextAvailableDate: Date | null = null;
    if (currentlyDockedSul.length === 0) {
      nextAvailableDate = now;
    } else {
      let chainEnd = new Date(
        Math.max(
          ...currentlyDockedSul.map((s: { departure: Date }) =>
            s.departure.getTime(),
          ),
        ),
      );
      for (const ship of sulShips) {
        if (ship.arrival <= chainEnd && ship.departure > chainEnd)
          chainEnd = ship.departure;
      }
      nextAvailableDate = chainEnd;
    }

    return {
      isDocked: currentlyDockedSul.length > 0,
      count: currentlyDockedSul.length,
      nextAvailableDate,
      scrapedAt: scrapedAt || null, // <--- Return the timestamp
      ships: processedShips.map((s: any) => ({
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
      })),
    };
  } catch {
    return {
      isDocked: false,
      ships: [],
      count: 0,
      nextAvailableDate: null,
      scrapedAt: null,
    };
  }
};
