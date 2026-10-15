// Kerstpaleis: het kaartbeeld voor de collectie (static/img/designs/kerstpaleis.webp, 800 × 1000).
// De kaart is hoger dan 4:5 (de sierlijst houdt zijn verhouding), dus: de geopende kaart op 480 × 653 pixels,
// en daaruit het midden in 4:5. Gebruik (vanuit de projectmap, ontwikkelserver op :8000):
//   node tools/kerstpaleis/kaartbeeld.cjs http://127.0.0.1:8000 /tmp/kerstpaleis.png
//   .venv/bin/python -c "from PIL import Image; Image.open('/tmp/kerstpaleis.png').convert('RGB').save('static/img/designs/kerstpaleis.webp', quality=80)"
const { chromium } = require("playwright");

(async () => {
  const [base, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const scale = 800 / 480;
  const context = await browser.newContext({ viewport: { width: 480, height: 653 }, deviceScaleFactor: scale, bypassCSP: true });
  const page = await context.newPage();
  await page.goto(`${base}/voorbeeld/kerstpaleis/#uitnodiging`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".inv-banner, .music, .fx-toggle, .kp-scroll { display: none !important; } *, *::before, *::after { animation-play-state: paused !important; } :root { --kp-bar: 0px !important; }" });
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  await page.waitForTimeout(2600);
  const hero = await page.locator(".kp-hero").boundingBox();
  const h = 480 * 1.25;
  await page.screenshot({ path: out, clip: { x: 0, y: hero.y + (hero.height - h) / 2, width: 480, height: h } });
  await browser.close();
  console.log("ok", out);
})();
