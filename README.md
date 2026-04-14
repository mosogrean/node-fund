# Node Fund API

Node.js API for scraping market/fund data and exposing JSON endpoints with OpenAPI docs.

## Description Items

- Scrapes fund data for `KKP NDQ100-UH-E` from WealthMagik.
- Extracts `updatedAt`, `nav`, and periodic return values.
- Scrapes XAUUSD prices from RoboForex page.
- Extracts `ask_usd_oz` and `bid_usd_oz` from Thai text pattern.
- Provides OpenAPI JSON and interactive docs page.
- Includes Dockerfile and docker-compose for server deployment.

## Tech Stack

- Node.js
- Express
- Axios
- Cheerio
- OpenAPI 3.0.3

## Endpoints

- `GET /` : Landing page
- `GET /docs` : Redoc API documentation
- `GET /openapi.json` : OpenAPI spec
- `GET /api/fund/kkp-ndq100-uh-e` : Fund data (name, updated date, NAV, returns)
- `GET /api/market/xauusd` : XAUUSD ask/bid prices

## Run Locally

```bash
npm install
npm start
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/docs`

## Run with Docker

Build image:

```bash
docker build -t node-fund:latest .
```

Run container:

```bash
docker run -d --name node-fund-api -p 3000:3000 node-fund:latest
```

## Run with Docker Compose

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

## Project Files

- `index.js` : Express server and routes
- `scrapeFund.js` : Scraping and parsing logic
- `openapi.js` : OpenAPI schema
- `Dockerfile` : Container image build
- `docker-compose.yml` : Multi-container/server orchestration config

## Notes

- Source page content can change over time; regex patterns may need updates.
- Scraping depends on external website availability and response format.
