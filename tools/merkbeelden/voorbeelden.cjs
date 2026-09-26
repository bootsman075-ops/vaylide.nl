// Maakt de tegels per gelegenheid en de voorbeeldkaart van de homepage uit de echte
// voorbeelduitnodigingen (fictieve evenementen). Start eerst de ontwikkelserver.
// Gebruik: node tools/merkbeelden/voorbeelden.cjs [basis-url]   (standaard http://127.0.0.1:8000)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.argv[2] || "http://127.0.0.1:8000";
const OUT = path.resolve(__dirname, "../../static/img/site");
// gelegenheid, ontwerp, kleur, openen?
const TILES = [
  ["bruiloft", "liefde-op-papier", "salie", true],
  ["verloving", "puur-moment", "zand", false],
  ["verjaardag", "avondgoud", "nachtblauw", false],
  ["jubileum", "avondgoud", "smaragd", true],
  ["babyshower", "liefde-op-papier", "lavendel", true],
  ["zakelijk", "puur-moment", "inkt", false],
];
const HIDE = ".lp-cover__hint,.lp-cover__music,.ag-cover__hint,.ag-cover__music,.pm-open,.music{display:none!important}";

async function toWebp(page, png, width, height, quality) {
  const data = await page.evaluate(async ([b64, w, h, q]) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/webp", q);
  }, [png.toString("base64"), width, height, quality]);
  return Buffer.from(data.split(",")[1], "base64");
}

async function shoot(context, url, open) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  if (open === "telefoon") {
    // Voorvertoning van het live voorbeeld: precies zoals het in de telefoon staat, dus niets verbergen.
    await page.waitForTimeout(800);
    const png = await page.screenshot({ type: "png" });
    const webp = await toWebp(page, png, 540, 1152, 0.8);
    await page.close();
    return webp;
  }
  if (open) {
    await page.evaluate(() => document.querySelector("[data-open]").click());
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(500);
  const png = await page.screenshot({ type: "png" });
  const size = open === "kaart" ? [500, 800, 0.82] : open === "telefoon" ? [540, 1152, 0.8] : [560, 350, 0.8];
  const webp = await toWebp(page, png, ...size);
  await page.close();
  return webp;
}

(async () => {
  const browser = await chromium.launch();
  // CSP van de voorbeeldpagina's staat geen extra stijlregels toe; alleen voor deze schermafbeeldingen uitgezet.
  const wide = await browser.newContext({ viewport: { width: 720, height: 450 }, reducedMotion: "reduce", bypassCSP: true });
  for (const [occasion, slug, palette, open] of TILES) {
    const file = path.join(OUT, `gelegenheid-${occasion}.webp`);
    fs.writeFileSync(file, await shoot(wide, `${BASE}/voorbeeld/${slug}/?gelegenheid=${occasion}&kleur=${palette}&embed=1`, open));
    console.log(path.relative(process.cwd(), file), fs.statSync(file).size, "bytes");
  }
  const tall = await browser.newContext({ viewport: { width: 400, height: 640 }, deviceScaleFactor: 1.5, reducedMotion: "reduce", bypassCSP: true });
  const card = path.join(OUT, "kaart-voorbeeld.webp");
  fs.writeFileSync(card, await shoot(tall, `${BASE}/voorbeeld/liefde-op-papier/?gelegenheid=bruiloft&kleur=salie&embed=1`, "kaart"));
  console.log(path.relative(process.cwd(), card), fs.statSync(card).size, "bytes");
  // Scherm van de telefoon op de homepage (270 x 576 beeldpunten), als voorvertoning tot het live voorbeeld laadt.
  const phone = await browser.newContext({ viewport: { width: 270, height: 576 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const poster = path.join(OUT, "telefoon-voorbeeld.webp");
  fs.writeFileSync(poster, await shoot(phone, `${BASE}/voorbeeld/liefde-op-papier/?gelegenheid=bruiloft&kleur=blush&embed=1`, "telefoon"));
  console.log(path.relative(process.cwd(), poster), fs.statSync(poster).size, "bytes");
  await browser.close();
})();
