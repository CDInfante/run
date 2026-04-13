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
  try {
    let response: Response
    const controller = new AbortController()
    // 3-second timeout before falling back to local storage
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      response = await fetch(
        'https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/marine-data.json',
        { signal: controller.signal },
      )
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error('GitHub fetch failed')
    } catch {
      clearTimeout(timeoutId)
      response = await fetch('/marine-data.json')
      if (!response.ok) throw new Error('Local fetch failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch marine data:', error)
    // Throw error so React Query knows the fetch completely failed
    throw new Error('Unable to retrieve marine data')
  }
}
