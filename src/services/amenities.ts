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
    const response = await fetch("/amenities.json");
    if (!response.ok) {
      throw new Error("Failed to fetch amenities from static source");
    }
    const data: AmenitiesData = await response.json();
    return data.amenities;
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return [];
  }
};
