import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Scraper for APRAM ship movement data
 * Fetches HTML from apram.pt and parses ship information
 * @author Harry Vasanth (harryvasanth.com)
 */
async function scrapeShips() {
  const url = 'https://apram.pt/movimento-navios?port=ptfnc';
  console.log(`Fetching data from ${url}...`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });

    const html = response.data;

    const ships = [];

    // The structure found from inspection:
    // <h1 class="uppercase text-xl text-cardHeading font-bold m-2"> SHIP NAME </h1>
    // <p class="block uppercase text-xs text-gray-500">Porto de Escala</p>
    // <p class="justify-start capitalize font-bold"> Funchal - Terminal Sul </p>

    const blocks = html.split('<h1 class="uppercase text-xl text-cardHeading font-bold m-2">').slice(1);
    console.log(`Found ${blocks.length} potential ship blocks.`);

    for (const block of blocks) {
        const shipName = block.split('</h1>')[0].trim();

        const extractP = (label) => {
            const parts = block.split(label);
            if (parts.length < 2) return '';
            const subPart = parts[1].split('<p class="justify-start capitalize')[1];
            if (!subPart) return '';
            return subPart.split('>')[1].split('</p>')[0].replace(/<[^>]*>?/gm, '').trim();
        };

        const extractH3 = (label) => {
            const parts = block.split(label);
            if (parts.length < 2) return '';
            const subPart = parts[1].split('<h3 class="font-medium">')[1];
            if (!subPart) return '';
            return subPart.split('</h3>')[0].replace(/<[^>]*>?/gm, '').trim();
        };

        const portOfCall = extractP('Porto de Escala');
        const agent = extractH3('Agente');
        const arrival = extractP('Chegada');
        const originPort = extractP('Porto de Origem');
        const departure = extractP('Partida');
        const destinationPort = extractP('Porto de Destino');

        if (shipName && arrival) {
            const parseDate = (d) => {
              const parts = d.trim().split(' ');
              if (parts.length < 2) return d;
              const [date, time] = parts;
              const [day, month, year] = date.split('/');
              return `${year}-${month}-${day}T${time}`;
            };

            ships.push({
              ship: shipName,
              port_of_call: portOfCall,
              agent: agent,
              arrival: parseDate(arrival),
              origin_port: originPort,
              departure: parseDate(departure),
              destination_port: destinationPort
            });
        }
    }

    if (ships.length > 0) {
      const outputPath = path.join(process.cwd(), 'public', 'ships-funchal.json');

      let oldData = [];
      try {
        if (fs.existsSync(outputPath)) {
          oldData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        }
      } catch (err) {
        console.warn('Could not read existing data. Starting fresh.');
      }

      fs.writeFileSync(outputPath, JSON.stringify(ships, null, 2));
      console.log(`Successfully scraped ${ships.length} ships and updated ${outputPath}`);

      // Print changes
      const added = ships.filter(s => !oldData.some(os => os.ship === s.ship && os.arrival === s.arrival));
      const removed = oldData.filter(os => !ships.some(s => s.ship === os.ship && s.arrival === os.arrival));

      if (added.length > 0) {
        console.log('Added ships:');
        added.forEach(s => console.log(` - ${s.ship} (${s.arrival})`));
      }
      if (removed.length > 0) {
        console.log('Removed ships:');
        removed.forEach(s => console.log(` - ${s.ship} (${s.arrival})`));
      }
      if (added.length === 0 && removed.length === 0) {
        console.log('No changes in ship movements.');
      }
    } else {
      console.error('Failed to scrape any ships. Output not updated.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Error scraping ships:', error.message);
    process.exit(1);
  }
}

scrapeShips();
