// run-cdinfante/scripts/scrape-marine.ts
/** @author Harry Vasanth (harryvasanth.com) */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
})

// Note: Coordinates have been deliberately pushed ~300-500m offshore
// to ensure they land strictly in the water for map plotting and marine APIs.
const LOCATIONS = [
  // --- MADEIRA: SOUTH COAST (Funchal & Surroundings) ---
  {
    id: 'funchal_marina',
    name: 'Funchal Marina / Cais',
    island: 'Madeira',
    lat: 32.644,
    lon: -16.908,
  },
  {
    id: 'funchal_old_town',
    name: 'Barreirinha / São Tiago',
    island: 'Madeira',
    lat: 32.644,
    lon: -16.897,
  },
  {
    id: 'lido_complex',
    name: 'Lido / Ponta Gorda',
    island: 'Madeira',
    lat: 32.634,
    lon: -16.94,
  },
  {
    id: 'praia_formosa',
    name: 'Praia Formosa',
    island: 'Madeira',
    lat: 32.637,
    lon: -16.955,
  },
  {
    id: 'camara_lobos',
    name: 'Câmara de Lobos Bay',
    island: 'Madeira',
    lat: 32.644,
    lon: -17.001,
  },

  // --- MADEIRA: SOUTH-WEST & WEST COAST ---
  {
    id: 'cabo_girao_fajas',
    name: 'Fajã dos Padres / Cabo Girão',
    island: 'Madeira',
    lat: 32.65,
    lon: -17.02,
  },
  {
    id: 'ribeira_brava',
    name: 'Ribeira Brava',
    island: 'Madeira',
    lat: 32.668,
    lon: -17.065,
  },
  {
    id: 'ponta_do_sol',
    name: 'Ponta do Sol',
    island: 'Madeira',
    lat: 32.677,
    lon: -17.103,
  },
  {
    id: 'madalena_do_mar',
    name: 'Madalena do Mar',
    island: 'Madeira',
    lat: 32.699,
    lon: -17.136,
  },
  {
    id: 'calheta',
    name: 'Calheta',
    island: 'Madeira',
    lat: 32.715,
    lon: -17.178,
  },
  {
    id: 'jardim_do_mar',
    name: 'Jardim do Mar',
    island: 'Madeira',
    lat: 32.735,
    lon: -17.213,
  },
  {
    id: 'paul_do_mar',
    name: 'Paul do Mar',
    island: 'Madeira',
    lat: 32.751,
    lon: -17.237,
  },

  // --- MADEIRA: EAST & SOUTH-EAST COAST ---
  {
    id: 'garajau',
    name: 'Garajau Marine Reserve',
    island: 'Madeira',
    lat: 32.635,
    lon: -16.851,
  },
  {
    id: 'reis_magos',
    name: 'Reis Magos',
    island: 'Madeira',
    lat: 32.643,
    lon: -16.821,
  },
  {
    id: 'santa_cruz',
    name: 'Santa Cruz / Palmeiras',
    island: 'Madeira',
    lat: 32.686,
    lon: -16.788,
  },
  {
    id: 'machico_bay',
    name: 'Machico Bay',
    island: 'Madeira',
    lat: 32.715,
    lon: -16.759,
  },
  {
    id: 'canical',
    name: 'Caniçal / Ribeira de Natal',
    island: 'Madeira',
    lat: 32.732,
    lon: -16.738,
  },
  {
    id: 'ponta_sao_lourenco',
    name: "Baía d'Abra / Prainha",
    island: 'Madeira',
    lat: 32.741,
    lon: -16.698,
  },

  // --- MADEIRA: NORTH COAST ---
  {
    id: 'porto_cruz',
    name: 'Porto da Cruz',
    island: 'Madeira',
    lat: 32.776,
    lon: -16.826,
  },
  { id: 'faial', name: 'Faial', island: 'Madeira', lat: 32.796, lon: -16.85 },
  {
    id: 'sao_jorge',
    name: 'São Jorge',
    island: 'Madeira',
    lat: 32.835,
    lon: -16.903,
  },
  {
    id: 'ponta_delgada',
    name: 'Ponta Delgada',
    island: 'Madeira',
    lat: 32.83,
    lon: -16.986,
  },
  {
    id: 'sao_vicente',
    name: 'São Vicente',
    island: 'Madeira',
    lat: 32.809,
    lon: -17.042,
  },
  {
    id: 'seixal',
    name: 'Seixal Bay',
    island: 'Madeira',
    lat: 32.827,
    lon: -17.113,
  },
  {
    id: 'porto_moniz',
    name: 'Porto Moniz',
    island: 'Madeira',
    lat: 32.871,
    lon: -17.168,
  },

  // --- PORTO SANTO ---
  {
    id: 'vila_baleira',
    name: 'Vila Baleira (Fontinha)',
    island: 'Porto Santo',
    lat: 33.054,
    lon: -16.335,
  },
  {
    id: 'ribeiro_salgado',
    name: 'Ribeiro Salgado',
    island: 'Porto Santo',
    lat: 33.042,
    lon: -16.348,
  },
  {
    id: 'calheta_ps',
    name: 'Calheta / Ponta',
    island: 'Porto Santo',
    lat: 33.01,
    lon: -16.386,
  },
  {
    id: 'zimbralinho',
    name: 'Zimbralinho',
    island: 'Porto Santo',
    lat: 33.03,
    lon: -16.39,
  },
  {
    id: 'salemas',
    name: 'Porto das Salemas',
    island: 'Porto Santo',
    lat: 33.087,
    lon: -16.393,
  },

  // --- ADDITIONAL OFFSHORE MARINE SPOTS ---
  {
    id: 'ilhas_desertas',
    name: 'Ilhas Desertas (Anchorage)',
    island: 'Desertas',
    lat: 32.518,
    lon: -16.51,
  },
]

