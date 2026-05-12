const express = require("express");
const { scrapeFund, getMTSXAUUSD, getSETINETREIT, getSymbolPrice, getUSDTHBCloseByDate } = require("./scrapeFund");
const { buildOpenApiSpec } = require("./openapi");

const app = express();
const PORT = process.env.PORT || 3000;

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function renderHomePage(baseUrl) {
  return `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Node Fund API</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f1e8;
        --panel: rgba(255, 252, 247, 0.85);
        --ink: #1e2430;
        --muted: #5c6574;
        --accent: #0f766e;
        --accent-2: #d97706;
        --border: rgba(30, 36, 48, 0.12);
        --shadow: 0 18px 50px rgba(30, 36, 48, 0.10);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 32%),
          radial-gradient(circle at bottom right, rgba(217, 119, 6, 0.18), transparent 28%),
          linear-gradient(135deg, #f8f3eb 0%, #f1e7d6 100%);
        min-height: 100vh;
      }

      main {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 64px;
      }

      .hero,
      .panel {
        background: var(--panel);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: var(--shadow);
      }

      .hero {
        padding: 32px;
      }

      .eyebrow {
        margin: 0 0 12px;
        color: var(--accent);
        font-size: 0.9rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.4rem, 6vw, 4.8rem);
        line-height: 0.95;
        max-width: 10ch;
      }

      .lead {
        margin: 20px 0 0;
        max-width: 62ch;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 18px;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
        transition: transform 160ms ease, box-shadow 160ms ease;
      }

      .button:hover {
        transform: translateY(-1px);
      }

      .button.primary {
        background: var(--ink);
        color: #fff;
        box-shadow: 0 10px 24px rgba(30, 36, 48, 0.18);
      }

      .button.secondary {
        background: transparent;
        color: var(--ink);
        border: 1px solid var(--border);
      }

      .grid {
        display: grid;
        gap: 18px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        margin-top: 20px;
      }

      .panel {
        padding: 24px;
      }

      .label {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        background: rgba(15, 118, 110, 0.10);
        color: var(--accent);
      }

      h2 {
        margin: 14px 0 8px;
        font-size: 1.3rem;
      }

      p,
      li {
        color: var(--muted);
        line-height: 1.7;
      }

      code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.95em;
        color: var(--ink);
      }

      ul {
        padding-left: 20px;
        margin: 12px 0 0;
      }

      @media (max-width: 640px) {
        .hero,
        .panel {
          border-radius: 20px;
        }

        .hero,
        .panel {
          padding: 22px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">WealthMagik scraper</p>
        <h1>Node Fund API</h1>
        <p class="lead">
          API สำหรับดึงข้อมูลกองทุน KKP NDQ100-UH-E จาก WealthMagik พร้อมสเปก OpenAPI และหน้า docs สำหรับทดลองเรียกใช้งาน.
        </p>
        <div class="actions">
          <a class="button primary" href="/docs">Open API Docs</a>
          <a class="button secondary" href="/api/fund/kkp-ndq100-uh-e">Try JSON Endpoint</a>
          <a class="button secondary" href="/api/market/xauusd">Try XAUUSD Endpoint</a>
          <a class="button secondary" href="/api/stock/inetreit">Try INETREIT Endpoint</a>
          <a class="button secondary" href="/api/price?symbol=BTC">Try Price Endpoint</a>
          <a class="button secondary" href="/api/usdthb/close?date=20260512">Try USD Close Endpoint</a>
        </div>
      </section>

      <section class="grid">
        <article class="panel">
          <span class="label">Endpoint</span>
          <h2>Fund Data</h2>
          <p><code>GET ${baseUrl}/api/fund/kkp-ndq100-uh-e</code></p>
          <ul>
            <li>ดึงชื่อกองทุน</li>
            <li>ดึงวันที่อัปเดตล่าสุดที่พบในหน้า</li>
            <li>ดึงชุดผลตอบแทนตามช่วงเวลา</li>
          </ul>
        </article>

        <article class="panel">
          <span class="label">Spec</span>
          <h2>OpenAPI</h2>
          <p><code>GET ${baseUrl}/openapi.json</code></p>
          <ul>
            <li>นำไป import เข้า Postman ได้</li>
            <li>ใช้กับ Swagger UI หรือ Redoc ได้</li>
            <li>สะดวกสำหรับต่อระบบอื่น</li>
          </ul>
        </article>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderExample(value) {
  if (value === undefined) {
    return "";
  }

  return `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
}

