/** @author Harry Vasanth (harryvasanth.com) */
import type { Amenity } from "../types";

interface AmenitiesData {
  meta: {
    scraped_at: string;
    total_amenities: number;
  };
  amenities: Amenity[];
}

export const fetchAmenities = async (): Promise<Amenity[]> => {
  try {
    let response: Response;

    // Try GitHub raw first to bypass local PWA cache
    try {
      response = await fetch(
        "https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/amenities.json",
      );
      if (!response.ok) throw new Error("GitHub fetch failed");
    } catch {
      // Fallback to local (cached) file if offline or blocked
      response = await fetch("/amenities.json");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch amenities");
    }

    const data: AmenitiesData = await response.json();
    return data.amenities;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return [];
  }
};
