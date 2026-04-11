/** @author Harry Vasanth (harryvasanth.com) */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import * as cheerio from 'cheerio'
import type { Trail } from '../src/types/index'

// Apply retry logic with exponential backoff
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: error =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status === 429,
})

// Coordinates for the trailhead (starting point) of all Recommended Pedestrian Routes (PR)
const TRAIL_COORDS: Record<string, { lat: number; lon: number }> = {
  // Madeira Island
  1: { lat: 32.7355, lon: -16.9281 },
  1.1: { lat: 32.7639, lon: -16.9039 },
  1.2: { lat: 32.7638, lon: -16.9201 },
  1.3: { lat: 32.7535, lon: -17.0211 },
  2: { lat: 32.7214, lon: -16.985 },
  3: { lat: 32.735, lon: -16.928 },
  3.1: { lat: 32.715, lon: -16.915 },
  4: { lat: 32.71, lon: -16.94 },
  5: { lat: 32.7445, lon: -16.8261 },
  6: { lat: 32.7617, lon: -17.1344 },
  6.1: { lat: 32.7617, lon: -17.1344 },
  6.2: { lat: 32.7547, lon: -17.1339 },
  6.3: { lat: 32.7547, lon: -17.1339 },
  6.4: { lat: 32.7551, lon: -17.1331 },
  6.5: { lat: 32.7541, lon: -17.1154 },
  6.6: { lat: 32.7511, lon: -17.1147 },
  6.7: { lat: 32.7511, lon: -17.1147 },
  6.8: { lat: 32.7602, lon: -17.1008 },
  7: { lat: 32.8444, lon: -17.1936 },
  8: { lat: 32.7431, lon: -16.7011 },
  9: { lat: 32.7836, lon: -16.9055 },
  9.1: { lat: 32.7836, lon: -16.9055 },
  10: { lat: 32.7358, lon: -16.8858 },
  11: { lat: 32.7358, lon: -16.8858 },
  12: { lat: 32.7155, lon: -17.0135 },
  13: { lat: 32.7511, lon: -17.1147 },
  13.1: { lat: 32.7511, lon: -17.1147 },
  14: { lat: 32.8083, lon: -17.1417 },
  15: { lat: 32.8242, lon: -17.1517 },
  16: { lat: 32.7824, lon: -17.0366 },
  17: { lat: 32.7536, lon: -17.0212 },
  18: { lat: 32.8094, lon: -16.9158 },
  19: { lat: 32.7575, lon: -17.2119 },
  20: { lat: 32.7572, lon: -17.2105 },
  21: { lat: 32.7536, lon: -17.0211 },
  22: { lat: 32.7445, lon: -17.0208 },
  23: { lat: 32.6517, lon: -16.8365 },
  27: { lat: 32.7544, lon: -17.0519 },
  28: { lat: 32.7617, lon: -17.1344 },
  // Porto Santo Island
  '1ps': { lat: 33.0833, lon: -16.2994 },
  '2ps': { lat: 33.0722, lon: -16.3294 },
  '3ps': { lat: 33.0722, lon: -16.3294 },
}

async function scrapeTrails() {
  const url =
    'https://ifcn.madeira.gov.pt/pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html'

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000,
    })

    const $ = cheerio.load(response.data)
    const trails: Trail[] = []

    $('table#data-table').each((tableIdx, table) => {
      // Determine island based on context (Madeira is first table, Porto Santo is second)
      const island = tableIdx === 0 ? 'Madeira' : 'Porto Santo'

      $(table)
        .find('tbody tr')
        .each((_, row) => {
          const cells = $(row).find('td')

          if (cells.length >= 6) {
            const pr = $(cells[1]).text().trim()
            const name = $(cells[2]).text().trim()
            const distance = $(cells[3]).text().trim()
            const description = $(cells[4])
              .find('p')
              .map((_index, el) => $(el).text().trim())
              .get()
              .join('\n')

            const statusCell = $(cells[5])
            const statusText =
              statusCell.find('strong').first().text().trim() ||
              statusCell.text().split('\n')[0].trim()
            const additionalStatus = statusCell.find('p').last().text().trim()
            const entity = $(cells[6]).text().trim()

            if (pr && name && pr !== 'PR') {
              const lookupKey = island === 'Porto Santo' ? `${pr}ps` : pr

              const coords = TRAIL_COORDS[lookupKey] || {
                lat: 0,
                lon: 0,
              }

              // Coerce to our strict string literal types
              let normalizedStatus: Trail['status'] = 'Encerrado'
              if (statusText.toLowerCase().includes('aberto')) {
                normalizedStatus = 'Aberto'
              } else if (
                statusText.toLowerCase().includes('parcialmente transitável')
              ) {
                normalizedStatus = 'Parcialmente transitável'
              } else if (
                statusText.toLowerCase().includes('parcialmente aberto')
              ) {
                normalizedStatus = 'Parcialmente aberto'
              }

              trails.push({
                id: name,
                pr: pr,
                island: island,
                distance: distance,
                description: description,
                status: normalizedStatus,
                additional_status:
                  additionalStatus !== statusText ? additionalStatus : '',
                entity_responsible: entity,
                coordinates: coords,
                last_checked: new Date().toISOString(),
              })
            }
          }
        })
    })

    // Defensive Check: Prevent overwriting JSON if IFCN changes website table format
    if (trails.length === 0) {
      console.error(
        'Failed to scrape any trails. IFCN site layout might have changed.',
      )
      process.exit(1)
    }

    const outputPath = path.join(process.cwd(), 'public', 'trails-madeira.json')
    const updatedOnSite = $('.modified time')
      .text()
      .replace('Atualizado em', '')
      .trim()

    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          meta: {
            scraped_at: new Date().toISOString(),
            site_last_updated: updatedOnSite || 'Unknown',
            total_trails: trails.length,
          },
          trails,
        },
        null,
        2,
      ),
    )

    console.log(
      `✅ Scraped ${trails.length} trails with GPS coordinates for OpenStreetMap.`,
    )
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Scrape failed: ${error.message}`)
    } else {
      console.error('Scrape failed:', error)
    }
    process.exit(1)
  }
}

scrapeTrails()
