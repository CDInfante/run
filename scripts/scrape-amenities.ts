/** @author Harry Vasanth (harryvasanth.com) */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import type { Amenity } from '../src/types/index'

// Apply retry logic with exponential backoff
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: error =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status === 429, // Retry on rate limit (common with Overpass)
})

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

interface OverpassElement {
  id: number
  lat: number
  lon: number
  tags: {
    amenity: string
    name?: string
  }
}

interface OverpassResponse {
  elements: OverpassElement[]
}

async function scrapeAmenities() {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"~"drinking_water|toilets"](32.35,-17.3,33.15,-16.2);
    );
    out body;
  `

  try {
    console.log('Fetching amenities from Overpass API...')
    const response = await axios.get<OverpassResponse>(OVERPASS_URL, {
      params: { data: query },
      timeout: 30000,
    })

    if (!response.data || !response.data.elements) {
      throw new Error('Invalid response from Overpass API')
    }

    const amenities: Amenity[] = response.data.elements.map(el => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      type: el.tags.amenity === 'drinking_water' ? 'fountain' : 'toilet',
      name: el.tags.name || undefined, // undefined drops it from JSON if null, saving space
    }))

    // Defensive Check: Overpass should return hundreds of amenities for Madeira.
    // If it drops to an absurdly low number, the query failed silently or the API is glitching.
    if (amenities.length < 50) {
      console.error(
        `Scraped only ${amenities.length} amenities, which is abnormally low. Aborting to protect existing data.`,
      )
      process.exit(1)
    }

    const outputPath = path.join(process.cwd(), 'public', 'amenities.json')
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          meta: {
            scraped_at: new Date().toISOString(),
            total_amenities: amenities.length,
          },
          amenities,
        },
        null,
        2,
      ),
    )

    console.log(`✅ Scraped ${amenities.length} amenities.`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Scrape failed: ${error.message}`)
    } else {
      console.error('Scrape failed:', error)
    }
    process.exit(1)
  }
}

scrapeAmenities()
