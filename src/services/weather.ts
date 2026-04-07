/** @author Harry Vasanth (harryvasanth.com) */
import axios from "axios";
import type { WeatherData } from "../types";

export const fetchWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData | null> => {
  try {
    const weatherPromise = axios.get(`https://api.open-meteo.com/v1/forecast`, {
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
        params: {
          latitude: lat,
          longitude: lon,
          current:
            "pm10,pm2_5,european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,dust",
          timezone: "auto",
        },
      },
    );

    // Use allSettled so if Air Quality fails, we still get the main Weather data
    const [weatherResult, airResult] = await Promise.allSettled([
      weatherPromise,
      airQualityPromise,
    ]);

    // If the main weather API fails entirely, return null to trigger the Error UI
    if (weatherResult.status === "rejected") {
      console.warn("Weather API failed", weatherResult.reason);
      return null;
    }

    const weatherRes = weatherResult.value;
    const airRes = airResult.status === "fulfilled" ? airResult.value : null;

    if (airResult.status === "rejected") {
      console.warn(
        "Air Quality API failed. Defaulting to 0s.",
        airResult.reason,
      );
    }

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
        // Fallback to 0 if the airQualityPromise was rejected
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
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};
