const axios = require("axios");
const cheerio = require("cheerio");

const FUND_NAME = "KKP NDQ100-UH-E";
const FUND_URL = "https://www.wealthmagik.com/funds/KKP%20NDQ100-UH-E";
const XAUUSD_URL = "https://th.roboforex.com/beginners/info/charts/metals/xauusd/";

const RETURN_REGEX = /(1 วัน|1 สัปดาห์|1 เดือน|3 เดือน|6 เดือน|1 ปี|3 ปี|5 ปี|ตั้งแต่จัดตั้ง)\s*([+-]?\d+(?:\.\d+)?%)/g;
const UPDATED_AT_REGEX = /ข้อมูล\s*ณ\s*วันที่\s*([0-9]{1,2}\s*[^\s]+\s*[0-9]{4})/;
const NAV_REGEX = /NAV&q;:\s*([0-9][0-9,]*(?:\.[0-9]+)?),/;
const ASK_BID_REGEX =
  /ราคาขายและซื้อในปัจจุบันที่\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*USD\s*และ\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*USD/;

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
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    timeout: 15000,
  });

  return parseFundPage(response.data);
}

async function getMTSXAUUSD() {
  try {
    const { data: html } = await axios.get(XAUUSD_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 15000,
    });

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
  parseFundPage,
  scrapeFund,
  getMTSXAUUSD,
};