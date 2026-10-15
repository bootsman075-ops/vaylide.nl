// Maakt kaartafbeeldingen van de ontwerpen voor de collectie (800×1000).
// Gebruik (vanuit de projectmap, ontwikkelserver op :8000):
//   node e2e/make_design_images.cjs http://127.0.0.1:8000 static/img/designs [code ...]
// Zonder codes: alle ontwerpen in designs/. Van de eerste drie ontwerpen wordt het openingsscherm
// vastgelegd, van de Atelier-ontwerpen de geopende uitnodiging (daar zit de eigen kop met versiering),
// net als bij ontwerpen met "kaartbeeld": "open" in het manifest (Winterlicht: het kerstraam).
// Met "kaartbeeld": "raam" (Kerstcoupé) wordt de geopende kop op telefoonformaat (9:16) vastgelegd en
// het raam met de groet eruit gesneden (4:5), zodat de zachte rand van een computerscherm niet in beeld komt.
// Daarna de PNG's omzetten naar WebP en de PNG's verwijderen, bijvoorbeeld:
//   .venv/bin/python -c "import pathlib; from PIL import Image; [(Image.open(p).convert('RGB').save(p.with_suffix('.webp'), quality=80), p.unlink()) for p in pathlib.Path('static/img/designs').glob('*.png')]"
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

function designs() {
  const root = path.join(process.cwd(), "designs");
  const out = [];
  for (const slug of fs.readdirSync(root).sort()) {
    if (slug.startsWith("_")) continue;
    const versions = fs.readdirSync(path.join(root, slug)).filter((v) => /^v\d+$/.test(v)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
    if (!versions.length) continue;
    const manifest = JSON.parse(fs.readFileSync(path.join(root, slug, versions[versions.length - 1], "manifest.json"), "utf8"));
    out.push({ slug, open: Boolean(manifest.atelier) || ["open", "raam"].includes(manifest.kaartbeeld), raam: manifest.kaartbeeld === "raam" });
  }
  return out;
}

(async () => {
  const [base, outDir, ...only] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const { slug, open, raam } of designs().filter((d) => !only.length || only.includes(d.slug))) {
    // Openingsscherm: 400×500 zoals bij de eerste ontwerpen; geopend: iets ruimer, zodat de kop in beeld is.
    const [w, h] = raam ? [450, 800] : open ? [480, 600] : [400, 500];
    const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 800 / w, bypassCSP: true });
    const page = await context.newPage();
    await page.goto(`${base}/voorbeeld/${slug}/${open ? "#uitnodiging" : ""}`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: ".inv-banner, .music, .fx-toggle, .wl-scroll { display: none !important; } *, *::before, *::after { animation-play-state: paused !important; }" });
    // Zonder de voorbeeldbalk opnieuw laten meten (Kerstcoupé past de hoogte van de kop aan de balk aan).
    await page.evaluate(async () => { await document.fonts.ready; window.dispatchEvent(new Event("resize")); window.scrollTo(0, 0); });
    // Wachten tot de zwevende deeltjes (effects.js) goed in beeld zijn.
    await page.waitForTimeout(open ? 2200 : 1800);
    // Bij "raam": een uitsnede van 4:5 met het raam en de groet (van 3,5% tot 73,8% van de hoogte).
    await page.screenshot({ path: `${outDir}/${slug}.png`, ...(raam ? { clip: { x: 0, y: 28, width: 450, height: 562.5 } } : {}) });
    await context.close();
    console.log("ok", slug);
  }
  await browser.close();
})();
