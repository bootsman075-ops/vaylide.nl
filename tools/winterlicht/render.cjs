// Tekent de beelden van het kerstontwerp Winterlicht (art.js) en schrijft ze naar designs/winterlicht/v1/img/.
// Ook de plekken van de levende lichtjes (kaarsvlammen, lichtsnoer, ster) komen hieruit: lichtjes.html.
// Gebruik (Node met Playwright en Chromium): node tools/winterlicht/render.cjs [alleen-dit-soort ...]
//   bijvoorbeeld: node tools/winterlicht/render.cjs scene     (alleen de scènes)
// Daarna: .venv/bin/python tools/winterlicht/comprimeer.py (reliëf- en goudbeelden kleiner, zie README.md).
// Let op: designs/winterlicht/v1 is een uitgebrachte ontwerpversie. Nieuwe beelden na de livegang horen in een v2.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.resolve(__dirname, "../../designs/winterlicht/v1/img");
// Voorbeeldbeelden (kerstboom, kaarsen, lichtjes, winterbos) horen bij de voorbeeldkaart, net als de andere demobeelden.
const DEMO = path.resolve(__dirname, "../../static/img/demo");
const PARTIAL = path.resolve(__dirname, "../../designs/winterlicht/v1/lichtjes.html");
const PALETTES = ["kaarslicht", "hulst", "dennengroen", "winternacht"];

// soort, variant (of null), breedte, hoogte, bestandsnaam, kwaliteit
const JOBS = [];
for (const key of PALETTES) {
  JOBS.push(["scene", key, 1080, 1920, `scene-${key}.webp`, 0.84]);
  JOBS.push(["scene", key, 720, 1280, `scene-${key}-720.webp`, 0.8]);
  JOBS.push(["huis", key, 900, 600, `huis-${key}.webp`, 0.84]);
}
for (const [name, w, h] of [["boom", 1200, 1500], ["kaarsen", 1200, 1500], ["lichtjes", 1600, 1100], ["winterbos", 1600, 1100]]) {
  JOBS.push([`foto-${name}`, null, w, h, `demo:kerst-${name}.webp`, 0.8]);
  JOBS.push([`foto-${name}`, null, 1000, Math.round((1000 * h) / w), `demo:kerst-${name}-1000.webp`, 0.8]);
}
for (const [motif, w, h] of [["boven", 1000, 560], ["krans", 700, 700], ["zijkant", 260, 900], ["patroon", 400, 400]]) {
  JOBS.push([`relief-${motif}`, null, w, h, `relief-${motif}.webp`, 0.9]);
  if (motif !== "patroon") JOBS.push([`goud-${motif}`, null, w, h, `goud-${motif}.webp`, 0.86]);
}

// Welke lichtjes een eigen animatie krijgen (en hoeveel): genoeg voor de sfeer, weinig genoeg voor een oude telefoon.
const KEEP = { star: 9, treestar: 9, flame: 9, fairy: 26, tree: 14, lamp: 9, win: 8 };

function pickEvenly(list, n) {
  if (list.length <= n) return list;
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[Math.floor((i * list.length) / n)]);
  return out;
}

function overlayHtml(meta) {
  const byType = {};
  meta.forEach((o) => (byType[o.t] = byType[o.t] || []).push(o));
  const lines = [
    "{# Levende lichtjes op de scène (gemaakt door tools/winterlicht/render.cjs; niet met de hand aanpassen). #}",
    '<div class="wl-lights" aria-hidden="true">',
  ];
  let i = 0;
  for (const type of Object.keys(KEEP)) {
    for (const o of pickEvenly(byType[type] || [], KEEP[type])) {
      const x = ((o.x / 900) * 100).toFixed(2);
      const y = ((o.y / 1600) * 100).toFixed(2);
      const s = ((o.s / 900) * 100).toFixed(2);
      const d = (o.d != null ? o.d : (i * 0.37) % 3).toFixed(2);
      lines.push(`<span class="wl-l wl-l--${type}" style="--x:${x}%;--y:${y}%;--s:${s}%;--d:${d}s"></span>`);
      i++;
    }
  }
  lines.push("</div>");
  return lines.join("\n") + "\n";
}

(async () => {
  const only = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("Fout in art.js:", e.message));
  await page.setContent("<!doctype html><body></body>");
  await page.addScriptTag({ path: path.join(__dirname, "art.js") });
  let overlays = null;
  for (const [kind, key, w, h, name, quality] of JOBS) {
    if (only.length && !only.some((o) => kind.startsWith(o))) continue;
    const res = await page.evaluate(([k, key, w, h, q]) => window.renderWinterlicht(k, key, w, h, "image/webp", q), [kind, key, w, h, quality]);
    const file = name.startsWith("demo:") ? path.join(DEMO, name.slice(5)) : path.join(OUT, name);
    fs.writeFileSync(file, Buffer.from(res.data.split(",")[1], "base64"));
    if (kind === "scene" && !overlays) overlays = res.meta;
    console.log(path.relative(process.cwd(), file), Math.round(fs.statSync(file).size / 1024), "kB");
  }
  if (overlays) {
    fs.writeFileSync(PARTIAL, overlayHtml(overlays));
    console.log(path.relative(process.cwd(), PARTIAL), overlays.length, "lichtjes gevonden");
  }
  await browser.close();
})();
