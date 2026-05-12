const axios = require("axios");
const cheerio = require("cheerio");

const FUND_NAME = "KKP NDQ100-UH-E";
const FUND_URL = "https://www.wealthmagik.com/funds/KKP%20NDQ100-UH-E";
const XAUUSD_URL = "https://th.roboforex.com/beginners/info/charts/metals/xauusd/";
const INETREIT_SYMBOL = "INETREIT";
const INETREIT_URL = "https://www.set.or.th/th/market/product/stock/quote/INETREIT/price";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0",
};

const RETURN_REGEX = /(1 วัน|1 สัปดาห์|1 เดือน|3 เดือน|6 เดือน|1 ปี|3 ปี|5 ปี|ตั้งแต่จัดตั้ง)\s*([+-]?\d+(?:\.\d+)?%)/g;
const UPDATED_AT_REGEX = /ข้อมูล\s*ณ\s*วันที่\s*([0-9]{1,2}\s*[^\s]+\s*[0-9]{4})/;
const NAV_REGEX = /NAV&q;:\s*([0-9][0-9,]*(?:\.[0-9]+)?),/;
const ASK_BID_REGEX =
  /ราคาขายและซื้อในปัจจุบันที่\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*USD\s*และ\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*USD/;
const INETREIT_QUOTE_REGEX = /INETREIT\s+หุ้น\s+([0-9][0-9,]*(?:\.[0-9]+)?)\s+([+\-]?\d+(?:\.\d+)?)\s*\(([+\-]?\d+(?:\.\d+)?)%\)/i;
const INETREIT_UPDATE_REGEX = /ข้อมูลล่าสุด\s*:\s*([0-9]{1,2}\s*[^\s]+\s*[0-9]{4}\s*[0-9]{2}:[0-9]{2}:[0-9]{2})/;
const INETREIT_HIGH_REGEX = /สูงสุด\s*([0-9][0-9,]*(?:\.[0-9]+)?)/;
const INETREIT_LOW_REGEX = /ต่ำสุด\s*([0-9][0-9,]*(?:\.[0-9]+)?)/;
const INETREIT_OPEN_REGEX = /ราคาเปิด\s*([0-9][0-9,]*(?:\.[0-9]+)?)/;
const INETREIT_VOLUME_REGEX = /ปริมาณ\s*\(หุ้น\)\s*([0-9][0-9,]*)/;

