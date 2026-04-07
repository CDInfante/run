/** @author Harry Vasanth (harryvasanth.com) */
import axios from "axios";
import type { WeatherData } from "../types";

// Helper to stagger API requests to avoid burst rate-limits
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData | null> => {
  // 1. JITTER: Random delay between 0 and 1500ms to stagger simultaneous requests
  await delay(Math.random() * 1500);

  try {
    // 2. Try the primary service (Open-Meteo)
    return await fetchOpenMeteo(lat, lon);
  } catch (error) {
    console.warn(
      `[Weather] Open-Meteo failed for ${lat},${lon}. Trying backup service...`,
      error,
    );
    try {
      // 3. Fallback to free backup service (wttr.in)
      return await fetchBackupWeather(lat, lon);
    } catch (backupError) {
      console.error(
        "[Weather] Both primary and backup services failed.",
        backupError,
      );
      return null;
    }
  }
};

const fetchOpenMeteo = async (
  lat: number,
  lon: number,
): Promise<WeatherData> => {
  const weatherPromise = axios.get(`https://api.open-meteo.com/v1/forecast`, {
    timeout: 8000,
    params: {
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,relative_humidity_2m,apparent_temperature,uv_index,precipitation,visibility,cloud_cover",
      daily:
        "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
      timezone: "auto",
    },
  });

  const airQualityPromise = axios.get(
    `https://air-quality-api.open-meteo.com/v1/air-quality`,
    {
      timeout: 8000,
      params: {
        latitude: lat,
        longitude: lon,
        current:
          "pm10,pm2_5,european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,dust",
        timezone: "auto",
      },
    },
  );

  const [weatherResult, airResult] = await Promise.allSettled([
    weatherPromise,
    airQualityPromise,
  ]);

  // If the main weather API fails entirely, THROW so the fallback catches it
  if (weatherResult.status === "rejected") {
    throw new Error("Open-Meteo primary API failed or timed out");
  }

  const weatherRes = weatherResult.value;
  const airRes = airResult.status === "fulfilled" ? airResult.value : null;

  return {
    current: {
      temp: weatherRes.data.current.temperature_2m,
      windSpeed: weatherRes.data.current.wind_speed_10m,
      windGusts: weatherRes.data.current.wind_gusts_10m,
      windDirection: weatherRes.data.current.wind_direction_10m,
      weatherCode: weatherRes.data.current.weather_code,
      humidity: weatherRes.data.current.relative_humidity_2m,
      apparentTemp: weatherRes.data.current.apparent_temperature,
      uvIndex: weatherRes.data.current.uv_index,
      precipitation: weatherRes.data.current.precipitation,
      visibility: weatherRes.data.current.visibility,
      cloudCover: weatherRes.data.current.cloud_cover,
    },
    daily: {
      maxTemp: weatherRes.data.daily.temperature_2m_max[0],
      minTemp: weatherRes.data.daily.temperature_2m_min[0],
      sunrise: weatherRes.data.daily.sunrise[0],
      sunset: weatherRes.data.daily.sunset[0],
      uvIndexMax: weatherRes.data.daily.uv_index_max[0],
      precipProb: weatherRes.data.daily.precipitation_probability_max[0],
    },
    airQuality: {
      pm2_5: airRes?.data?.current?.pm2_5 ?? 0,
      pm10: airRes?.data?.current?.pm10 ?? 0,
      dust: airRes?.data?.current?.dust ?? 0,
      european_aqi: airRes?.data?.current?.european_aqi ?? 0,
      alder_pollen: airRes?.data?.current?.alder_pollen ?? 0,
      birch_pollen: airRes?.data?.current?.birch_pollen ?? 0,
      grass_pollen: airRes?.data?.current?.grass_pollen ?? 0,
      mugwort_pollen: airRes?.data?.current?.mugwort_pollen ?? 0,
      olive_pollen: airRes?.data?.current?.olive_pollen ?? 0,
      ragweed_pollen: airRes?.data?.current?.ragweed_pollen ?? 0,
    },
  };
};

const fetchBackupWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData> => {
  // wttr.in is a completely free backup API that doesn't require an API key
  const res = await axios.get(`https://wttr.in/${lat},${lon}?format=j1`, {
    timeout: 8000,
  });
  const data = res.data;
  const current = data.current_condition[0];
  const today = data.weather[0];

  return {
    current: {
      temp: Number(current.temp_C),
      windSpeed: Number(current.windspeedKmph),
      windDirection: Number(current.winddirDegree),
      windGusts: Number(current.windspeedKmph) * 1.5, // Estimated, as wttr often omits gusts
      weatherCode: 0, // Fallback uses generic clear icon to prevent crash
      humidity: Number(current.humidity),
      apparentTemp: Number(current.FeelsLikeC),
      uvIndex: Number(current.uvIndex),
      precipitation: Number(current.precipMM),
      visibility: Number(current.visibility) * 1000,
      cloudCover: Number(current.cloudcover),
    },
    daily: {
      maxTemp: Number(today.maxtempC),
      minTemp: Number(today.mintempC),
      // Approximate time map from their astronomy payload
      sunrise:
        new Date().toISOString().split("T")[0] +
        "T" +
        today.astronomy[0].sunrise,
      sunset:
        new Date().toISOString().split("T")[0] +
        "T" +
        today.astronomy[0].sunset,
      uvIndexMax: Number(today.uvIndex),
      precipProb: Number(today.hourly[0]?.chanceofrain ?? 0),
    },
    airQuality: {
      // Backup doesn't provide allergens/AQI, safe default to 0
      pm2_5: 0,
      pm10: 0,
      european_aqi: 0,
      dust: 0,
      alder_pollen: 0,
      birch_pollen: 0,
      grass_pollen: 0,
      mugwort_pollen: 0,
      olive_pollen: 0,
      ragweed_pollen: 0,
    },
  };
};