function renderDocsPage(spec) {
  const endpoints = Object.entries(spec.paths)
    .flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, operation]) => {
        const parameters = operation.parameters || [];
        const successContent = operation.responses?.["200"]?.content?.["application/json"];
        const example = successContent?.example;

        return `
        <article class="endpoint">
          <div class="endpoint-head">
            <span class="method">${escapeHtml(method.toUpperCase())}</span>
            <code>${escapeHtml(path)}</code>
          </div>
          <h2>${escapeHtml(operation.summary || path)}</h2>
          ${operation.description ? `<p>${escapeHtml(operation.description)}</p>` : ""}
          ${
            parameters.length
              ? `<h3>Parameters</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>In</th>
                      <th>Required</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${parameters
                      .map(
                        (parameter) => `
                        <tr>
                          <td><code>${escapeHtml(parameter.name)}</code></td>
                          <td>${escapeHtml(parameter.in)}</td>
                          <td>${parameter.required ? "yes" : "no"}</td>
                          <td><code>${escapeHtml(parameter.example ?? parameter.schema?.default ?? "")}</code></td>
                        </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>`
              : ""
          }
          ${example ? `<h3>Example Response</h3>${renderExample(example)}` : ""}
        </article>`;
      })
    )
    .join("");

  return `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(spec.info.title)} Docs</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f8fa;
        --panel: #ffffff;
        --ink: #17202a;
        --muted: #647084;
        --line: #dbe1ea;
        --code: #f3f6fa;
        --accent: #0f766e;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Arial, "Helvetica Neue", sans-serif;
      }

      main {
        width: min(1080px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0 56px;
      }

      header {
        display: grid;
        gap: 10px;
        padding: 0 0 24px;
        border-bottom: 1px solid var(--line);
        margin-bottom: 24px;
      }

      h1,
      h2,
      h3,
      p {
        margin-top: 0;
      }

      h1 {
        margin-bottom: 4px;
        font-size: 2rem;
      }

      h2 {
        margin-bottom: 8px;
        font-size: 1.15rem;
      }

      h3 {
        margin: 18px 0 8px;
        font-size: 0.9rem;
      }

      p {
        color: var(--muted);
        line-height: 1.6;
      }

      a {
        color: var(--accent);
      }

      code,
      pre {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      }

      code {
        overflow-wrap: anywhere;
      }

      pre {
        overflow-x: auto;
        margin: 0;
        padding: 14px;
        border-radius: 8px;
        background: var(--code);
        border: 1px solid var(--line);
        font-size: 0.86rem;
        line-height: 1.5;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        min-height: 32px;
        padding: 0 10px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: var(--panel);
        color: var(--muted);
        font-size: 0.9rem;
      }

      .endpoint {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 18px;
        margin-bottom: 14px;
      }

      .endpoint-head {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 12px;
      }

      .method {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 54px;
        min-height: 28px;
        padding: 0 8px;
        border-radius: 6px;
        background: #e6f4f1;
        color: #075c54;
        font-weight: 700;
        font-size: 0.78rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        border: 1px solid var(--line);
      }

      th,
      td {
        padding: 10px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
      }

      th {
        background: var(--code);
        font-size: 0.82rem;
      }

      @media (max-width: 680px) {
        main {
          width: min(100% - 20px, 1080px);
          padding-top: 20px;
        }

        .endpoint {
          padding: 14px;
        }

        .endpoint-head {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(spec.info.title)}</h1>
        <p>${escapeHtml(spec.info.description)}</p>
        <div class="meta">
          <span class="pill">OpenAPI ${escapeHtml(spec.openapi)}</span>
          <span class="pill">Version ${escapeHtml(spec.info.version)}</span>
          <a class="pill" href="/openapi.json">openapi.json</a>
        </div>
      </header>
      ${endpoints}
    </main>
  </body>
</html>`;
}

app.get("/", (req, res) => {
  res.type("html").send(renderHomePage(getBaseUrl(req)));
});

app.get("/openapi.json", (req, res) => {
  res.json(buildOpenApiSpec(getBaseUrl(req)));
});

app.get("/docs", (req, res) => {
  res.type("html").send(renderDocsPage(buildOpenApiSpec(getBaseUrl(req))));
});

app.get("/api/fund/kkp-ndq100-uh-e", async (_req, res) => {
  try {
    const result = await scrapeFund();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/market/xauusd", async (_req, res) => {
  const result = await getMTSXAUUSD();
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.json(result);
});

app.get("/api/stock/inetreit", async (_req, res) => {
  const result = await getSETINETREIT();
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.json(result);
});

app.get("/api/price", async (req, res) => {
  const { symbol, targetCurrency } = req.query;
  const result = await getSymbolPrice(symbol, targetCurrency);

  if (!result.success) {
    return res.status(symbol ? 500 : 400).json(result);
  }

  return res.json(result);
});

app.get("/api/price/:symbol", async (req, res) => {
  const result = await getSymbolPrice(req.params.symbol, req.query.targetCurrency);

  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.json(result);
});

app.get("/api/usdthb/close", async (req, res) => {
  const result = await getUSDTHBCloseByDate(req.query.date);

  if (!result.success) {
    return res.status(req.query.date ? 500 : 400).json(result);
  }

  return res.json(result);
});

app.get("/api/usdthb/close/:date", async (req, res) => {
  const result = await getUSDTHBCloseByDate(req.params.date);

  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
