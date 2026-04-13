// run-cdinfante/src/services/marine.ts
/** @author Harry Vasanth (harryvasanth.com) */
import axios from 'axios'

export interface MarineLocationData {
  id: string
  name: string
  island: string
  lat: number
  lon: number
  ocean_temperature: number | null
  wave_height: number | null
  wave_period: number | null
  wave_direction: number | null
  wind_wave_height: number | null
  wind_wave_period: number | null
  wind_wave_direction: number | null
  swell_wave_height: number | null
  swell_wave_period: number | null
  swell_wave_direction: number | null
  ocean_current_velocity: number | null
  ocean_current_direction: number | null
}

export interface MarineResponse {
  meta: {
    scraped_at: string
    total_locations: number
  }
  locations: MarineLocationData[]
}

export const fetchMarineData = async (): Promise<MarineResponse> => {
  const response = await axios.get<MarineResponse>('/marine-data.json')
  return response.data
}
