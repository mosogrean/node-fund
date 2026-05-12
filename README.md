# Node Fund API

Node.js API for scraping market/fund data and exposing JSON endpoints with OpenAPI docs.

## Description Items

- Scrapes fund data for `KKP NDQ100-UH-E` from WealthMagik.
- Extracts `updatedAt`, `nav`, and periodic return values.
- Scrapes XAUUSD prices from RoboForex page.
- Extracts `ask_usd_oz` and `bid_usd_oz` from Thai text pattern.
- Scrapes INETREIT quote data from SET.
- Extracts `last_price`, `change`, `change_percent`, `high`, `low`, `open`, and `volume_shares`.
- Gets latest available symbol prices from Yahoo Finance chart data.
- Converts USD prices to THB using the USDTHB exchange rate.
- Gets USDTHB historical daily close by `YYYYMMDD` date.
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
- `GET /api/stock/inetreit` : INETREIT quote and intraday stats
- `GET /api/price?symbol=BTC` : Latest available symbol price converted to THB when priced in USD
- `GET /api/price/:symbol` : Same price endpoint with symbol in path
- `GET /api/usdthb/close?date=20260512` : USDTHB daily close for the requested date
- `GET /api/usdthb/close/:date` : Same USDTHB close endpoint with date in path

## Price Examples

```bash
curl "http://localhost:3000/api/price?symbol=BTC"
curl "http://localhost:3000/api/price?symbol=ETH"
curl "http://localhost:3000/api/price?symbol=NASDAQ:AAPL"
curl "http://localhost:3000/api/price?symbol=SET:INETREIT"
curl "http://localhost:3000/api/usdthb/close?date=20260512"
curl "http://localhost:3000/api/usdthb/close/20260512"
```

`BTC`, `ETH`, `BTCUSD`, `ETHUSD`, and `CURRENCY:BTCUSD` are mapped to Yahoo crypto symbols. Google Finance style symbols such as `NASDAQ:AAPL` use the ticker after `:`, while `SET:INETREIT` maps to `INETREIT.BK`.

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
