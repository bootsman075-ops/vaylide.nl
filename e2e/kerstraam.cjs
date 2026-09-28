// Contrast van de tekst in het kerstraam van Winterlicht tegen de getekende scène erachter.
// De gewone toegankelijkheidscontrole slaat tekst op een beeld over; deze meet de echte pixels.
// Per regel (kop, namen, gezinsnamen, wens): de tekstkleur tegen de 2% slechtste achtergrondpixels in het vak
// van die regel, zonder de gloed rond de letters, met de lichtjes op volle sterkte (slechtste geval) en zonder sneeuw.
// Eis: 4,5:1, en 3:1 voor grote tekst (vanaf 24 pixels, zoals de namen). De laatste regel geeft de slechtste waarde gedeeld door de eis (1 of meer is goed).
// Gebruik (vanuit de projectmap, server in testmodus):
//   node e2e/kerstraam.cjs http://127.0.0.1:8000 [390x844,360x740,768x1024,1366x900] [extra CSS om iets uit te proberen]
const { chromium } = require("playwright");
const [base = "http://127.0.0.1:8000", sizes = "390x844,360x740,768x1024,1366x900", extraCss = ""] = process.argv.slice(2);
const kleuren = ["kaarslicht", "hulst", "dennengroen", "winternacht"];
(async () => {
  const browser = await chromium.launch();
  let worstAll = 99;
  for (const size of sizes.split(",")) {
    const [w, h] = size.split("x").map(Number);
    for (const kleur of kleuren) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce", bypassCSP: true });
      const p = await ctx.newPage();
      await p.goto(`${base}/voorbeeld/winterlicht/?kleur=${kleur}`, { waitUntil: "networkidle" });
      if (extraCss) await p.addStyleTag({ content: extraCss });
      await p.click(".wl-seal");
      await p.waitForTimeout(900);
      await p.evaluate(() => window.scrollTo(0, 0));
      // 'Minder beweging' verbergt de lichtjes; hier weer tonen, op volle sterkte.
      await p.addStyleTag({ content: ".wl-lights { display: block !important; } .wl-l { opacity: 1 !important; }" });
      const lines = await p.evaluate(() => [...document.querySelectorAll(".wl-hero__kicker, .wl-names, .wl-hero__members, .wl-hero__tagline")].map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const rects = [...r.getClientRects()].filter((q) => q.width > 2).map((q) => [q.left, q.top, q.width, q.height]);
        const cs = getComputedStyle(el);
        const c = cs.color.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3);
        const fs = parseFloat(cs.fontSize);
        return { cls: el.className.split(" ")[0], rects, color: c, large: fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700) };
      }));
      await p.addStyleTag({ content: ".wl-hero__text, .wl-scroll { visibility: hidden !important; }" });
      await p.waitForTimeout(150);
      const shot = await p.screenshot({ type: "png" });
      const res = await p.evaluate(async ([b64, lines]) => {
        const img = new Image();
        img.src = "data:image/png;base64," + b64;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        const lum = ([r, gg, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
        const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
        return lines.map((line) => {
          const ratios = [];
          for (const [x, y, rw, rh] of line.rects) {
            const X = Math.max(0, Math.round(x)), Y = Math.max(0, Math.round(y));
            const W = Math.min(img.width - X, Math.round(rw)), H = Math.min(img.height - Y, Math.round(rh));
            if (W < 1 || H < 1) continue;
            const d = g.getImageData(X, Y, W, H).data;
            for (let i = 0; i < d.length; i += 4) ratios.push(ratio(line.color, [d[i], d[i + 1], d[i + 2]]));
          }
          ratios.sort((a, b) => a - b);
          return { p2: ratios[Math.floor(ratios.length * 0.02)], min: ratios[0] };
        });
      }, [shot.toString("base64"), lines]);
      const out = [];
      lines.forEach((line, i) => {
        const { p2, min } = res[i];
        const need = line.large ? 3 : 4.5;
        worstAll = Math.min(worstAll, p2 / need);
        out.push(`${line.cls.replace("wl-hero__", "").replace("wl-", "")} ${p2.toFixed(2)} (min ${min.toFixed(2)}, nodig ${need})${p2 < need ? " <<<" : ""}`);
      });
      console.log(`${size} ${kleur.padEnd(12)} ${out.join(" | ")}`);
      await ctx.close();
    }
  }
  console.log("slechtste verhouding tegenover de eis (1 of meer is goed):", worstAll.toFixed(2));
  await browser.close();
})();
