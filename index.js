const express = require("express");
const { scrapeFund, getMTSXAUUSD } = require("./scrapeFund");
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

function renderDocsPage() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Node Fund API Docs</title>
    <style>
      body {
        margin: 0;
        background: #f8f7f4;
      }
    </style>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </head>
  <body>
    <redoc spec-url="/openapi.json"></redoc>
  </body>
</html>`;
}

app.get("/", (req, res) => {
  res.type("html").send(renderHomePage(getBaseUrl(req)));
});

app.get("/openapi.json", (req, res) => {
  res.json(buildOpenApiSpec(getBaseUrl(req)));
});

app.get("/docs", (_req, res) => {
  res.type("html").send(renderDocsPage());
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});