// Maakt een promotiefilmpje van 10 seconden voor een Instagram-post (1080 × 1350, 30 beelden per seconde):
// een telefoon met de voorbeelduitnodiging van Liefde op papier (bruiloft).
//   0 – 2 s   de dichte envelop met het Vaylide-logo
//   2 – 5,8 s een tik op het zegel; de envelop klapt open en de brief springt eruit
//   5,8 – 8,8 s de namen, de datum en de locatie verschijnen; daarna zakt het beeld rustig een stukje
//   8,8 – 10 s eindbeeld: het logo en "Jouw moment begint hier"
// Gebruik (ontwikkelserver op :8000, Playwright met Chromium, ffmpeg):
//   node tools/promo/maak_promo.cjs http://127.0.0.1:8000 uitvoer.mp4 [kleur]
// De beelden komen uit een schermopname van Chromium (CDP-screencast) en worden met ffmpeg samengevoegd.
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const [base = "http://127.0.0.1:8000", out = "vaylide-promo.mp4", kleur = "blush"] = process.argv.slice(2);
const W = 1080, H = 1350, FPS = 30, LENGTH = 10;
const ROOT = path.resolve(__dirname, "..", "..");
const LOGO = path.join(ROOT, "tools", "logo", "vaylide-logo-vrijstaand.png");
const demo = `${base}/voorbeeld/liefde-op-papier/?gelegenheid=bruiloft&kleur=${kleur}&embed=1`;

