/** @author Harry Vasanth (harryvasanth.com) */
export interface WeatherData {
  current: {
    temp: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    humidity: number;
    apparentTemp: number;
    uvIndex: number;
    precipitation: number;
    visibility: number;
    cloudCover: number;
    windGusts: number; // Added this
  };
  daily: {
    maxTemp: number;
    minTemp: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
    precipProb: number; // Added this
  };
  airQuality: {
    pm2_5: number;
    pm10: number;
    european_aqi: number;
    alder_pollen: number;
    birch_pollen: number;
    grass_pollen: number;
    mugwort_pollen: number;
    olive_pollen: number;
    ragweed_pollen: number;
    dust: number; // Added this
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
  arrival: string; // Time string
  arrivalDate: Date;
  departure: string; // Time string
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
