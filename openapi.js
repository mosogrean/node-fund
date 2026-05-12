const { FUND_NAME, XAUUSD_URL, INETREIT_URL } = require("./scrapeFund");

function buildOpenApiSpec(baseUrl) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Node Fund API",
      version: "1.0.0",
      description: "API for scraping fund data from WealthMagik for KKP NDQ100-UH-E.",
    },
    servers: [
      {
        url: baseUrl,
      },
    ],
    tags: [
      {
        name: "Funds",
        description: "Fund scraping endpoints",
      },
      {
        name: "Market",
        description: "Market price endpoints",
      },
    ],
    paths: {
      "/api/fund/kkp-ndq100-uh-e": {
        get: {
          tags: ["Funds"],
          summary: "Get latest fund data",
          description: `Scrapes WealthMagik and returns latest available information for ${FUND_NAME}.`,
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/FundResponse",
                  },
                  example: {
                    success: true,
                    fundName: FUND_NAME,
                    updatedAt: "09 เม.ย. 2569",
                    nav: "10.1234",
                    returns: [
                      {
                        period: "1 วัน",
                        value: "0.89%",
                      },
                    ],
                  },
                },
              },
            },
            500: {
              description: "Scraping failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/market/xauusd": {
        get: {
          tags: ["Funds"],
          summary: "Get MTS Gold XAUUSD quote",
          description: "Scrapes XAUUSD quote from MTS Gold trading view page.",
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/XauUsdResponse",
                  },
                },
              },
            },
            500: {
              description: "Scraping failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/stock/inetreit": {
        get: {
          tags: ["Funds"],
          summary: "Get INETREIT quote",
          description: "Scrapes INETREIT quote and key intraday values from SET website.",
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/InetreitResponse",
                  },
                },
              },
            },
            500: {
              description: "Scraping failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/price": {
        get: {
          tags: ["Market"],
          summary: "Get current symbol price",
          description:
            "Gets the latest available quote for a symbol and returns a THB value when the source price is in USD. Supports BTC, ETH, Yahoo symbols such as AAPL, Google Finance style exchange prefixes such as NASDAQ:AAPL, and SET symbols as SET:INETREIT.",
          parameters: [
            {
              name: "symbol",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              examples: {
                btc: {
                  value: "BTC",
                },
                eth: {
                  value: "ETH",
                },
                nasdaq: {
                  value: "NASDAQ:AAPL",
                },
                set: {
                  value: "SET:INETREIT",
                },
              },
            },
            {
              name: "targetCurrency",
              in: "query",
              required: false,
              schema: {
                type: "string",
                default: "THB",
              },
              description: "Currently converts USD quotes to THB by default.",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SymbolPriceResponse",
                  },
                  example: {
                    success: true,
                    input_symbol: "BTC",
                    symbol: "BTC-USD",
                    yahoo_symbol: "BTC-USD",
                    currency: "USD",
                    price: 104250.12,
                    target_currency: "THB",
                    usd_thb_rate: 36.42,
                    price_in_target_currency: 3796789.37,
                    market_time: "2026-05-12T03:15:00.000Z",
                    exchange_name: "CCC",
                    instrument_type: "CRYPTOCURRENCY",
                    source: "Yahoo Finance chart",
                    scraped_at: "2026-05-12T03:15:04.100Z",
                  },
                },
              },
            },
            400: {
              description: "Missing symbol",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Quote failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/price/{symbol}": {
        get: {
          tags: ["Market"],
          summary: "Get current symbol price by path",
          parameters: [
            {
              name: "symbol",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              example: "BTC",
            },
            {
              name: "targetCurrency",
              in: "query",
              required: false,
              schema: {
                type: "string",
                default: "THB",
              },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SymbolPriceResponse",
                  },
                },
              },
            },
            500: {
              description: "Quote failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/usdthb/close": {
        get: {
          tags: ["Market"],
          summary: "Get USDTHB daily close by date",
          description: "Gets the USD to THB daily close rate for a requested date in YYYYMMDD format.",
          parameters: [
            {
              name: "date",
              in: "query",
              required: true,
              schema: {
                type: "string",
                pattern: "^\\d{8}$",
              },
              example: "20260512",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UsdThbCloseResponse",
                  },
                  example: {
                    success: true,
                    symbol: "USDTHB=X",
                    base_currency: "USD",
                    quote_currency: "THB",
                    date: "20260512",
                    iso_date: "2026-05-12",
                    close: 36.42,
                    market_time: "2026-05-12T00:00:00.000Z",
                    source: "Yahoo Finance chart",
                    scraped_at: "2026-05-12T03:15:04.100Z",
                  },
                },
              },
            },
            400: {
              description: "Missing or invalid date",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Quote failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/usdthb/close/{date}": {
        get: {
          tags: ["Market"],
          summary: "Get USDTHB daily close by path date",
          parameters: [
            {
              name: "date",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^\\d{8}$",
              },
              example: "20260512",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UsdThbCloseResponse",
                  },
                },
              },
            },
            500: {
              description: "Quote failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          summary: "Get OpenAPI specification",
          responses: {
            200: {
              description: "OpenAPI document",
            },
          },
        },
      },
      "/docs": {
        get: {
          summary: "Open API documentation UI",
          responses: {
            200: {
              description: "Documentation page",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        FundReturn: {
          type: "object",
          required: ["period", "value"],
          properties: {
            period: {
              type: "string",
              example: "1 เดือน",
            },
            value: {
              type: "string",
              example: "2.14%",
            },
          },
        },
        FundResponse: {
          type: "object",
          required: ["success", "fundName", "updatedAt", "nav", "returns"],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            fundName: {
              type: ["string", "null"],
              example: FUND_NAME,
            },
            updatedAt: {
              type: ["string", "null"],
              example: "09 เม.ย. 2569",
            },
            nav: {
              type: ["string", "null"],
              example: "10.1234",
            },
            returns: {
              type: "array",
              items: {
                $ref: "#/components/schemas/FundReturn",
              },
            },
          },
        },
        XauUsdResponse: {
          type: "object",
          required: ["success", "symbol", "ask_usd_oz", "bid_usd_oz", "change", "change_percent", "scraped_at"],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            symbol: {
              type: ["string", "null"],
              example: "XAUUSD",
            },
            ask_usd_oz: {
              type: ["number", "null"],
              description: "ราคาขาย (ask)",
              example: 4795.39,
            },
            bid_usd_oz: {
              type: ["number", "null"],
              description: "ราคาซื้อ (bid)",
              example: 4795.45,
            },
            change: {
              type: ["string", "null"],
              example: "-3.47",
            },
            change_percent: {
              type: ["string", "null"],
              example: "-0.07",
            },
            scraped_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        InetreitResponse: {
          type: "object",
          required: [
            "success",
            "source",
            "symbol",
            "last_price",
            "change",
            "change_percent",
            "high",
            "low",
            "open",
            "volume_shares",
            "updated_at",
            "scraped_at",
          ],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            source: {
              type: "string",
              example: INETREIT_URL,
            },
            symbol: {
              type: ["string", "null"],
              example: "INETREIT",
            },
            last_price: {
              type: ["number", "null"],
              example: 12.1,
            },
            change: {
              type: ["number", "null"],
              example: 0,
            },
            change_percent: {
              type: ["number", "null"],
              example: 0,
            },
            high: {
              type: ["number", "null"],
              example: 12.2,
            },
            low: {
              type: ["number", "null"],
              example: 12,
            },
            open: {
              type: ["number", "null"],
              example: 12.1,
            },
            volume_shares: {
              type: ["number", "null"],
              example: 1422263,
            },
            updated_at: {
              type: ["string", "null"],
              example: "11 เม.ย. 2569 03:20:09",
            },
            scraped_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        SymbolPriceResponse: {
          type: "object",
          required: [
            "success",
            "input_symbol",
            "symbol",
            "yahoo_symbol",
            "currency",
            "price",
            "target_currency",
            "price_in_target_currency",
            "scraped_at",
          ],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            input_symbol: {
              type: "string",
              example: "NASDAQ:AAPL",
            },
            symbol: {
              type: "string",
              example: "AAPL",
            },
            yahoo_symbol: {
              type: "string",
              example: "AAPL",
            },
            currency: {
              type: ["string", "null"],
              example: "USD",
            },
            price: {
              type: "number",
              example: 212.32,
            },
            target_currency: {
              type: "string",
              example: "THB",
            },
            usd_thb_rate: {
              type: ["number", "null"],
              example: 36.42,
            },
            price_in_target_currency: {
              type: "number",
              example: 7732.69,
            },
            market_time: {
              type: ["string", "null"],
              format: "date-time",
            },
            exchange_name: {
              type: ["string", "null"],
              example: "NMS",
            },
            instrument_type: {
              type: ["string", "null"],
              example: "EQUITY",
            },
            source: {
              type: "string",
              example: "Yahoo Finance chart",
            },
            scraped_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        UsdThbCloseResponse: {
          type: "object",
          required: [
            "success",
            "symbol",
            "base_currency",
            "quote_currency",
            "date",
            "iso_date",
            "close",
            "scraped_at",
          ],
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            symbol: {
              type: "string",
              example: "USDTHB=X",
            },
            base_currency: {
              type: "string",
              example: "USD",
            },
            quote_currency: {
              type: "string",
              example: "THB",
            },
            date: {
              type: "string",
              example: "20260512",
            },
            iso_date: {
              type: "string",
              example: "2026-05-12",
            },
            close: {
              type: "number",
              example: 36.42,
            },
            market_time: {
              type: ["string", "null"],
              format: "date-time",
            },
            source: {
              type: "string",
              example: "Yahoo Finance chart",
            },
            scraped_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Request failed with status code 500",
            },
          },
        },
      },
    },
  };
}

module.exports = {
  buildOpenApiSpec,
};