// Helper to chunk arrays to prevent URL too long errors
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function scrapeMarine() {
  console.log(`Fetching marine data for ${LOCATIONS.length} locations...`)
  const marineData = []
  const currentHour = new Date().getHours()

  try {
    const chunks = chunkArray(LOCATIONS, 15)

    for (const chunk of chunks) {
      const lats = chunk.map(l => l.lat).join(',')
      const lons = chunk.map(l => l.lon).join(',')

      // Added ocean_current_velocity and ocean_current_direction
      const variables =
        'wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction'
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&hourly=${variables}&timezone=Europe%2FLisbon`

      const res = await axios.get(url, { timeout: 30000 })

      const responses = Array.isArray(res.data) ? res.data : [res.data]

      for (let i = 0; i < chunk.length; i++) {
        const loc = chunk[i]
        const data = responses[i]

        marineData.push({
          id: loc.id,
          name: loc.name,
          island: loc.island,
          lat: loc.lat,
          lon: loc.lon,
          ocean_temperature:
            data?.hourly?.sea_surface_temperature?.[currentHour] || null,
          wave_height: data?.hourly?.wave_height?.[currentHour] || null,
          wave_period: data?.hourly?.wave_period?.[currentHour] || null,
          wave_direction: data?.hourly?.wave_direction?.[currentHour] || null,
          wind_wave_height:
            data?.hourly?.wind_wave_height?.[currentHour] || null,
          wind_wave_period:
            data?.hourly?.wind_wave_period?.[currentHour] || null,
          wind_wave_direction:
            data?.hourly?.wind_wave_direction?.[currentHour] || null,
          swell_wave_height:
            data?.hourly?.swell_wave_height?.[currentHour] || null,
          swell_wave_period:
            data?.hourly?.swell_wave_period?.[currentHour] || null,
          swell_wave_direction:
            data?.hourly?.swell_wave_direction?.[currentHour] || null,
          // New Current Metrics
          ocean_current_velocity:
            data?.hourly?.ocean_current_velocity?.[currentHour] || null,
          ocean_current_direction:
            data?.hourly?.ocean_current_direction?.[currentHour] || null,
        })
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const outputPath = path.join(process.cwd(), 'public', 'marine-data.json')
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          meta: {
            scraped_at: new Date().toISOString(),
            total_locations: marineData.length,
          },
          locations: marineData,
        },
        null,
        2,
      ),
    )
    console.log(
      `✅ Scraped comprehensive marine data for ${marineData.length} locations.`,
    )
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to scrape marine data: ${error.message}`)
    } else {
      console.error('Failed to scrape marine data:', error)
    }
    process.exit(1)
  }
}

scrapeMarine()
