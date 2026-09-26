// Snelle schermafbeelding: node e2e/shot.cjs <url> <uitvoer.png> [breedte] [hoogte] [actie]
// actie: "open" (tik op het openingsscherm), "open-mid" (screenshot halverwege de animatie), "full" (hele pagina)
const { chromium } = require("playwright");
(async () => {
  const [url, out, w = "390", h = "844", action = ""] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  if (action.startsWith("open")) {
    await page.click("[data-open]", { force: true });
    await page.waitForTimeout(action === "open-mid" ? 1300 : 3200);
  }
  if (action.endsWith("full")) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 80)); }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(1200);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: out, fullPage: action.endsWith("full") });
  console.log(JSON.stringify({ out, overflow, errors }));
  await browser.close();
})();
