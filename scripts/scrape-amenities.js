/** @author Harry Vasanth (harryvasanth.com) */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
// Mirrors if the main one is down:
// const OVERPASS_URL = "https://overpass.openstreetmap.fr/api/interpreter";
// const OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter";

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
    const response = await axios.get(OVERPASS_URL, {
      params: { data: query },
      timeout: 30000,
    })

    if (!response.data || !response.data.elements) {
      throw new Error('Invalid response from Overpass API')
    }

    const amenities = response.data.elements.map(el => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      type: el.tags.amenity === 'drinking_water' ? 'fountain' : 'toilet',
      name: el.tags.name || null,
    }))

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
    console.error('Scrape failed:', error.message)
    process.exit(1)
  }
}

scrapeAmenities()