function toNumber(value) {
  if (!value) {
    return null;
  }
  return Number(String(value).replace(/,/g, ""));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withRetry(request, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function normalizeYahooSymbol(symbol) {
  const trimmed = String(symbol || "").trim().toUpperCase();

  if (!trimmed) {
    return null;
  }

  if (trimmed === "BTC" || trimmed === "BTCUSD" || trimmed === "CURRENCY:BTCUSD") {
    return "BTC-USD";
  }

  if (trimmed === "ETH" || trimmed === "ETHUSD" || trimmed === "CURRENCY:ETHUSD") {
    return "ETH-USD";
  }

  if (trimmed.startsWith("CURRENCY:") && trimmed.endsWith("USD")) {
    return `${trimmed.slice("CURRENCY:".length, -3)}-USD`;
  }

  if (trimmed.startsWith("SET:")) {
    return `${trimmed.slice("SET:".length)}.BK`;
  }

  if (trimmed.includes(":")) {
    return trimmed.split(":").pop();
  }

  return trimmed;
}

function parseYyyyMmDd(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (!match) {
    throw new Error("date must be in YYYYMMDD format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("date is invalid");
  }

  return {
    compact: text,
    isoDate: `${match[1]}-${match[2]}-${match[3]}`,
    start: date,
    end: new Date(Date.UTC(year, month - 1, day + 1)),
  };
}

function parseFundPage(html) {
  const $ = cheerio.load(html);
  const pageText = $("body").text().replace(/\s+/g, " ").trim();

  const hasFundName = pageText.includes(FUND_NAME);
  const dateMatch = pageText.match(UPDATED_AT_REGEX);
  const navMatch = pageText.match(NAV_REGEX);
  const returns = [];
  const price = navMatch ? navMatch[1].replace(/,/g, "") : null;

  let match;
  while ((match = RETURN_REGEX.exec(pageText)) !== null) {
    returns.push({
      period: match[1],
      value: match[2],
    });
  }

  return {
    success: true,
    fundName: hasFundName ? FUND_NAME : null,
    updatedAt: dateMatch ? dateMatch[1] : null,
    nav: price,
    returns,
  };
}

async function scrapeFund() {
  const response = await axios.get(FUND_URL, {
    headers: DEFAULT_HEADERS,
    timeout: 15000,
  });

  return parseFundPage(response.data);
}

async function getYahooChart(yahooSymbol, params = { range: "1d", interval: "1m" }) {
  const { data } = await axios.get(`${YAHOO_CHART_URL}/${encodeURIComponent(yahooSymbol)}`, {
    params,
    headers: DEFAULT_HEADERS,
    timeout: 15000,
  });

  const result = data?.chart?.result?.[0];
  const error = data?.chart?.error;

  if (error || !result) {
    throw new Error(error?.description || "Unable to fetch price");
  }

  return result;
}

function getLastYahooClose(result) {
  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp || [];
  const closes = quote.close || [];
  let close = meta.regularMarketPrice ?? null;
  let timestamp = meta.regularMarketTime ?? null;

  for (let index = closes.length - 1; index >= 0; index -= 1) {
    if (closes[index] !== null && closes[index] !== undefined) {
      close = closes[index];
      timestamp = timestamps[index] || timestamp;
      break;
    }
  }

  if (close === null || close === undefined) {
    throw new Error("Price is not available for this symbol");
  }

  return {
    close: Number(close),
    timestamp,
    meta,
  };
}

function getYahooDailyCloseForDate(result, requestedDate) {
  const quote = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp || [];
  const closes = quote.close || [];
  const startSeconds = Math.floor(requestedDate.start.getTime() / 1000);
  const endSeconds = Math.floor(requestedDate.end.getTime() / 1000);

  for (let index = 0; index < timestamps.length; index += 1) {
    if (timestamps[index] >= startSeconds && timestamps[index] < endSeconds && closes[index] !== null && closes[index] !== undefined) {
      return {
        close: Number(closes[index]),
        timestamp: timestamps[index],
        meta: result.meta || {},
      };
    }
  }

  throw new Error(`USDTHB close is not available for ${requestedDate.compact}`);
}

async function getUSDTHBRate() {
  const errors = [];

  try {
    const { data } = await withRetry(() =>
      axios.get("https://api.exchangerate-api.com/v4/latest/USD", {
        headers: DEFAULT_HEADERS,
        timeout: 10000,
      })
    );
    const rate = Number(data?.rates?.THB);

    if (Number.isFinite(rate)) {
      return rate;
    }

    errors.push("exchangerate-api: THB rate is not available");
  } catch (error) {
    errors.push(`exchangerate-api: ${error.message}`);
  }

  try {
    const result = await withRetry(() => getYahooChart("USDTHB=X"));
    const { close } = getLastYahooClose(result);

    if (Number.isFinite(close)) {
      return close;
    }

    errors.push("yahoo: USDTHB=X rate is not available");
  } catch (error) {
    errors.push(`yahoo: ${error.message}`);
  }

  throw new Error(`Unable to fetch USDTHB rate (${errors.join("; ")})`);
}

async function getUSDTHBCloseByDate(dateValue) {
  let requestedDate;

  try {
    requestedDate = parseYyyyMmDd(dateValue);
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  try {
    const result = await withRetry(() =>
      getYahooChart("USDTHB=X", {
        period1: Math.floor(requestedDate.start.getTime() / 1000),
        period2: Math.floor(requestedDate.end.getTime() / 1000),
        interval: "1d",
      })
    );
    const { close, timestamp, meta } = getYahooDailyCloseForDate(result, requestedDate);

    return {
      success: true,
      symbol: meta.symbol || "USDTHB=X",
      base_currency: "USD",
      quote_currency: "THB",
      date: requestedDate.compact,
      iso_date: requestedDate.isoDate,
      close,
      market_time: timestamp ? new Date(timestamp * 1000).toISOString() : null,
      source: "Yahoo Finance chart",
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      date: requestedDate.compact,
    };
  }
}

async function getYahooPrice(symbol) {
  const yahooSymbol = normalizeYahooSymbol(symbol);

  if (!yahooSymbol) {
    return {
      success: false,
      error: "symbol is required",
    };
  }

  try {
    const result = await withRetry(() => getYahooChart(yahooSymbol));
    const { close, timestamp, meta } = getLastYahooClose(result);

    return {
      success: true,
      input_symbol: symbol,
      symbol: meta.symbol || yahooSymbol,
      yahoo_symbol: yahooSymbol,
      currency: meta.currency || null,
      price: close,
      market_time: timestamp ? new Date(timestamp * 1000).toISOString() : null,
      exchange_name: meta.exchangeName || null,
      instrument_type: meta.instrumentType || null,
      source: "Yahoo Finance chart",
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getSymbolPrice(symbol, targetCurrency = "THB") {
  const quote = await getYahooPrice(symbol);
  if (!quote.success) {
    return quote;
  }

  const normalizedTargetCurrency = String(targetCurrency || "THB").trim().toUpperCase();
  const sourceCurrency = String(quote.currency || "").toUpperCase();
  let convertedPrice = quote.price;
  let usdThbRate = null;

  if (normalizedTargetCurrency === "THB" && sourceCurrency === "USD") {
    try {
      usdThbRate = await getUSDTHBRate();
    } catch (error) {
      return {
        success: false,
        error: error.message,
        quote,
      };
    }
    convertedPrice = quote.price * usdThbRate;
  }

  return {
    ...quote,
    target_currency: normalizedTargetCurrency,
    usd_thb_rate: usdThbRate,
    price_in_target_currency: convertedPrice,
  };
}

async function getMTSXAUUSD() {
  try {
    const [{ data: html }, thbRate] = await Promise.all([
      axios.get(XAUUSD_URL, {
        headers: DEFAULT_HEADERS,
        timeout: 15000,
      }),
      getUSDTHBRate(),
    ]);

    const $ = cheerio.load(html);
    const text = $("body").text().replace(/\s+/g, " ").trim();

    const hasSymbol = text.includes("XAUUSD");
    const askBidMatch = text.match(ASK_BID_REGEX);
    const ask = askBidMatch ? Number(askBidMatch[1].replace(/,/g, "")) : null;
    const bid = askBidMatch ? Number(askBidMatch[2].replace(/,/g, "")) : null;

    return {
      success: true,
      symbol: hasSymbol ? "XAUUSD" : null,
      ask_usd_oz: ask,
      bid_usd_oz: bid,
      usd_thb_rate: thbRate,
      ask_bath_oz: ask && bid ? ((ask + bid) / 2) * thbRate : null,
      bid_bath_oz: ask && bid ? ((ask + bid) / 2) * thbRate : null,
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getSETINETREIT() {
  try {
    const { data: html } = await axios.get(INETREIT_URL, {
      headers: DEFAULT_HEADERS,
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const text = $("body").text().replace(/\s+/g, " ").trim();

    const quoteMatch = text.match(INETREIT_QUOTE_REGEX);
    const updatedMatch = text.match(INETREIT_UPDATE_REGEX);
    const highMatch = text.match(INETREIT_HIGH_REGEX);
    const lowMatch = text.match(INETREIT_LOW_REGEX);
    const openMatch = text.match(INETREIT_OPEN_REGEX);
    const volumeMatch = text.match(INETREIT_VOLUME_REGEX);

    return {
      success: true,
      source: INETREIT_URL,
      symbol: text.includes(INETREIT_SYMBOL) ? INETREIT_SYMBOL : null,
      last_price: quoteMatch ? toNumber(quoteMatch[1]) : null,
      change: quoteMatch ? toNumber(quoteMatch[2]) : null,
      change_percent: quoteMatch ? toNumber(quoteMatch[3]) : null,
      high: highMatch ? toNumber(highMatch[1]) : null,
      low: lowMatch ? toNumber(lowMatch[1]) : null,
      open: openMatch ? toNumber(openMatch[1]) : null,
      volume_shares: volumeMatch ? toNumber(volumeMatch[1]) : null,
      updated_at: updatedMatch ? updatedMatch[1] : null,
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  FUND_NAME,
  FUND_URL,
  XAUUSD_URL,
  INETREIT_SYMBOL,
  INETREIT_URL,
  YAHOO_CHART_URL,
  parseFundPage,
  scrapeFund,
  getUSDTHBRate,
  normalizeYahooSymbol,
  parseYyyyMmDd,
  getUSDTHBCloseByDate,
  getYahooPrice,
  getSymbolPrice,
  getMTSXAUUSD,
  getSETINETREIT,
};
