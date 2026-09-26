// Maakt kaartafbeeldingen van de ontwerpen (openingsscherm) voor de collectiepagina.
// Gebruik: node e2e/make_design_images.cjs http://127.0.0.1:8000 static/img/designs
// Daarna de PNG's omzetten naar WebP (800×1000) en de PNG's verwijderen, bijvoorbeeld:
//   .venv/bin/python -c "from PIL import Image; import sys; [Image.open(f'static/img/designs/{s}.png').convert('RGB').save(f'static/img/designs/{s}.webp', quality=80) for s in sys.argv[1:]]" liefde-op-papier avondgoud puur-moment
const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const [base, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 400, height: 500 }, deviceScaleFactor: 2, bypassCSP: true });
  const page = await context.newPage();
  for (const slug of ["liefde-op-papier", "avondgoud", "puur-moment"]) {
    await page.goto(`${base}/voorbeeld/${slug}/`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: ".inv-banner{display:none!important} *{animation-play-state:paused!important}" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/${slug}.png` });
    console.log("ok", slug);
  }
  await browser.close();
})();
