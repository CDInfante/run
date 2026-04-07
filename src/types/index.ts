/** @author Harry Vasanth (harryvasanth.com) */
export interface WeatherData {
  isBackup?: boolean;
  current: {
    temp: number | null;
    windSpeed: number | null;
    windDirection: number | null;
    weatherCode: number;
    humidity: number | null;
    apparentTemp: number | null;
    uvIndex: number | null;
    precipitation: number | null;
    visibility: number | null;
    cloudCover: number | null;
    windGusts: number | null;
  };
  daily: {
    maxTemp: number | null;
    minTemp: number | null;
    sunrise: string | null;
    sunset: string | null;
    uvIndexMax: number | null;
    precipProb: number | null;
  };
  airQuality: {
    pm2_5: number | null;
    pm10: number | null;
    european_aqi: number | null;
    alder_pollen: number | null;
    birch_pollen: number | null;
    grass_pollen: number | null;
    mugwort_pollen: number | null;
    olive_pollen: number | null;
    ragweed_pollen: number | null;
    dust: number | null;
  };
}

export interface Amenity {
  id: number;
  lat: number;
  lon: number;
  type: "fountain" | "toilet";
  name?: string;
}

export interface WeatherWarning {
  idAreaAviso: string;
  description: string;
  instructions: string;
  awarenessLevelID: "green" | "yellow" | "orange" | "red";
  awarenessTypeName: string;
  startTime: string;
  endTime: string;
}

export interface Ship {
  name: string;
  terminal: string;
  arrival: string;
  arrivalDate: Date;
  departure: string;
  departureDate: Date;
  isDockedNow: boolean;
}

export interface ShipStatus {
  isDocked: boolean;
  ships: Ship[];
  nextAvailableDate: Date | null;
  count: number;
}

export interface Location {
  name: string;
  type: string;
  municipality: string;
  latitude: number;
  longitude: number;
  location: string;
}

export interface Trail {
  id: string;
  pr: string;
  island: string;
  distance: string;
  description: string;
  status:
    | "Aberto"
    | "Encerrado"
    | "Parcialmente transitável"
    | "Parcialmente aberto";
  additional_status: string;
  entity_responsible: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  last_checked: string;
}

export interface TrailsData {
  meta: {
    scraped_at: string;
    site_last_updated: string;
    total_trails: number;
  };
  trails: Trail[];
}
