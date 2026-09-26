// Maakt de deelafbeeldingen (Open Graph) en het app-icoon in de Vierlief-huisstijl.
// Gebruik: node e2e/make_brand_images.cjs http://127.0.0.1:8000
// Vereist een draaiende ontwikkelserver (voor de lettertypen) en Playwright.
// designs/_standaard.png daarna omzetten naar WebP (Pillow):
//   .venv/bin/python -c "from PIL import Image; Image.open('static/img/designs/_standaard.png').convert('RGB').save('static/img/designs/_standaard.webp', quality=82)"
const path = require("path");
const { chromium } = require("playwright");

const base = process.argv[2] || "http://127.0.0.1:8000";
const out = path.join(__dirname, "..", "static", "img");

const seal = (size) => `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="20" r="19" fill="#5E1A2B"/><circle cx="20" cy="20" r="14.6" fill="none" stroke="#E8D8B5" stroke-opacity=".7" stroke-width="1"/><path d="M13.2 12.5h3.1l3.9 11.6 3.9-11.6h3l-5.6 15.4h-2.7z" fill="#FBF3EA"/></svg>`;

const css = `
@font-face { font-family: "Cormorant Garamond"; src: url("${base}/static/fonts/cormorant-garamond-latin-wght-normal.woff2") format("woff2"); font-weight: 300 700; }
@font-face { font-family: "Cormorant Garamond"; src: url("${base}/static/fonts/cormorant-garamond-latin-wght-italic.woff2") format("woff2"); font-weight: 300 700; font-style: italic; }
@font-face { font-family: "Figtree"; src: url("${base}/static/fonts/figtree-latin-wght-normal.woff2") format("woff2"); font-weight: 300 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { font-family: "Figtree", sans-serif; color: #2B2024; }
.og { width: 1200px; height: 630px; position: relative; overflow: hidden;
  background: radial-gradient(ellipse at 20% 10%, #FFFDF8 0%, #FBF6EE 45%, #F3E9DA 100%); display: grid; place-items: center; }
.og::before { content: ""; position: absolute; inset: 26px; border: 1px solid rgba(176, 141, 87, .55); border-radius: 6px; }
.og::after { content: ""; position: absolute; inset: 34px; border: 1px solid rgba(176, 141, 87, .25); border-radius: 4px; }
.inner { position: relative; text-align: center; display: grid; justify-items: center; gap: 22px; padding: 0 120px; }
.word { font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 600; font-size: 128px; line-height: .9; color: #5E1A2B; }
.rule { width: 180px; height: 1px; background: linear-gradient(90deg, transparent, #B08D57, transparent); }
.line { font-family: "Cormorant Garamond", serif; font-size: 44px; line-height: 1.15; color: #3A2A2F; font-weight: 500; }
.small { font-size: 21px; letter-spacing: .22em; text-transform: uppercase; color: #7A5C45; font-weight: 600; }
/* Envelop voor de uitnodigingsvariant */
.env { position: relative; width: 420px; height: 270px; border-radius: 10px; background: #F6EDE0; box-shadow: 0 30px 60px -30px rgba(60, 25, 30, .45), 0 2px 0 rgba(255,255,255,.7) inset; overflow: hidden; }
.env__flap { position: absolute; left: 0; right: 0; top: 0; height: 170px; background: linear-gradient(180deg, #EFE2CF, #E9D9C2); clip-path: polygon(0 0, 100% 0, 50% 100%); }
.env__pocket { position: absolute; inset: 0; background: linear-gradient(0deg, #F3E7D6, #F7EEE2); clip-path: polygon(0 100%, 0 35%, 50% 72%, 100% 35%, 100% 100%); }
.env__seal { position: absolute; left: 50%; top: 170px; transform: translate(-50%, -50%); filter: drop-shadow(0 6px 10px rgba(60, 20, 25, .35)); }
.card { width: 800px; height: 1000px; position: relative; display: grid; place-content: center; justify-items: center; gap: 26px; text-align: center;
  background: radial-gradient(ellipse at 30% 15%, #FFFDF8 0%, #FBF6EE 50%, #F1E6D4 100%); }
.card__frame { position: absolute; inset: 40px; border: 1px solid rgba(176, 141, 87, .5); border-radius: 8px; }
.icon { width: 180px; height: 180px; display: grid; place-items: center; background: radial-gradient(circle at 30% 25%, #FFFDF8, #F3E9DA); }
`;

const pages = {
  "og-vierlief.jpg": `<div class="og"><div class="inner">${seal(92)}<div class="word">Vierlief</div><div class="rule"></div><p class="line">Elk bijzonder moment begint<br>met een uitnodiging.</p><p class="small">Digitale uitnodigingen</p></div></div>`,
  "og-uitnodiging.jpg": `<div class="og"><div class="inner"><div class="env"><div class="env__pocket"></div><div class="env__flap"></div><div class="env__seal">${seal(96)}</div></div><p class="line">Je bent uitgenodigd</p><p class="small">Open de uitnodiging</p></div></div>`,
  "apple-touch-icon.png": `<div class="icon">${seal(150)}</div>`,
  // Standaardafbeelding voor een ontwerp zonder eigen voorbeeldafbeelding (wordt omgezet naar WebP).
  "designs/_standaard.png": `<div class="card"><div class="card__frame"></div>${seal(84)}<p class="line">Nieuw ontwerp</p><p class="small">Voorbeeld volgt</p></div>`,
};

(async () => {
  const browser = await chromium.launch();
  for (const [name, body] of Object.entries(pages)) {
    const icon = name === "apple-touch-icon.png";
    const card = name.startsWith("designs/");
    // Zelfde herkomst als de server (lettertypen laden zonder CORS); CSP omzeilen voor de inline stijl.
    const context = await browser.newContext({ bypassCSP: true, viewport: icon ? { width: 180, height: 180 } : card ? { width: 800, height: 1000 } : { width: 1200, height: 630 } });
    const page = await context.newPage();
    await page.goto(base + "/healthz");
    await page.setContent(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`, { waitUntil: "networkidle" });
    await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].map((f) => f.family + ":" + f.status); }).then((r) => console.log(r.join(", ")));
    const file = path.join(out, name);
    const png = name.endsWith(".png");
    await page.screenshot({ path: file, type: png ? "png" : "jpeg", quality: png ? undefined : 88 });
    console.log("gemaakt:", file);
    await context.close();
  }
  await browser.close();
})();
