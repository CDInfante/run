/** @author Harry Vasanth (harryvasanth.com) */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import axiosRetry from 'axios-retry'

// Apply retry logic with exponential backoff
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: error =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status === 429,
})

interface RawShip {
  ship: string
  port_of_call: string
  agent: string
  arrival: string
  origin_port: string
  departure: string
  destination_port: string
}

async function scrapeShips() {
  const url = 'https://apram.pt/movimento-navios?port=ptfnc'
  console.log(`Fetching data from ${url}...`)

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 30000,
    })

    const html = response.data
    const ships: RawShip[] = []

    const blocks = html
      .split('<h1 class="uppercase text-xl text-cardHeading font-bold m-2">')
      .slice(1)
    console.log(`Found ${blocks.length} potential ship blocks.`)

    for (const block of blocks) {
      const shipName = block.split('</h1>')[0].trim()

      const extractP = (label: string) => {
        const parts = block.split(label)
        if (parts.length < 2) return ''
        const subPart = parts[1].split('<p class="justify-start capitalize')[1]
        if (!subPart) return ''
        return subPart
          .split('>')[1]
          .split('</p>')[0]
          .replace(/<[^>]*>?/gm, '')
          .trim()
      }

      const extractH3 = (label: string) => {
        const parts = block.split(label)
        if (parts.length < 2) return ''
        const subPart = parts[1].split('<h3 class="font-medium">')[1]
        if (!subPart) return ''
        return subPart
          .split('</h3>')[0]
          .replace(/<[^>]*>?/gm, '')
          .trim()
      }

      const portOfCall = extractP('Porto de Escala')
      const agent = extractH3('Agente')
      const arrival = extractP('Chegada')
      const originPort = extractP('Porto de Origem')
      const departure = extractP('Partida')
      const destinationPort = extractP('Porto de Destino')

      if (shipName && arrival) {
        const parseDate = (d: string) => {
          const parts = d.trim().split(' ')
          if (parts.length < 2) return d
          const [date, time] = parts
          const [day, month, year] = date.split('/')
          return `${year}-${month}-${day}T${time}`
        }

        ships.push({
          ship: shipName,
          port_of_call: portOfCall,
          agent: agent,
          arrival: parseDate(arrival),
          origin_port: originPort,
          departure: parseDate(departure),
          destination_port: destinationPort,
        })
      }
    }

    // Defensive Check: Ensure we actually scraped data before proceeding
    if (ships.length === 0) {
      console.error(
        'Failed to scrape any ships. Target site layout may have changed.',
      )
      process.exit(1)
    }

    const outputPath = path.join(process.cwd(), 'public', 'ships-funchal.json')

    let oldShips: RawShip[] = []
    try {
      if (fs.existsSync(outputPath)) {
        const raw = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
        oldShips = Array.isArray(raw) ? raw : raw.ships || []
      }
    } catch {
      console.warn('Could not read existing data. Starting fresh.')
    }

    const outputData = {
      meta: {
        scraped_at: new Date().toISOString(),
        total_ships: ships.length,
      },
      ships: ships,
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))
    console.log(
      `✅ Successfully scraped ${ships.length} ships and updated ${outputPath}`,
    )

    const added = ships.filter(
      s => !oldShips.some(os => os.ship === s.ship && os.arrival === s.arrival),
    )
    const removed = oldShips.filter(
      os => !ships.some(s => s.ship === os.ship && s.arrival === os.arrival),
    )

    if (added.length > 0) {
      console.log('Added ships:')
      for (const s of added) {
        console.log(` - ${s.ship} (${s.arrival})`)
      }
    }
    if (removed.length > 0) {
      console.log('Removed ships:')
      for (const s of removed) {
        console.log(` - ${s.ship} (${s.arrival})`)
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error scraping ships: ${error.message}`)
    } else {
      console.error('Error scraping ships:', error)
    }
    process.exit(1)
  }
}

scrapeShips()
