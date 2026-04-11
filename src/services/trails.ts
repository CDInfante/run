/** @author Harry Vasanth (harryvasanth.com) */
import type { Trail } from '../types'

export interface TrailsResponse {
  meta: {
    scraped_at: string
    site_last_updated: string
    total_trails: number
  }
  trails: Trail[]
}

export const fetchTrails = async (): Promise<TrailsResponse> => {
  try {
    let response: Response
    const controller = new AbortController()
    // 3-second timeout before falling back to local storage
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      response = await fetch(
        'https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/trails-madeira.json',
        { signal: controller.signal },
      )
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error('GitHub fetch failed')
    } catch {
      clearTimeout(timeoutId)
      response = await fetch('/trails-madeira.json')
      if (!response.ok) throw new Error('Local fetch failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch trails:', error)
    // Throw error so React Query knows the fetch completely failed
    throw new Error('Unable to retrieve trails data')
  }
}
