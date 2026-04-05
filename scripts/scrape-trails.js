import axios from "axios";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

// Coordinates for the trailhead (starting point) of all Recommended Pedestrian Routes (PR)
const TRAIL_COORDS = {
  // Madeira Island
  1: { lat: 32.7355, lon: -16.9281 }, // PR1 Vereda do Areeiro
  1.1: { lat: 32.7639, lon: -16.9039 }, // PR1.1 Vereda da Ilha
  1.2: { lat: 32.7638, lon: -16.9201 }, // PR1.2 Vereda do Pico Ruivo
  1.3: { lat: 32.7535, lon: -17.0211 }, // PR1.3 Vereda da Encumeada
  2: { lat: 32.7214, lon: -16.985 }, // PR2 Vereda do Urzal
  3: { lat: 32.735, lon: -16.928 }, // PR3 Vereda do Burro
  3.1: { lat: 32.715, lon: -16.915 }, // PR3.1 Caminho Real do Monte
  4: { lat: 32.71, lon: -16.94 }, // PR4 Levada do Barreiro
  5: { lat: 32.7445, lon: -16.8261 }, // PR5 Vereda das Funduras
  6: { lat: 32.7617, lon: -17.1344 }, // PR6 Levada das 25 Fontes
  6.1: { lat: 32.7617, lon: -17.1344 }, // PR6.1 Levada do Risco
  6.2: { lat: 32.7547, lon: -17.1339 }, // PR6.2 Levada do Alecrim
  6.3: { lat: 32.7547, lon: -17.1339 }, // PR6.3 Vereda da Lagoa do Vento
  6.4: { lat: 32.7551, lon: -17.1331 }, // PR6.4 Levada Velha do Rabaçal
  6.5: { lat: 32.7541, lon: -17.1154 }, // PR6.5 Vereda do Pico Fernandes
  6.6: { lat: 32.7511, lon: -17.1147 }, // PR6.6 Vereda do Túnel do Cavalo
  6.7: { lat: 32.7511, lon: -17.1147 }, // PR6.7 Vereda da Câmara de Carga
  6.8: { lat: 32.7602, lon: -17.1008 }, // PR6.8 Levada do Paul II
  7: { lat: 32.8444, lon: -17.1936 }, // PR7 Levada do Moinho
  8: { lat: 32.7431, lon: -16.7011 }, // PR8 Vereda da Ponta de S. Lourenço
  9: { lat: 32.7836, lon: -16.9055 }, // PR9 Levada do Caldeirão Verde
  9.1: { lat: 32.7836, lon: -16.9055 }, // PR9.1 Um Caminho para todos
  10: { lat: 32.7358, lon: -16.8858 }, // PR10 Levada do Furado
  11: { lat: 32.7358, lon: -16.8858 }, // PR11 Vereda dos Balcões
  12: { lat: 32.7155, lon: -17.0135 }, // PR12 Caminho Real da Encumeada
  13: { lat: 32.7511, lon: -17.1147 }, // PR13 Vereda do Fanal
  13.1: { lat: 32.7511, lon: -17.1147 }, // PR13.1 Vereda da Palha Carga
  14: { lat: 32.8083, lon: -17.1417 }, // PR14 Levada dos Cedros
  15: { lat: 32.8242, lon: -17.1517 }, // PR15 Vereda da Ribeira da Janela
  16: { lat: 32.7824, lon: -17.0366 }, // PR16 Levada Fajã do Rodrigues
  17: { lat: 32.7536, lon: -17.0212 }, // PR17 Caminho do Pináculo e Folhadal
  18: { lat: 32.8094, lon: -16.9158 }, // PR18 Levada do Rei
  19: { lat: 32.7575, lon: -17.2119 }, // PR19 Paul do Mar
  20: { lat: 32.7572, lon: -17.2105 }, // PR20 Jardim do Mar
  21: { lat: 32.7536, lon: -17.0211 }, // PR21 Caminho do Norte
  22: { lat: 32.7445, lon: -17.0208 }, // PR22 Vereda do Chão dos Louros
  23: { lat: 32.6517, lon: -16.8365 }, // PR23 Levada da Azenha
  27: { lat: 32.7544, lon: -17.0519 }, // PR27 Glaciar de Planalto
  28: { lat: 32.7617, lon: -17.1344 }, // PR28 Levada da Rocha Vermelha
  // Porto Santo Island
  "1ps": { lat: 33.0833, lon: -16.2994 }, // PR1ps Vereda do Pico Branco
  "2ps": { lat: 33.0722, lon: -16.3294 }, // PR2ps Vereda do Pico do Castelo
  "3ps": { lat: 33.0722, lon: -16.3294 }, // PR3ps Levada do Pico Castelo
};

async function scrapeTrails() {
  const url =
    "https://ifcn.madeira.gov.pt/pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html";

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const trails = [];

    $("table#data-table").each((tableIdx, table) => {
      // Determine island based on context (Madeira is first table, Porto Santo is second)
      const island = tableIdx === 0 ? "Madeira" : "Porto Santo";

      $(table)
        .find("tbody tr")
        .each((_, row) => {
          const cells = $(row).find("td");

          if (cells.length >= 6) {
            let pr = $(cells[1]).text().trim();
            const name = $(cells[2]).text().trim();
            const distance = $(cells[3]).text().trim();
            const description = $(cells[4])
              .find("p")
              .map((i, el) => $(el).text().trim())
              .get()
              .join("\n");

            const statusCell = $(cells[5]);
            const statusText =
              statusCell.find("strong").first().text().trim() ||
              statusCell.text().split("\n")[0].trim();
            const additionalStatus = statusCell.find("p").last().text().trim();
            const entity = $(cells[6]).text().trim();

            if (pr && name && pr !== "PR") {
              // Normalize Porto Santo IDs to match our coordinate database (e.g., "1" becomes "1ps")
              const lookupKey = island === "Porto Santo" ? `${pr}ps` : pr;

              const coords = TRAIL_COORDS[lookupKey] || {
                lat: null,
                lon: null,
              };

              trails.push({
                id: name,
                pr: pr,
                island: island,
                distance: distance,
                description: description,
                status:
                  statusText.charAt(0).toUpperCase() +
                  statusText.slice(1).toLowerCase(),
                additional_status:
                  additionalStatus !== statusText ? additionalStatus : "",
                entity_responsible: entity,
                coordinates: coords,
                last_checked: new Date().toISOString(),
              });
            }
          }
        });
    });

    const outputPath = path.join(
      process.cwd(),
      "public",
      "trails-madeira.json",
    );
    const updatedOnSite = $(".modified time")
      .text()
      .replace("Atualizado em", "")
      .trim();

    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          meta: {
            scraped_at: new Date().toISOString(),
            site_last_updated: updatedOnSite || "Unknown",
            total_trails: trails.length,
          },
          trails,
        },
        null,
        2,
      ),
    );

    console.log(
      `✅ Scraped ${trails.length} trails with GPS coordinates for OpenStreetMap.`,
    );
  } catch (error) {
    console.error("Scrape failed:", error.message);
    process.exit(1);
  }
}

scrapeTrails();
