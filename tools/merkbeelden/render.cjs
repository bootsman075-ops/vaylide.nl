// Tekent de eigen beelden van Vaylia:
// - sfeerbeelden uit scenes.js (WebP in static/img/site/);
// - merkbeelden uit merk.html: deelafbeeldingen en de standaardafbeelding voor ontwerpen.
// Gebruik (Playwright met Chromium nodig): node tools/merkbeelden/render.cjs [merk]
// Met 'merk' alleen de merkbeelden. Het logo en de iconen komen uit tools/logo/maak_logo.py.
// De tegels en de voorbeeldkaart zijn schermafbeeldingen van de echte voorbeelduitnodigingen (zie README.md).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.resolve(__dirname, "../../static/img/site");
const JOBS = [
  ["hero", 1800, 1100, "hero"],
  ["hero", 900, 760, "hero-900"],
  ["groen", 1600, 900, "groen"],
  ["groen", 800, 900, "groen-800"],
  ["maatwerk", 1200, 760, "maatwerk"],
  ["maatwerk", 700, 520, "maatwerk-700"],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><body></body>");
  await page.addScriptTag({ path: path.join(__dirname, "scenes.js") });
  for (const [scene, w, h, name] of process.argv[2] === "merk" ? [] : JOBS) {
    const data = await page.evaluate(([s, w, h]) => window.renderScene(s, w, h, "image/webp", 0.8), [scene, w, h]);
    const file = path.join(OUT, `${name}.webp`);
    fs.writeFileSync(file, Buffer.from(data.split(",")[1], "base64"));
    console.log(path.relative(process.cwd(), file), fs.statSync(file).size, "bytes");
  }
  // Merkbeelden: elk element uit merk.html als losse afbeelding.
  const IMG = path.resolve(__dirname, "../../static/img");
  const merk = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  await merk.goto("file://" + path.join(__dirname, "merk.html"));
  await merk.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]));
  await merk.waitForTimeout(300);
  const shots = [
    ["#og-site", path.join(IMG, "og-vaylia.jpg"), { type: "jpeg", quality: 86 }],
    ["#og-uitnodiging", path.join(IMG, "og-uitnodiging.jpg"), { type: "jpeg", quality: 86 }],
  ];
  for (const [selector, file, options] of shots) {
    await merk.locator(selector).screenshot({ path: file, ...options });
    console.log(path.relative(process.cwd(), file), fs.statSync(file).size, "bytes");
  }
  // Standaardafbeelding als WebP: eerst PNG, dan in de browser omzetten.
  const png = await merk.locator("#standaard").screenshot({ type: "png" });
  const webp = await merk.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/webp", 0.82);
  }, png.toString("base64"));
  const standaard = path.join(IMG, "designs", "_standaard.webp");
  fs.writeFileSync(standaard, Buffer.from(webp.split(",")[1], "base64"));
  console.log(path.relative(process.cwd(), standaard), fs.statSync(standaard).size, "bytes");
  await browser.close();
})();
