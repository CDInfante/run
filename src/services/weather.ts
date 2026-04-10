/** @author Harry Vasanth (harryvasanth.com) */
import axios from 'axios'
import type { WeatherData } from '../types'

// Helper to stagger API requests to avoid burst rate-limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData | null> => {
  // Stagger simultaneous requests
  await delay(Math.random() * 1500)

  try {
    return await fetchOpenMeteo(lat, lon)
  } catch (_error) {
    console.warn(
      `[Weather] Open-Meteo failed for ${lat},${lon}. Trying backup service...`,
    )
    try {
      return await fetchBackupWeather(lat, lon)
    } catch (backupError) {
      console.error(
        '[Weather] Both primary and backup services failed.',
        backupError,
      )
      return null
    }
  }
}

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
        'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,relative_humidity_2m,apparent_temperature,uv_index,precipitation,visibility,cloud_cover',
      daily:
        'temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
      timezone: 'auto',
    },
  })

  const airQualityPromise = axios.get(
    `https://air-quality-api.open-meteo.com/v1/air-quality`,
    {
      timeout: 8000,
      params: {
        latitude: lat,
        longitude: lon,
        current:
          'pm10,pm2_5,european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,dust',
        timezone: 'auto',
      },
    },
  )

  const [weatherResult, airResult] = await Promise.allSettled([
    weatherPromise,
    airQualityPromise,
  ])

  if (weatherResult.status === 'rejected') {
    throw new Error('Open-Meteo primary API failed or timed out')
  }

  const weatherRes = weatherResult.value
  const airRes = airResult.status === 'fulfilled' ? airResult.value : null

  return {
    isBackup: false,
    current: {
      temp: weatherRes.data.current.temperature_2m ?? null,
      windSpeed: weatherRes.data.current.wind_speed_10m ?? null,
      windGusts: weatherRes.data.current.wind_gusts_10m ?? null,
      windDirection: weatherRes.data.current.wind_direction_10m ?? null,
      weatherCode: weatherRes.data.current.weather_code ?? 0,
      humidity: weatherRes.data.current.relative_humidity_2m ?? null,
      apparentTemp: weatherRes.data.current.apparent_temperature ?? null,
      uvIndex: weatherRes.data.current.uv_index ?? null,
      precipitation: weatherRes.data.current.precipitation ?? null,
      visibility: weatherRes.data.current.visibility ?? null,
      cloudCover: weatherRes.data.current.cloud_cover ?? null,
    },
    daily: {
      maxTemp: weatherRes.data.daily.temperature_2m_max?.[0] ?? null,
      minTemp: weatherRes.data.daily.temperature_2m_min?.[0] ?? null,
      sunrise: weatherRes.data.daily.sunrise?.[0] ?? null,
      sunset: weatherRes.data.daily.sunset?.[0] ?? null,
      uvIndexMax: weatherRes.data.daily.uv_index_max?.[0] ?? null,
      precipProb:
        weatherRes.data.daily.precipitation_probability_max?.[0] ?? null,
    },
    airQuality: {
      pm2_5: airRes?.data?.current?.pm2_5 ?? null,
      pm10: airRes?.data?.current?.pm10 ?? null,
      dust: airRes?.data?.current?.dust ?? null,
      european_aqi: airRes?.data?.current?.european_aqi ?? null,
      alder_pollen: airRes?.data?.current?.alder_pollen ?? null,
      birch_pollen: airRes?.data?.current?.birch_pollen ?? null,
      grass_pollen: airRes?.data?.current?.grass_pollen ?? null,
      mugwort_pollen: airRes?.data?.current?.mugwort_pollen ?? null,
      olive_pollen: airRes?.data?.current?.olive_pollen ?? null,
      ragweed_pollen: airRes?.data?.current?.ragweed_pollen ?? null,
    },
  }
}

// Helper to convert "07:34 AM" to a valid ISO Date string for today
const parseWttrTime = (timeStr: string): string | null => {
  if (!timeStr) return null
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return null

  const [_, h, m, ampm] = match
  let hours = Number.parseInt(h, 10)
  if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0

  const date = new Date()
  date.setHours(hours, Number.parseInt(m, 10), 0, 0)
  return date.toISOString()
}

const fetchBackupWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherData> => {
  const res = await axios.get(`https://wttr.in/${lat},${lon}?format=j1`, {
    timeout: 8000,
  })
  const data = res.data
  const current = data.current_condition[0]
  const today = data.weather[0]

  // Try to rescue AQI/Pollen data from Open-Meteo's secondary AQI server
  let airRes = null
  try {
    const aqRes = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality`,
      {
        timeout: 4000,
        params: {
          latitude: lat,
          longitude: lon,
          current:
            'pm10,pm2_5,european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,dust',
          timezone: 'auto',
        },
      },
    )
    airRes = aqRes.data
  } catch (_e) {
    console.warn('Backup also failed to retrieve Air Quality data.')
  }

  return {
    isBackup: true,
    current: {
      temp: Number(current.temp_C) ?? null,
      windSpeed: Number(current.windspeedKmph) ?? null,
      windDirection: Number(current.winddirDegree) ?? null,
      windGusts: current.windspeedKmph
        ? Number(current.windspeedKmph) * 1.5
        : null,
      weatherCode: 0,
      humidity: Number(current.humidity) ?? null,
      apparentTemp: Number(current.FeelsLikeC) ?? null,
      uvIndex: Number(current.uvIndex) ?? null,
      precipitation: Number(current.precipMM) ?? null,
      visibility: current.visibility ? Number(current.visibility) * 1000 : null,
      cloudCover: Number(current.cloudcover) ?? null,
    },
    daily: {
      maxTemp: Number(today.maxtempC) ?? null,
      minTemp: Number(today.mintempC) ?? null,
      sunrise: parseWttrTime(today.astronomy[0]?.sunrise),
      sunset: parseWttrTime(today.astronomy[0]?.sunset),
      uvIndexMax: Number(today.uvIndex) ?? null,
      precipProb: Number(today.hourly[0]?.chanceofrain) ?? null,
    },
    airQuality: {
      pm2_5: airRes?.current?.pm2_5 ?? null,
      pm10: airRes?.current?.pm10 ?? null,
      dust: airRes?.current?.dust ?? null,
      european_aqi: airRes?.current?.european_aqi ?? null,
      alder_pollen: airRes?.current?.alder_pollen ?? null,
      birch_pollen: airRes?.current?.birch_pollen ?? null,
      grass_pollen: airRes?.current?.grass_pollen ?? null,
      mugwort_pollen: airRes?.current?.mugwort_pollen ?? null,
      olive_pollen: airRes?.current?.olive_pollen ?? null,
      ragweed_pollen: airRes?.current?.ragweed_pollen ?? null,
    },
  }
}