// De telefoon: 390 × 844 CSS-pixels, vergroot zodat hij het beeld goed vult.
const PHONE_SCALE = 1.36;
const page_html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Vaylide</title><style>
@font-face { font-family: "Cormorant Garamond"; src: url("/static/fonts/cormorant-garamond-latin-wght-italic.woff2") format("woff2"); font-style: italic; font-weight: 300 700; }
@font-face { font-family: "Figtree"; src: url("/static/fonts/figtree-latin-wght-normal.woff2") format("woff2"); font-weight: 300 900; }
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: radial-gradient(ellipse 80% 60% at 50% 45%, #FFFDF9 0%, #F7EFE8 60%, #EEDFD4 100%); font-family: "Figtree", sans-serif; }
.stage { position: absolute; inset: 0; display: grid; place-items: center; }
.phone { position: relative; width: ${390 * PHONE_SCALE + 36}px; height: ${844 * PHONE_SCALE + 36}px; border-radius: 86px; background: #1d1416;
  box-shadow: 0 60px 90px -50px rgba(70, 30, 30, .55), 0 20px 40px -20px rgba(70, 30, 30, .35), inset 0 0 0 3px #3a2c2f;
  opacity: 0; transform: translateY(30px) scale(.97); transition: opacity .5s ease, transform .7s cubic-bezier(.2, .8, .2, 1); }
.phone.in { opacity: 1; transform: none; }
.screen { position: absolute; left: 18px; top: 18px; width: ${390 * PHONE_SCALE}px; height: ${844 * PHONE_SCALE}px; border-radius: 68px; overflow: hidden; background: #FBF5EF; }
.screen iframe { width: 390px; height: 844px; border: 0; transform: scale(${PHONE_SCALE}); transform-origin: 0 0; }
.notch { position: absolute; left: 50%; top: 34px; width: 150px; height: 40px; translate: -50% 0; border-radius: 20px; background: #1d1416; z-index: 2; }
.tap { position: absolute; width: 86px; height: 86px; margin: -43px 0 0 -43px; border-radius: 50%; background: rgba(255, 255, 255, .55);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, .9), 0 6px 18px rgba(60, 20, 20, .25); opacity: 0; z-index: 3; pointer-events: none;
  transition: opacity .25s ease, transform .25s ease; }
.tap.show { opacity: 1; }
.tap.press { transform: scale(.78); }
.tap.gone { opacity: 0; transform: scale(1.5); transition: opacity .5s ease, transform .5s ease; }
.note { position: absolute; left: 0; right: 0; bottom: 22px; text-align: center; font-size: 19px; letter-spacing: .06em; color: rgba(90, 60, 62, .7); }
.end { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 38px; opacity: 0; z-index: 5;
  background: radial-gradient(ellipse 80% 60% at 50% 45%, #FFFDF9 0%, #F7EFE8 60%, #EEDFD4 100%); transition: opacity .7s ease; }
.end.in { opacity: 1; }
.end img { width: 620px; height: auto; opacity: 0; transform: translateY(16px); transition: opacity .8s ease .2s, transform 1s cubic-bezier(.2, .8, .2, 1) .2s; }
.end p { margin: 0; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 66px; color: #6B4A4E; opacity: 0; transform: translateY(12px);
  transition: opacity .8s ease .45s, transform 1s cubic-bezier(.2, .8, .2, 1) .45s; }
.end.in img, .end.in p { opacity: 1; transform: none; }
</style></head><body>
<div class="stage"><div class="phone" id="phone"><div class="notch"></div><div class="screen"><iframe id="inv" src="${demo}"></iframe></div><div class="tap" id="tap"></div></div></div>
<p class="note">Voorbeeld met fictieve namen</p>
<div class="end" id="end"><img src="/__promo__/logo.png" alt="Vaylide"><p>Jouw moment begint hier</p></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route(`${base}/__promo__/`, (r) => r.fulfill({ contentType: "text/html; charset=utf-8", body: page_html }));
  await page.route(`${base}/__promo__/logo.png`, (r) => r.fulfill({ contentType: "image/png", body: fs.readFileSync(LOGO) }));
  await page.goto(`${base}/__promo__/`, { waitUntil: "networkidle" });
  const frame = page.frame({ url: /voorbeeld\/liefde-op-papier/ });
  await frame.waitForSelector(".lp-seal");
  await page.waitForTimeout(1500); // lettertypen en beelden geladen, deeltjes lopen

  // Opname via de screencast van Chromium: elk beeld met de tijd waarop het is getekend.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vaylide-promo-"));
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const file = path.join(dir, `f${String(frames.length).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  const t0 = Date.now();
  const at = (s) => new Promise((r) => setTimeout(r, Math.max(0, s * 1000 - (Date.now() - t0))));

  await page.evaluate(() => document.getElementById("phone").classList.add("in"));
  // Positie van het zegel op het scherm van de telefoon.
  const seal = await frame.evaluate(() => { const r = document.querySelector(".lp-seal").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const scr = await page.evaluate(() => { const r = document.querySelector(".screen").getBoundingClientRect(); return { x: r.x, y: r.y }; });
  const phoneBox = await page.evaluate(() => { const r = document.getElementById("phone").getBoundingClientRect(); return { x: r.x, y: r.y }; });
  await page.evaluate(({ x, y }) => { const t = document.getElementById("tap"); t.style.left = x + "px"; t.style.top = y + "px"; },
    { x: scr.x - phoneBox.x + seal.x * PHONE_SCALE, y: scr.y - phoneBox.y + seal.y * PHONE_SCALE });

  await at(1.45); await page.evaluate(() => document.getElementById("tap").classList.add("show"));
  await at(1.85); await page.evaluate(() => document.getElementById("tap").classList.add("press"));
  await at(2.0);
  await frame.evaluate(() => document.querySelector(".lp-seal").click());
  await page.evaluate(() => document.getElementById("tap").classList.add("gone"));

  await at(6.9);
  await frame.evaluate(async () => {
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    // Zacht omlaag tot de regel met tijd en locatie in het midden staat; namen en datum blijven in beeld.
    const meta = document.querySelector(".lp-hero__meta") || document.querySelector("h1");
    const to = Math.max(0, meta.getBoundingClientRect().top + scrollY - innerHeight * 0.52);
    const from = scrollY, start = performance.now(), ms = 1800;
    await new Promise((done) => { (function step(now) { const k = Math.min(1, (now - start) / ms); scrollTo({ top: from + (to - from) * ease(k), behavior: "instant" }); k < 1 ? requestAnimationFrame(step) : done(); })(start); });
  });
  await at(8.8); await page.evaluate(() => document.getElementById("end").classList.add("in"));
  await at(LENGTH + 0.3);
  await cdp.send("Page.stopScreencast");
  await browser.close();

  // Beelden met hun eigen duur samenvoegen tot een film met een vaste 30 beelden per seconde.
  const first = frames.find((f) => f.t * 1000 >= frames[0].t * 1000) || frames[0];
  const start = first.t;
  let list = "";
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].t - start > LENGTH) break;
    const next = i + 1 < frames.length ? frames[i + 1].t : frames[i].t + 1 / FPS;
    list += `file '${frames[i].file}'\nduration ${Math.max(0.001, next - frames[i].t).toFixed(4)}\n`;
  }
  fs.writeFileSync(path.join(dir, "lijst.txt"), list);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(dir, "lijst.txt"),
    "-vf", `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`, "-t", String(LENGTH),
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-movflags", "+faststart", out], { stdio: "inherit" });
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Klaar: ${out} (${frames.length} opgenomen beelden)`);
})();
