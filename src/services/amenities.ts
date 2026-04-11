/** @author Harry Vasanth (harryvasanth.com) */
import type { Amenity } from '../types'

export const fetchAmenities = async (): Promise<Amenity[]> => {
  try {
    let response: Response
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      response = await fetch(
        'https://raw.githubusercontent.com/CDInfante/run/refs/heads/main/public/amenities.json',
        { signal: controller.signal },
      )
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error('GitHub fetch failed')
    } catch {
      clearTimeout(timeoutId)
      response = await fetch('/amenities.json')
      if (!response.ok) throw new Error('Local fetch failed')
    }

    const data = await response.json()

    // Safely return the array, or an empty array if data structure is missing
    return Array.isArray(data.amenities) ? data.amenities : []
  } catch (error) {
    console.error('Failed to fetch amenities:', error)
    throw new Error('Unable to retrieve amenities data')
  }
}
