const { FUND_NAME, XAUUSD_URL } = require("./scrapeFund");

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