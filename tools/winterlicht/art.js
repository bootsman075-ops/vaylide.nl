/* Winterlicht: eigen, getekende beelden voor de kerstkaart (designs/winterlicht/v1/img/).
   Alles wordt hier op een canvas getekend: geen foto's, geen stockbeeld, geen AI-beeld.
   - scene: het kerstraam met guirlande, lantaarns en kaarsen, en buiten een besneeuwd dorp;
   - reliëf: blindgedrukte winterbotanie voor de envelop (licht en schaduw, voor elke papierkleur);
   - huis: het huisje in de sneeuw bij 'Locatie'.
   Gebruikt door render.cjs (zie README.md in deze map). Tekenruimte van de scène: 900 x 1600. */
(function () {
  "use strict";

  const TAU = Math.PI * 2;

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const col = (c) => (typeof c === "string" ? hex(c) : c);
  const mix = (a, b, t) => { a = col(a); b = col(b); return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)); };
  const rgba = (c, a) => { c = col(c); return `rgba(${c[0]},${c[1]},${c[2]},${a == null ? 1 : a})`; };
  const WHITE = [255, 255, 255];
  const BLACK = [0, 0, 0];

  /* ------------------------------------------------------------------ kleuren per variant */
  const PALETTES = {
    kaarslicht: {
      night: false,
      sky: ["#F9F0E4", "#F7E5CF", "#F4D6B4", "#EFC390"],
      glow: "#FFD597",
      stars: 0,
      far: ["#EADCD3", "#DDCBC3"],
      near: ["#F3E8E0", "#E7D8CE"],
      snow: "#FFFAF4", snowShade: "#E2CFC3", snowDeep: "#CDB8AC",
      walls: ["#C98E77", "#E3CDAF", "#A7B09B", "#B9A8B5", "#D8B48C"],
      roof: "#6B4B45",
      win: "#FFC45E", winGlow: "#FFB24A",
      pine: ["#3F5B46", "#2F4938", "#51705A"], pineFar: "#8E9A8C",
      wall: ["#F4E9DA", "#E6D4BE", "#D9C3A8"],
      moulding: ["#FFF9F0", "#EBDCC6", "#CDB392"],
      gold: ["#F1D79B", "#C99C52", "#8E6528"],
      sill: ["#FBF4EA", "#E8D8C3", "#CBB597"],
      garland: ["#2B4633", "#3A5B42", "#1D3326", "#4E7155"],
      red: ["#B42A36", "#8A1826", "#D4545B"],
      berry: "#B3202E",
      wax: ["#FBF4E6", "#EADBC2"],
      frost: 0.55,
      path: "#EBDDD2",
    },
    hulst: {
      night: false,
      sky: ["#F7E6DF", "#F3D4C8", "#EEBFA9", "#E9A986"],
      glow: "#FFC790",
      stars: 0,
      far: ["#DCC4C4", "#CDB0B3"],
      near: ["#F2E3DF", "#E4D0CC"],
      snow: "#FFF8F5", snowShade: "#E5CBC8", snowDeep: "#CFB0AF",
      walls: ["#B86E62", "#E1C9B1", "#9FA595", "#B49AAA", "#D3A886"],
      roof: "#5E3A3B",
      win: "#FFC35C", winGlow: "#FFAA48",
      pine: ["#35523F", "#28412F", "#4A6B53"], pineFar: "#9A8E90",
      wall: ["#7E1C26", "#63131C", "#4B0D14"],
      moulding: ["#E9C98C", "#C29A55", "#8D6427"],
      gold: ["#F3DA9E", "#CFA25A", "#946A2C"],
      sill: ["#F6E7D3", "#DCC4A5", "#B89C78"],
      garland: ["#27432F", "#365A3F", "#1A3124", "#4C7054"],
      red: ["#C43A44", "#8E1B28", "#E0666B"],
      berry: "#D0303C",
      wax: ["#FBF2E2", "#E8D6BA"],
      frost: 0.5,
      path: "#EAD6D2",
    },
    dennengroen: {
      night: true,
      sky: ["#0E2427", "#173537", "#2A4B4A", "#7C6E55"],
      glow: "#F0B56A",
      stars: 90,
      far: ["#2F4B4A", "#243E3D"],
      near: ["#7F9A95", "#617E79"],
      snow: "#CFDDD9", snowShade: "#8FA9A5", snowDeep: "#6F8C88",
      walls: ["#6E4F46", "#8C7C68", "#56655A", "#6A5E6B", "#7D6450"],
      roof: "#2B2522",
      win: "#FFC45A", winGlow: "#FFA83E",
      pine: ["#1F3A2E", "#172E24", "#2E4C3C"], pineFar: "#284440",
      wall: ["#1B3A31", "#132C25", "#0C1F1A"],
      moulding: ["#E6C88A", "#BE9651", "#80592A"],
      gold: ["#F2D89C", "#C99C52", "#8E6528"],
      sill: ["#2D4A3F", "#223A31", "#162821"],
      garland: ["#24402F", "#335A40", "#162B20", "#46705A"],
      red: ["#B8303B", "#861A25", "#D65560"],
      berry: "#C92A36",
      wax: ["#FBF2E2", "#E3CFB0"],
      frost: 0.35,
      path: "#B6C9C5",
    },
    winternacht: {
      night: true,
      sky: ["#0A1330", "#14224A", "#26396A", "#6A6286"],
      glow: "#F3B872",
      stars: 150,
      far: ["#2B3A68", "#223059"],
      near: ["#8190B6", "#65759F"],
      snow: "#CDD6EA", snowShade: "#8E9CC2", snowDeep: "#7382AC",
      walls: ["#6A4E55", "#857C7E", "#4F5B6E", "#6B5F78", "#7A6352"],
      roof: "#26243A",
      win: "#FFC65E", winGlow: "#FFAB42",
      pine: ["#1C3533", "#142826", "#2A4644"], pineFar: "#253258",
      wall: ["#16244A", "#0F1B3A", "#0A132B"],
      moulding: ["#E8CD95", "#C09A58", "#84602F"],
      gold: ["#F4DCA3", "#CCA05A", "#906A2E"],
      sill: ["#223465", "#1A2952", "#121E3E"],
      garland: ["#22402F", "#315A41", "#152A1F", "#44705A"],
      red: ["#BC3340", "#861B27", "#DA5A64"],
      berry: "#CD2D3A",
      wax: ["#FBF2E2", "#E3CFB0"],
      frost: 0.3,
      path: "#BAC5DE",
    },
  };

  /* ------------------------------------------------------------------ geometrie van de scène */
  const G = {
    W: 900, H: 1600,
    cx: 450, spring: 600, R: 330,        // binnenkant van de boog
    sill: 1326,                          // bovenkant vensterbank
    horizon: 1000,
  };
  function archPath(ctx, grow, append) {
    const R = G.R + (grow || 0);
    if (!append) ctx.beginPath();
    ctx.moveTo(G.cx - R, G.sill + 2);
    ctx.lineTo(G.cx - R, G.spring);
    ctx.arc(G.cx, G.spring, R, Math.PI, 0);
    ctx.lineTo(G.cx + R, G.sill + 2);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------ hulpjes */
  function glow(ctx, x, y, r, color, alpha, mode) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(0.35, rgba(color, alpha * 0.45));
    g.addColorStop(1, rgba(color, 0));
    ctx.save();
    if (mode) ctx.globalCompositeOperation = mode;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function noiseCanvas(w, h, seed, alpha) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const img = g.createImageData(w, h);
    const r = rng(seed);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255 * alpha;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function grain(ctx, W, H, amount, seed) {
    const n = noiseCanvas(Math.ceil(W), Math.ceil(H), seed || 7, 1);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = amount;
    ctx.globalCompositeOperation = "soft-light";
    ctx.drawImage(n, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  /* ------------------------------------------------------------------ lucht en sterren */
  function sky(ctx, p, r) {
    const g = ctx.createLinearGradient(0, G.spring - G.R, 0, G.horizon);
    g.addColorStop(0, rgba(p.sky[0]));
    g.addColorStop(0.42, rgba(p.sky[1]));
    g.addColorStop(0.78, rgba(p.sky[2]));
    g.addColorStop(1, rgba(p.sky[3]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, G.W, G.sill + 10);
    // Warme gloed van het dorp en de laatste zon.
    glow(ctx, G.cx, G.horizon - 40, 520, p.glow, p.night ? 0.42 : 0.55);
    glow(ctx, G.cx + 40, G.horizon - 90, 260, mix(p.glow, WHITE, 0.4), p.night ? 0.25 : 0.4);
    // Zachte wolkenbanden.
    ctx.save();
    ctx.filter = "blur(18px)";
    for (let i = 0; i < 7; i++) {
      const y = 760 + r() * 180;
      const x = 150 + r() * 600;
      ctx.fillStyle = rgba(p.night ? mix(p.sky[2], WHITE, 0.08) : mix(p.sky[1], WHITE, 0.5), p.night ? 0.22 : 0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, 120 + r() * 160, 10 + r() * 14, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    if (p.stars) {
      r = rng(4242);
      for (let i = 0; i < p.stars; i++) {
        const x = 110 + r() * 680;
        const y = 250 + Math.pow(r(), 1.4) * 620;
        const s = r() < 0.08 ? 1.6 + r() * 1.2 : 0.5 + r() * 0.9;
        const a = 0.35 + r() * 0.6;
        ctx.fillStyle = rgba(mix("#FFF6E0", "#DDE6FF", r()), a * (1 - (y - 250) / 900));
        ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
        if (s > 1.6) glow(ctx, x, y, s * 6, "#FFF4DC", 0.25);
      }
    }
  }

  function christmasStar(ctx, x, y, size, p, ov) {
    glow(ctx, x, y, size * 7, mix(p.glow, WHITE, 0.55), p.night ? 0.55 : 0.6);
    glow(ctx, x, y, size * 2.4, WHITE, 0.9);
    ctx.save();
    ctx.translate(x, y);
    const rays = (len, width, angle, alpha) => {
      ctx.save();
      ctx.rotate(angle);
      const g = ctx.createLinearGradient(0, -len, 0, len);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,252,240,${alpha})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -len); ctx.lineTo(width, 0); ctx.lineTo(0, len); ctx.lineTo(-width, 0); ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    rays(size * 5.2, size * 0.34, 0, 0.95);
    rays(size * 3.4, size * 0.3, Math.PI / 2, 0.9);
    rays(size * 1.8, size * 0.18, Math.PI / 4, 0.7);
    rays(size * 1.8, size * 0.18, -Math.PI / 4, 0.7);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.arc(0, 0, size * 0.42, 0, TAU); ctx.fill();
    ctx.restore();
    ov.push({ t: "star", x, y, s: size * 9 });
  }

  /* ------------------------------------------------------------------ dennen */
  function pine(ctx, r, x, base, h, w, p, opt) {
    opt = opt || {};
    const tiers = opt.tiers || Math.max(4, Math.round(h / 38));
    const snowAmt = opt.snow == null ? 1 : opt.snow;
    const dark = mix(p.pine[1], opt.tint || p.pine[1], 0.5);
    const tone = opt.far ? [col(p.pineFar), mix(p.pineFar, BLACK, 0.12), mix(p.pineFar, WHITE, 0.15)] : [col(p.pine[0]), col(dark), col(p.pine[2])];
    // Stam.
    ctx.fillStyle = rgba(opt.far ? mix(p.pineFar, BLACK, 0.2) : "#3A2A20");
    ctx.fillRect(x - w * 0.045, base - h * 0.12, w * 0.09, h * 0.14);
    for (let t = 0; t < tiers; t++) {
      const k = t / (tiers - 1);
      const ty = base - h * 0.08 - k * h * 0.86;        // onderkant van de laag
      const tw = w * (1 - k * 0.82) * (0.92 + r() * 0.12);
      const th = h * 0.26 * (1 - k * 0.35);
      const top = ty - th;
      // Laag als hangende takken met gerafelde rand.
      ctx.beginPath();
      ctx.moveTo(x, top);
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const px = x + tw / 2 * u + (r() - 0.5) * 3;
        const py = top + th * (0.25 + 0.75 * Math.pow(u, 0.8)) + (i % 2 ? -th * 0.12 : th * 0.06);
        ctx.lineTo(px, py);
      }
      for (let i = n; i >= 0; i--) {
        const u = i / n;
        const px = x - tw / 2 * u + (r() - 0.5) * 3;
        const py = top + th * (0.25 + 0.75 * Math.pow(u, 0.8)) + (i % 2 ? -th * 0.12 : th * 0.06);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0);
      g.addColorStop(0, rgba(tone[2]));
      g.addColorStop(0.45, rgba(tone[0]));
      g.addColorStop(1, rgba(tone[1]));
      ctx.fillStyle = g;
      ctx.fill();
      // Naaldjes langs de onderrand.
      if (!opt.far && w > 60) {
        ctx.strokeStyle = rgba(mix(tone[0], WHITE, 0.12), 0.55);
        ctx.lineWidth = Math.max(0.8, w / 180);
        for (let i = 0; i < tw / 3; i++) {
          const u = (r() - 0.5);
          const px = x + u * tw;
          const py = top + th * (0.3 + 0.7 * Math.abs(u * 2)) - r() * th * 0.25;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (u * 6) + (r() - 0.5) * 3, py + 4 + r() * 5); ctx.stroke();
        }
      }
      // Sneeuw op de laag: zachte kapjes.
      if (snowAmt > 0) {
        const bumps = Math.max(2, Math.round(tw / 9));
        for (let i = 0; i < bumps; i++) {
          const u = (i + 0.5) / bumps - 0.5;
          const px = x + u * tw * 0.8;
          const py = top + th * (0.3 + 0.6 * Math.pow(Math.abs(u * 2), 0.9));
          const rad = Math.max(1.5, tw / bumps * 0.62) * snowAmt;
          ctx.fillStyle = rgba(p.snow);
          ctx.beginPath(); ctx.ellipse(px, py - rad * 0.2, rad, rad * 0.55, 0, 0, TAU); ctx.fill();
        }
      }
    }
    // Top.
    ctx.fillStyle = rgba(snowAmt > 0 ? p.snow : tone[0]);
    ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x + w * 0.05, base - h * 0.9); ctx.lineTo(x - w * 0.05, base - h * 0.9); ctx.closePath(); ctx.fill();
  }

  /* Weelderige den: per tak eerst een donkere massa, dan naaldjes met lichte puntjes, dan wat sneeuw. */
  function lushPine(ctx, r, x, base, h, w, p, opt) {
    opt = opt || {};
    const tiers = opt.tiers || Math.max(6, Math.round(h / 34));
    const snow = opt.snow == null ? 1 : opt.snow;
    const light = mix(p.pine[2], WHITE, 0.1), mid = col(p.pine[0]), deep = mix(p.pine[1], BLACK, 0.2);
    ctx.fillStyle = rgba(mix("#3A2A20", p.pine[1], 0.3));
    ctx.fillRect(x - w * 0.03, base - h * 0.14, w * 0.06, h * 0.16);
    ctx.save();
    ctx.filter = "blur(6px)";
    ctx.fillStyle = rgba(p.snowShade, 0.7);
    ctx.beginPath(); ctx.ellipse(x + w * 0.08, base + 2, w * 0.55, h * 0.03, 0, 0, TAU); ctx.fill();
    ctx.restore();
    const branches = [];
    for (let t = 0; t < tiers; t++) {
      const k = t / (tiers - 1);
      const y = base - h * 0.1 - Math.pow(k, 0.95) * h * 0.84;
      const half = (w / 2) * (1 - k * 0.88) * (0.92 + r() * 0.14);
      for (let side = -1; side <= 1; side += 2) {
        branches.push({ k, side, y: y + (r() - 0.5) * 3, reach: half * (0.95 + r() * 0.12), back: false });
        branches.push({ k: k + 0.01, side, y: y - h * 0.02, reach: half * 0.7, back: true });
      }
      branches.push({ k, side: 0, y: y - h * 0.01, reach: half * 0.55, back: false });
    }
    branches.sort((a, b) => (a.back === b.back ? a.k - b.k : a.back ? -1 : 1));
    const shadeFor = (br, t) => {
      const base = t < 0.33 ? light : t < 0.7 ? mid : deep;
      let m = mix(base, BLACK, (br.back ? 0.22 : 0) + (br.side > 0 ? 0.1 : 0));
      if (opt.dim) m = mix(m, p.sky[3], opt.dim);
      return m;
    };
    branches.forEach((br) => {
      const dir = br.side === 0 ? (r() < 0.5 ? -0.25 : 0.25) : br.side;
      const x0 = x, y0 = br.y - br.reach * 0.05;
      const x2 = x + dir * br.reach, y2 = br.y + br.reach * (0.28 + r() * 0.1);
      const cx1 = x + dir * br.reach * 0.5, cy1 = br.y - br.reach * 0.12;
      const pt = (u) => {
        const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
        return [a * x0 + b * cx1 + c * x2, a * y0 + b * cy1 + c * y2];
      };
      const size = Math.max(5, br.reach * 0.3 + h * 0.012);
      // Massa.
      ctx.fillStyle = rgba(shadeFor(br, 0.8));
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const [px, py] = pt(i / 12);
        const wd = size * 0.55 * (1 - i / 14);
        if (i === 0) ctx.moveTo(px, py - wd * 0.4); else ctx.lineTo(px, py - wd * 0.4);
      }
      for (let i = 12; i >= 0; i--) {
        const [px, py] = pt(i / 12);
        const wd = size * 0.55 * (1 - i / 14);
        ctx.lineTo(px, py + wd);
      }
      ctx.closePath();
      ctx.fill();
      // Naaldjes.
      const n = Math.round(br.reach / 1.1) + 4;
      for (let i = 0; i < n; i++) {
        const u = Math.pow(i / n, 0.9);
        const [px, py] = pt(u);
        const len = size * (1 - u * 0.5) * (0.55 + r() * 0.55);
        const tilt = Math.atan2(y2 - y0, x2 - x0);
        const sideA = r() < 0.5 ? -1 : 1;
        const a = tilt + sideA * (0.5 + r() * 0.7);
        const t = sideA < 0 ? r() * 0.5 : 0.3 + r() * 0.7;
        ctx.strokeStyle = rgba(shadeFor(br, t));
        ctx.lineWidth = Math.max(1, size * 0.08) * (0.7 + r() * 0.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + Math.cos(a) * len * 0.5, py + Math.sin(a) * len * 0.5, px + Math.cos(a) * len * 0.9, py + Math.sin(a) * len * 0.9 + len * 0.35);
        ctx.stroke();
      }
      // Sneeuw: een paar kussens op de bovenkant.
      if (snow > 0 && !br.back && br.side !== 0) {
        const count = 2 + Math.floor(r() * 3);
        for (let i = 0; i < count; i++) {
          const u = 0.18 + (i / count) * 0.62 + r() * 0.08;
          const [px, py] = pt(u);
          const rad = size * 0.3 * (1 - u * 0.5) * snow * (0.8 + r() * 0.5);
          ctx.fillStyle = rgba(p.snowShade, 0.85);
          ctx.beginPath(); ctx.ellipse(px, py - size * 0.12 + rad * 0.35, rad * 1.3, rad * 0.5, 0, 0, TAU); ctx.fill();
          const g = ctx.createLinearGradient(0, py - rad - size * 0.12, 0, py);
          g.addColorStop(0, rgba(mix(p.snow, WHITE, 0.5)));
          g.addColorStop(1, rgba(p.snow));
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(px, py - size * 0.14, rad * 1.2, rad * 0.46, Math.atan2(y2 - y0, x2 - x0) * 0.4, 0, TAU); ctx.fill();
        }
      }
    });
    const tipY = base - h;
    ctx.fillStyle = rgba(mid);
    ctx.beginPath(); ctx.moveTo(x, tipY); ctx.lineTo(x + w * 0.05, tipY + h * 0.08); ctx.lineTo(x - w * 0.05, tipY + h * 0.08); ctx.closePath(); ctx.fill();
    if (snow > 0) {
      ctx.fillStyle = rgba(p.snow);
      ctx.beginPath(); ctx.ellipse(x, tipY + h * 0.03, w * 0.025, h * 0.012, 0, 0, TAU); ctx.fill();
    }
  }

  /* ------------------------------------------------------------------ heuvels en dorp */
  function ridge(ctx, r, y, amp, color, blur, trees, p) {
    ctx.save();
    if (blur) ctx.filter = `blur(${blur}px)`;
    const pts = [];
    for (let x = 60; x <= 840; x += 20) pts.push([x, y + Math.sin(x / 110 + r() * 0.6) * amp + (r() - 0.5) * amp * 0.4]);
    ctx.beginPath();
    ctx.moveTo(60, G.sill);
    pts.forEach(([x, yy]) => ctx.lineTo(x, yy));
    ctx.lineTo(840, G.sill);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y - amp, 0, y + 140);
    g.addColorStop(0, rgba(color[0]));
    g.addColorStop(1, rgba(color[1]));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    if (trees) {
      pts.forEach(([x, yy], i) => {
        if (r() < trees) {
          const h = 10 + r() * 16;
          pine(ctx, r, x + (r() - 0.5) * 16, yy + 3, h, h * 0.5, p, { far: true, snow: 0.6, tiers: 3 });
        }
      });
    }
    return pts;
  }

  function house(ctx, r, x, base, w, h, p, ov, opt) {
    opt = opt || {};
    const wall = mix(pickFrom(r, p.walls), p.night ? BLACK : WHITE, p.night ? 0.25 : 0.05);
    const roofH = w * (0.45 + r() * 0.2);
    // Muur.
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, rgba(mix(wall, WHITE, 0.12)));
    g.addColorStop(1, rgba(mix(wall, BLACK, 0.18)));
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, base - h, w, h);
    // Schoorsteen.
    if (r() < 0.7) {
      const cx = x + (r() < 0.5 ? -1 : 1) * w * 0.22;
      ctx.fillStyle = rgba(mix(p.roof, WHITE, 0.1));
      ctx.fillRect(cx - w * 0.06, base - h - roofH * 0.8, w * 0.12, roofH * 0.55);
      ctx.fillStyle = rgba(p.snow);
      ctx.fillRect(cx - w * 0.075, base - h - roofH * 0.8 - 3, w * 0.15, 4);
      // Rook.
      ctx.save();
      ctx.filter = "blur(5px)";
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = rgba(p.night ? "#C9D2D6" : "#FFFFFF", 0.28 - i * 0.045);
        ctx.beginPath();
        ctx.ellipse(cx + i * 5 + Math.sin(i) * 4, base - h - roofH * 0.9 - i * 13, 5 + i * 2.2, 6 + i * 2, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    // Dak met sneeuw.
    ctx.fillStyle = rgba(p.roof);
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 4, base - h + 1);
    ctx.lineTo(x, base - h - roofH);
    ctx.lineTo(x + w / 2 + 4, base - h + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(p.snow);
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 5, base - h - 2);
    ctx.lineTo(x, base - h - roofH - 3);
    ctx.lineTo(x + w / 2 + 5, base - h - 2);
    const drips = 6;
    for (let i = drips; i >= 0; i--) {
      const u = i / drips;
      ctx.lineTo(x - w / 2 - 3 + u * (w + 6), base - h + 3 + (i % 2) * 3 + r() * 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(p.snowShade, 0.7);
    ctx.beginPath();
    ctx.moveTo(x, base - h - roofH - 1);
    ctx.lineTo(x + w / 2 + 5, base - h - 1);
    ctx.lineTo(x + w / 2 + 2, base - h + 3);
    ctx.lineTo(x, base - h - roofH + roofH * 0.35);
    ctx.closePath();
    ctx.fill();
    // Ramen met licht.
    const rows = h > 34 ? 2 : 1;
    const cols = Math.max(1, Math.round(w / 22));
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        if (r() < 0.28) continue;
        const wx = x - w / 2 + (cc + 0.5) * (w / cols);
        const wy = base - h + h * (rows === 2 ? (rr === 0 ? 0.22 : 0.58) : 0.35);
        const ww = Math.min(8, w / cols * 0.42), wh = ww * 1.25;
        glow(ctx, wx, wy + wh / 2, ww * 4.2, p.winGlow, p.night ? 0.55 : 0.32);
        ctx.fillStyle = rgba(p.win);
        ctx.fillRect(wx - ww / 2, wy, ww, wh);
        ctx.fillStyle = rgba(mix(p.win, WHITE, 0.55), 0.8);
        ctx.fillRect(wx - ww / 2, wy, ww, wh * 0.35);
        ctx.strokeStyle = rgba(mix(wall, BLACK, 0.35), 0.8);
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + wh); ctx.moveTo(wx - ww / 2, wy + wh / 2); ctx.lineTo(wx + ww / 2, wy + wh / 2); ctx.stroke();
        if (opt.overlay !== false && r() < 0.55) ov.push({ t: "win", x: wx, y: wy + wh / 2, s: ww * 5 });
      }
    }
    // Deur met krans.
    if (w > 34 && r() < 0.8) {
      const dx = x + (r() - 0.5) * w * 0.3;
      ctx.fillStyle = rgba(mix(p.roof, BLACK, 0.1));
      ctx.fillRect(dx - 5, base - 15, 10, 15);
      ctx.strokeStyle = rgba(p.garland[1]);
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(dx, base - 9, 3, 0, TAU); ctx.stroke();
      ctx.fillStyle = rgba(p.berry);
      ctx.beginPath(); ctx.arc(dx, base - 6.5, 1.1, 0, TAU); ctx.fill();
    }
    // Lichtsnoer langs de dakrand bij sommige huizen.
    if (opt.lights) {
      const colors = [p.win, p.red[2], "#FFFFFF", p.gold[0]];
      for (let i = 0; i <= 8; i++) {
        const u = i / 8;
        const lx = x - w / 2 - 3 + u * (w + 6);
        const ly = base - h + 5 + Math.sin(u * Math.PI * 4) * 1.2;
        glow(ctx, lx, ly, 4, colors[i % 4], 0.8);
        ctx.fillStyle = rgba(mix(colors[i % 4], WHITE, 0.3));
        ctx.beginPath(); ctx.arc(lx, ly, 0.9, 0, TAU); ctx.fill();
      }
      ov.push({ t: "tree", x, y: base - h + 5, s: w * 0.9, d: r() * 2 });
    }
    // Sneeuw tegen de gevel.
    ctx.fillStyle = rgba(p.snow);
    ctx.beginPath();
    ctx.ellipse(x, base + 1, w * 0.62, 5, 0, 0, TAU);
    ctx.fill();
  }

  function pickFrom(r, list) { return list[Math.floor(r() * list.length)]; }

  function church(ctx, x, base, p, ov) {
    const wall = mix(p.walls[1], p.night ? BLACK : WHITE, p.night ? 0.3 : 0.12);
    const bw = 76, bh = 62;
    // Schip.
    let g = ctx.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
    g.addColorStop(0, rgba(mix(wall, WHITE, 0.15)));
    g.addColorStop(1, rgba(mix(wall, BLACK, 0.2)));
    ctx.fillStyle = g;
    ctx.fillRect(x - bw / 2, base - bh, bw, bh);
    ctx.fillStyle = rgba(p.roof);
    ctx.beginPath(); ctx.moveTo(x - bw / 2 - 5, base - bh + 1); ctx.lineTo(x, base - bh - 34); ctx.lineTo(x + bw / 2 + 5, base - bh + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(p.snow);
    ctx.beginPath(); ctx.moveTo(x - bw / 2 - 6, base - bh - 1); ctx.lineTo(x, base - bh - 37); ctx.lineTo(x + bw / 2 + 6, base - bh - 1); ctx.lineTo(x + bw / 2 + 3, base - bh + 4); ctx.lineTo(x, base - bh - 30); ctx.lineTo(x - bw / 2 - 3, base - bh + 4); ctx.closePath(); ctx.fill();
    // Toren.
    const tw = 30, tTop = base - bh - 70;
    g = ctx.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0);
    g.addColorStop(0, rgba(mix(wall, WHITE, 0.2)));
    g.addColorStop(1, rgba(mix(wall, BLACK, 0.22)));
    ctx.fillStyle = g;
    ctx.fillRect(x - tw / 2, tTop, tw, base - tTop);
    // Spits.
    ctx.fillStyle = rgba(p.roof);
    ctx.beginPath(); ctx.moveTo(x - tw / 2 - 3, tTop + 1); ctx.lineTo(x, tTop - 78); ctx.lineTo(x + tw / 2 + 3, tTop + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(p.snow, 0.95);
    ctx.beginPath(); ctx.moveTo(x - tw / 2 - 4, tTop + 1); ctx.lineTo(x, tTop - 80); ctx.lineTo(x - 3, tTop - 40); ctx.lineTo(x - tw / 2 + 2, tTop + 4); ctx.closePath(); ctx.fill();
    // Bolletje op de spits.
    ctx.fillStyle = rgba(p.gold[1]);
    ctx.beginPath(); ctx.arc(x, tTop - 82, 2.6, 0, TAU); ctx.fill();
    // Wijzerplaat en ramen.
    ctx.fillStyle = rgba(mix(p.win, WHITE, 0.4));
    ctx.beginPath(); ctx.arc(x, tTop + 18, 6.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(p.roof); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, tTop + 18); ctx.lineTo(x, tTop + 13.5); ctx.moveTo(x, tTop + 18); ctx.lineTo(x + 3.5, tTop + 19); ctx.stroke();
    glow(ctx, x, tTop + 18, 26, p.winGlow, p.night ? 0.4 : 0.25);
    const arches = [[x - 25, base - bh + 16], [x + 25, base - bh + 16], [x, tTop + 40]];
    arches.forEach(([ax, ay], i) => {
      glow(ctx, ax, ay + 8, 30, p.winGlow, p.night ? 0.55 : 0.32);
      ctx.fillStyle = rgba(p.win);
      ctx.beginPath(); ctx.moveTo(ax - 5, ay + 18); ctx.lineTo(ax - 5, ay + 5); ctx.arc(ax, ay + 5, 5, Math.PI, 0); ctx.lineTo(ax + 5, ay + 18); ctx.closePath(); ctx.fill();
      ov.push({ t: "win", x: ax, y: ay + 10, s: 42 });
    });
    // Deur.
    glow(ctx, x, base - 10, 34, p.winGlow, p.night ? 0.5 : 0.3);
    ctx.fillStyle = rgba(mix(p.win, "#E38A2F", 0.3));
    ctx.beginPath(); ctx.moveTo(x - 7, base); ctx.lineTo(x - 7, base - 14); ctx.arc(x, base - 14, 7, Math.PI, 0); ctx.lineTo(x + 7, base); ctx.closePath(); ctx.fill();
    return tTop - 82;
  }

  /* De grote kerstboom op het plein. */
  function bigTree(ctx, r, x, base, h, p, ov) {
    lushPine(ctx, r, x, base, h, h * 0.62, p, { tiers: 8, snow: 0.45 });
    // Lichtjes in slingers.
    const lights = [];
    for (let s = 0; s < 6; s++) {
      const k0 = 0.12 + s * 0.13;
      for (let i = 0; i < 9; i++) {
        const u = i / 8;
        const k = k0 + u * 0.1;
        const y = base - h * 0.1 - k * h * 0.8;
        const half = h * 0.62 * (1 - k * 0.86) * 0.46;
        const lx = x - half + u * half * 2;
        const ly = y + Math.sin(u * Math.PI) * 6;
        lights.push([lx, ly]);
      }
    }
    lights.forEach(([lx, ly], i) => {
      const c = [p.win, "#FFE7B0", p.red[2], "#FFFFFF"][i % 4];
      glow(ctx, lx, ly, 7, c, 0.6);
      ctx.fillStyle = rgba(mix(c, WHITE, 0.4));
      ctx.beginPath(); ctx.arc(lx, ly, 1.5, 0, TAU); ctx.fill();
      if (i % 2 === 0) ov.push({ t: "tree", x: lx, y: ly, s: 16, d: (i * 0.37) % 3 });
    });
    // Ballen.
    for (let i = 0; i < 16; i++) {
      const k = 0.1 + r() * 0.75;
      const y = base - h * 0.1 - k * h * 0.86 + 6;
      const half = h * 0.62 * (1 - k * 0.82) * 0.42;
      const bx = x + (r() - 0.5) * half * 2;
      const c = [p.red[0], p.gold[1], p.red[1], p.gold[0]][i % 4];
      bauble(ctx, bx, y, 2.6 + r() * 1.2, c);
    }
    // Ster in de top.
    glow(ctx, x, base - h - 4, 34, p.win, 0.7);
    starShape(ctx, x, base - h - 4, 9, 4, rgba(mix(p.gold[0], WHITE, 0.3)));
    ov.push({ t: "treestar", x, y: base - h - 4, s: 70 });
  }

  function starShape(ctx, x, y, R, r, fill) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 ? r : R;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function bauble(ctx, x, y, rad, c) {
    const g = ctx.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.1, x, y, rad);
    g.addColorStop(0, rgba(mix(c, WHITE, 0.7)));
    g.addColorStop(0.35, rgba(c));
    g.addColorStop(1, rgba(mix(c, BLACK, 0.35)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
  }

  /* Straatlantaarn langs het pad. */
  function lamp(ctx, x, base, h, p, ov) {
    ctx.strokeStyle = rgba(p.night ? "#1D1E22" : "#3B332E");
    ctx.lineWidth = Math.max(1.2, h / 42);
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - h); ctx.stroke();
    const s = h / 9;
    glow(ctx, x, base - h - s * 0.2, s * 9, p.winGlow, p.night ? 0.55 : 0.4);
    ctx.fillStyle = rgba(p.night ? "#1D1E22" : "#3B332E");
    ctx.beginPath(); ctx.moveTo(x - s * 0.9, base - h - s * 1.3); ctx.lineTo(x + s * 0.9, base - h - s * 1.3); ctx.lineTo(x, base - h - s * 2.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(mix(p.win, WHITE, 0.35));
    ctx.fillRect(x - s * 0.62, base - h - s * 1.25, s * 1.24, s * 1.3);
    ctx.fillStyle = rgba(p.snow);
    ctx.fillRect(x - s, base - h - s * 1.5, s * 2, s * 0.28);
    ov.push({ t: "lamp", x, y: base - h - s * 0.6, s: s * 10 });
    ctx.save();
    ctx.globalCompositeOperation = p.night ? "screen" : "soft-light";
    ctx.fillStyle = (() => {
      const g = ctx.createRadialGradient(x, base, 0, x, base, h * 0.9);
      g.addColorStop(0, rgba(p.winGlow, p.night ? 0.3 : 0.45));
      g.addColorStop(1, rgba(p.winGlow, 0));
      return g;
    })();
    ctx.beginPath(); ctx.ellipse(x, base, h * 0.9, h * 0.22, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* Hekje met sneeuw op de palen en latten (x/y van begin en eind, grootte neemt af met de afstand). */
  function fence(ctx, r, x1, y1, x2, y2, posts, s1, s2, p) {
    const wood = p.night ? "#4A3A30" : "#8A6A52";
    const pts = [];
    for (let i = 0; i < posts; i++) {
      const u = i / (posts - 1);
      pts.push([x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * 6, s1 + (s2 - s1) * u]);
    }
    [0.35, 0.7].forEach((k) => {
      ctx.strokeStyle = rgba(wood);
      ctx.beginPath();
      pts.forEach(([x, y, s], i) => { const yy = y - s * k; if (i) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); });
      ctx.lineWidth = Math.max(1, s1 * 0.07);
      ctx.stroke();
      ctx.strokeStyle = rgba(p.snow);
      ctx.lineWidth = Math.max(0.8, s1 * 0.05);
      ctx.beginPath();
      pts.forEach(([x, y, s], i) => { const yy = y - s * k - s * 0.05; if (i) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); });
      ctx.stroke();
    });
    pts.forEach(([x, y, s]) => {
      ctx.fillStyle = rgba(wood);
      ctx.fillRect(x - s * 0.05, y - s, s * 0.1, s);
      ctx.fillStyle = rgba(p.snow);
      ctx.beginPath(); ctx.ellipse(x, y - s, s * 0.09, s * 0.05, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(p.snow);
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.2, s * 0.06, 0, 0, TAU); ctx.fill();
    });
  }

  /* Sneeuwpop met sjaal en hoed. */
  function snowman(ctx, x, base, s, p) {
    ctx.save();
    ctx.filter = "blur(3px)";
    ctx.fillStyle = rgba(p.snowShade, 0.8);
    ctx.beginPath(); ctx.ellipse(x + s * 0.12, base + 1, s * 0.32, s * 0.06, 0, 0, TAU); ctx.fill();
    ctx.restore();
    const ball = (cx, cy, rad) => {
      const g = ctx.createRadialGradient(cx - rad * 0.35, cy - rad * 0.4, rad * 0.1, cx, cy, rad);
      g.addColorStop(0, rgba(mix(p.snow, WHITE, 0.7)));
      g.addColorStop(0.7, rgba(p.snow));
      g.addColorStop(1, rgba(p.snowShade));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.fill();
    };
    ball(x, base - s * 0.2, s * 0.22);
    ball(x, base - s * 0.52, s * 0.16);
    ball(x, base - s * 0.76, s * 0.12);
    // Sjaal.
    ctx.fillStyle = rgba(p.red[0]);
    ctx.beginPath(); ctx.ellipse(x, base - s * 0.645, s * 0.13, s * 0.035, 0, 0, TAU); ctx.fill();
    ctx.fillRect(x + s * 0.03, base - s * 0.65, s * 0.05, s * 0.2);
    ctx.fillStyle = rgba(p.red[1]);
    ctx.fillRect(x + s * 0.03, base - s * 0.47, s * 0.05, s * 0.025);
    // Hoed.
    ctx.fillStyle = rgba("#2A2522");
    ctx.fillRect(x - s * 0.12, base - s * 0.88, s * 0.24, s * 0.025);
    ctx.fillRect(x - s * 0.08, base - s * 1.02, s * 0.16, s * 0.14);
    ctx.fillStyle = rgba(p.red[0]);
    ctx.fillRect(x - s * 0.08, base - s * 0.915, s * 0.16, s * 0.025);
    // Gezicht en knopen.
    ctx.fillStyle = rgba("#2A2522");
    [[-0.04, -0.79], [0.04, -0.79], [0, -0.55], [0, -0.48], [0, -0.3]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx * s, base + dy * s, s * 0.013, 0, TAU); ctx.fill();
    });
    ctx.fillStyle = rgba("#E0762B");
    ctx.beginPath(); ctx.moveTo(x, base - s * 0.765); ctx.lineTo(x + s * 0.09, base - s * 0.75); ctx.lineTo(x, base - s * 0.74); ctx.closePath(); ctx.fill();
    // Takjes als armen.
    ctx.strokeStyle = rgba("#5A4030");
    ctx.lineWidth = Math.max(1, s * 0.018);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.14, base - s * 0.55); ctx.lineTo(x - s * 0.34, base - s * 0.68); ctx.moveTo(x - s * 0.28, base - s * 0.64); ctx.lineTo(x - s * 0.32, base - s * 0.74);
    ctx.moveTo(x + s * 0.14, base - s * 0.55); ctx.lineTo(x + s * 0.33, base - s * 0.62);
    ctx.stroke();
  }

  /* Slee met een cadeautje. */
  function sled(ctx, x, base, s, p) {
    ctx.save();
    ctx.filter = "blur(3px)";
    ctx.fillStyle = rgba(p.snowShade, 0.8);
    ctx.beginPath(); ctx.ellipse(x, base + 2, s * 0.6, s * 0.08, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = rgba(p.night ? "#9A8A70" : "#6B4A32");
    ctx.lineWidth = s * 0.04;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, base); ctx.lineTo(x + s * 0.42, base);
    ctx.quadraticCurveTo(x + s * 0.58, base, x + s * 0.55, base - s * 0.14);
    ctx.stroke();
    ctx.fillStyle = rgba(p.red[0]);
    ctx.fillRect(x - s * 0.48, base - s * 0.2, s * 0.9, s * 0.08);
    ctx.fillStyle = rgba(p.red[1]);
    [-0.3, 0.2].forEach((u) => ctx.fillRect(x + u * s, base - s * 0.12, s * 0.05, s * 0.12));
    // Cadeautje.
    ctx.fillStyle = rgba(p.gold[1]);
    ctx.fillRect(x - s * 0.24, base - s * 0.5, s * 0.34, s * 0.3);
    ctx.fillStyle = rgba(p.red[0]);
    ctx.fillRect(x - s * 0.09, base - s * 0.5, s * 0.05, s * 0.3);
    ctx.beginPath(); ctx.ellipse(x - s * 0.1, base - s * 0.53, s * 0.06, s * 0.035, -0.5, 0, TAU); ctx.ellipse(x - s * 0.02, base - s * 0.53, s * 0.06, s * 0.035, 0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(p.snow);
    ctx.fillRect(x - s * 0.25, base - s * 0.52, s * 0.36, s * 0.03);
  }

  /* Het besneeuwde veld met het pad naar het dorp. */
  function field(ctx, r, p) {
    // Grond.
    let g = ctx.createLinearGradient(0, G.horizon - 10, 0, G.sill);
    g.addColorStop(0, rgba(p.near[1]));
    g.addColorStop(0.25, rgba(mix(p.snow, p.near[0], 0.35)));
    g.addColorStop(1, rgba(p.snow));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(60, G.sill);
    for (let x = 60; x <= 840; x += 30) ctx.lineTo(x, G.horizon + 2 + Math.sin(x / 90) * 5);
    ctx.lineTo(840, G.sill);
    ctx.closePath();
    ctx.fill();
    // Glooiende schaduwen.
    ctx.save();
    ctx.filter = "blur(10px)";
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = rgba(p.snowShade, 0.32);
      ctx.beginPath();
      ctx.ellipse(120 + r() * 660, 1060 + r() * 220, 140 + r() * 120, 16 + r() * 16, (r() - 0.5) * 0.2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    // Pad (S-bocht) met voetstappen.
    const path = (off) => {
      ctx.beginPath();
      ctx.moveTo(G.cx - 120 - off, G.sill + 4);
      ctx.bezierCurveTo(G.cx - 90 - off, 1230, G.cx + 120 - off * 0.3, 1150, G.cx + 20 - off * 0.2, 1080);
      ctx.bezierCurveTo(G.cx - 30, 1040, G.cx - 6, 1015, G.cx - 4, 1004);
      ctx.lineTo(G.cx + 8, 1004);
      ctx.bezierCurveTo(G.cx + 12, 1016, G.cx + 4, 1044, G.cx + 44 + off * 0.2, 1082);
      ctx.bezierCurveTo(G.cx + 150 + off * 0.3, 1160, G.cx + 40 + off, 1240, G.cx + 120 + off, G.sill + 4);
      ctx.closePath();
    };
    g = ctx.createLinearGradient(0, 1004, 0, G.sill);
    g.addColorStop(0, rgba(mix(p.path, p.snowShade, 0.4)));
    g.addColorStop(1, rgba(p.path));
    ctx.fillStyle = g;
    path(0);
    ctx.fill();
    ctx.save();
    ctx.filter = "blur(2px)";
    ctx.strokeStyle = rgba(p.snowShade, 0.9);
    ctx.lineWidth = 3;
    path(0);
    ctx.stroke();
    ctx.restore();
    // Voetstappen.
    for (let i = 0; i < 26; i++) {
      const t = i / 26;
      const y = G.sill - t * 300;
      const sway = Math.sin(t * 5.5) * (90 * (1 - t));
      const x = G.cx + sway * 0.6 + (i % 2 ? 7 : -7) * (1 - t * 0.8);
      const s = 3.2 * (1 - t * 0.8);
      ctx.fillStyle = rgba(p.snowDeep, 0.5);
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.7, s * 1.2, 0, 0, TAU); ctx.fill();
    }
    // Glinsteringen in de sneeuw.
    for (let i = 0; i < 160; i++) {
      const x = 90 + r() * 720;
      const y = 1010 + Math.pow(r(), 0.7) * 310;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.6})`;
      ctx.fillRect(x, y, 1 + r() * 1.2, 1 + r() * 1.2);
    }
  }

  /* IJsbloemen in de onderste hoeken van het raam. */
  function frost(ctx, r, p) {
    if (!p.frost) return;
    ctx.save();
    archPath(ctx, 0);
    ctx.clip();
    const corner = (x0, y0, dir) => {
      ctx.save();
      ctx.filter = "blur(14px)";
      const g = ctx.createRadialGradient(x0, y0, 0, x0, y0, 190);
      g.addColorStop(0, `rgba(255,255,255,${0.55 * p.frost})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x0 - 200, y0 - 200, 400, 400);
      ctx.restore();
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * p.frost})`;
      ctx.lineCap = "round";
      const branch = (x, y, a, len, depth) => {
        if (depth > 4 || len < 4) return;
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        ctx.lineWidth = Math.max(0.5, 1.6 - depth * 0.3);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        const n = 2 + Math.floor(r() * 2);
        for (let i = 0; i < n; i++) {
          const t = 0.3 + r() * 0.6;
          branch(x + Math.cos(a) * len * t, y + Math.sin(a) * len * t, a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.5), len * (0.35 + r() * 0.25), depth + 1);
        }
      };
      for (let i = 0; i < 9; i++) {
        const a = dir === 1 ? -Math.PI / 2 + r() * Math.PI / 2 : -Math.PI + r() * Math.PI / 2;
        branch(x0, y0, a, 60 + r() * 80, 0);
      }
    };
    corner(G.cx - G.R, G.sill, 1);
    corner(G.cx + G.R, G.sill, -1);
    ctx.restore();
  }

  /* ------------------------------------------------------------------ interieur: muur, boog, vensterbank */
  function interior(ctx, r, p) {
    // Muur rond de boog.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, G.W, G.H);
    archPath(ctx, 0, true);
    ctx.clip("evenodd");
    let g = ctx.createRadialGradient(G.cx, 820, 200, G.cx, 820, 1100);
    g.addColorStop(0, rgba(p.wall[0]));
    g.addColorStop(0.6, rgba(p.wall[1]));
    g.addColorStop(1, rgba(p.wall[2]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, G.W, G.H);
    // Subtiel behangmotief: kleine sterretjes in een raster.
    ctx.fillStyle = rgba(p.night ? p.gold[1] : mix(p.wall[1], BLACK, 0.06), p.night ? 0.12 : 0.35);
    for (let y = 30; y < G.H; y += 56) {
      for (let x = (y / 56) % 2 ? 28 : 0; x < G.W + 20; x += 56) {
        starShape(ctx, x, y, 3.2, 1.2, ctx.fillStyle);
      }
    }
    ctx.restore();
    // Lijstwerk om de boog.
    const band = 30;
    ctx.save();
    archPath(ctx, band);
    archPath(ctx, 0, true);
    ctx.clip("evenodd");
    g = ctx.createLinearGradient(G.cx - G.R - band, 0, G.cx + G.R + band, 0);
    g.addColorStop(0, rgba(p.moulding[0]));
    g.addColorStop(0.5, rgba(p.moulding[1]));
    g.addColorStop(1, rgba(p.moulding[2]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.restore();
    ctx.strokeStyle = rgba(p.gold[1], 0.9);
    ctx.lineWidth = 2;
    archPath(ctx, 6); ctx.stroke();
    ctx.strokeStyle = rgba(p.gold[0], 0.8);
    ctx.lineWidth = 1;
    archPath(ctx, band - 4); ctx.stroke();
    // Schaduw van de boog op het glas.
    ctx.save();
    archPath(ctx, 0);
    ctx.clip();
    ctx.lineWidth = 30;
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.filter = "blur(12px)";
    archPath(ctx, 6);
    ctx.stroke();
    ctx.restore();
  }

  function sill(ctx, r, p) {
    const y = G.sill, x0 = 30, x1 = 870;
    // Schaduw onder de bank.
    ctx.save();
    ctx.filter = "blur(10px)";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x0 + 10, y + 64, x1 - x0 - 20, 18);
    ctx.restore();
    let g = ctx.createLinearGradient(0, y - 4, 0, y + 22);
    g.addColorStop(0, rgba(mix(p.sill[0], WHITE, 0.25)));
    g.addColorStop(1, rgba(p.sill[0]));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 + 18, y - 4); ctx.lineTo(x1 - 18, y - 4); ctx.lineTo(x1, y + 22); ctx.lineTo(x0, y + 22); ctx.closePath();
    ctx.fill();
    g = ctx.createLinearGradient(0, y + 22, 0, y + 66);
    g.addColorStop(0, rgba(p.sill[1]));
    g.addColorStop(1, rgba(p.sill[2]));
    ctx.fillStyle = g;
    ctx.fillRect(x0, y + 22, x1 - x0, 44);
    ctx.strokeStyle = rgba(p.gold[1], 0.85);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, y + 23); ctx.lineTo(x1, y + 23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y + 60); ctx.lineTo(x1, y + 60); ctx.stroke();
  }

  /* ------------------------------------------------------------------ guirlande */
  function needleCluster(ctx, r, x, y, size, angle, p, density, thick) {
    const n = Math.round(14 * (density || 1));
    for (let i = 0; i < n; i++) {
      const a = angle + (r() - 0.5) * 2.6;
      const len = size * (0.45 + r() * 0.55);
      const c = pickFrom(r, p.garland);
      ctx.strokeStyle = rgba(r() < 0.2 ? mix(c, WHITE, 0.18) : c, 0.95);
      ctx.lineWidth = (1.2 + r() * 1.3) * (thick || 1);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 4, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  }

  function hollyLeaf(ctx, x, y, len, angle, c) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const w = len * 0.36;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const spikes = 4;
    for (let i = 1; i <= spikes; i++) {
      const u = i / (spikes + 1);
      const wid = Math.sin(u * Math.PI) * w;
      ctx.quadraticCurveTo(len * (u - 0.1), -wid * 0.55, len * u, -wid - len * 0.05);
    }
    ctx.quadraticCurveTo(len * 0.92, -w * 0.25, len, 0);
    for (let i = spikes; i >= 1; i--) {
      const u = i / (spikes + 1);
      const wid = Math.sin(u * Math.PI) * w;
      ctx.quadraticCurveTo(len * (u + 0.1), wid * 0.55, len * u, wid + len * 0.05);
    }
    ctx.quadraticCurveTo(len * 0.05, w * 0.3, 0, 0);
    const g = ctx.createLinearGradient(0, -w, 0, w);
    g.addColorStop(0, rgba(mix(c, WHITE, 0.2)));
    g.addColorStop(1, rgba(mix(c, BLACK, 0.25)));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = rgba(mix(c, WHITE, 0.35), 0.6);
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(len * 0.05, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke();
    ctx.restore();
  }

  function berries(ctx, x, y, s, c) {
    [[0, 0], [s * 1.1, s * 0.5], [s * 0.2, s * 1.2]].forEach(([dx, dy]) => {
      const g = ctx.createRadialGradient(x + dx - s * 0.3, y + dy - s * 0.3, 0.2, x + dx, y + dy, s);
      g.addColorStop(0, rgba(mix(c, WHITE, 0.6)));
      g.addColorStop(0.4, rgba(c));
      g.addColorStop(1, rgba(mix(c, BLACK, 0.35)));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, s, 0, TAU); ctx.fill();
    });
  }

  function pinecone(ctx, r, x, y, s, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    for (let row = 0; row < 7; row++) {
      const yy = row * s * 0.28 - s * 0.9;
      const w = s * 0.55 * Math.sin((row + 1) / 8 * Math.PI);
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = rgba(mix("#6B4526", "#A57445", (row % 2) * 0.4 + r() * 0.2));
        ctx.beginPath();
        ctx.ellipse(i * w * 0.6, yy, w * 0.45, s * 0.2, 0, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function bow(ctx, x, y, s, p) {
    const c = p.red[0], dark = p.red[1];
    const loop = (dir) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir, 1);
      const g = ctx.createLinearGradient(0, -s, s * 1.4, s);
      g.addColorStop(0, rgba(mix(c, WHITE, 0.15)));
      g.addColorStop(0.5, rgba(c));
      g.addColorStop(1, rgba(dark));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.4, -s * 0.9, s * 1.5, -s * 0.9, s * 1.45, -s * 0.1);
      ctx.bezierCurveTo(s * 1.4, s * 0.55, s * 0.5, s * 0.45, 0, 0);
      ctx.fill();
      ctx.fillStyle = rgba(mix(dark, BLACK, 0.2), 0.6);
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.05);
      ctx.bezierCurveTo(s * 0.5, -s * 0.45, s * 1.1, -s * 0.45, s * 1.1, -s * 0.1);
      ctx.bezierCurveTo(s * 0.9, s * 0.1, s * 0.5, s * 0.05, s * 0.15, -s * 0.05);
      ctx.fill();
      // Lint dat naar beneden hangt.
      const tg = ctx.createLinearGradient(0, 0, s * 0.8, s * 3.2);
      tg.addColorStop(0, rgba(c));
      tg.addColorStop(1, rgba(dark));
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, s * 0.1);
      ctx.bezierCurveTo(s * 0.3, s * 1.1, s * 0.05, s * 2.2, s * 0.55, s * 3.3);
      ctx.lineTo(s * 0.78, s * 3.05);
      ctx.lineTo(s * 0.95, s * 3.35);
      ctx.bezierCurveTo(s * 0.55, s * 2.2, s * 0.75, s * 1.2, s * 0.3, s * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    loop(-1);
    loop(1);
    const kg = ctx.createRadialGradient(x - s * 0.1, y - s * 0.1, 1, x, y, s * 0.35);
    kg.addColorStop(0, rgba(mix(c, WHITE, 0.25)));
    kg.addColorStop(1, rgba(dark));
    ctx.fillStyle = kg;
    ctx.beginPath(); ctx.ellipse(x, y, s * 0.3, s * 0.34, 0, 0, TAU); ctx.fill();
  }

  /* Punten langs de guirlande: links omhoog, over de boog, rechts omlaag. */
  function garlandPoints(radius, step, sideLen) {
    const pts = [];
    const left = G.cx - radius, right = G.cx + radius;
    for (let y = G.spring + sideLen; y > G.spring; y -= step) pts.push([left, y, -Math.PI / 2]);
    const arcLen = Math.PI * radius;
    const n = Math.round(arcLen / step);
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      pts.push([G.cx + Math.cos(a) * radius, G.spring + Math.sin(a) * radius, a + Math.PI / 2]);
    }
    for (let y = G.spring + step; y < G.spring + sideLen; y += step) pts.push([right, y, Math.PI / 2]);
    return pts;
  }

  function garland(ctx, r, p, ov) {
    const radius = G.R + 16;
    const pts = garlandPoints(radius, 7, 360);
    // Schaduw op de muur.
    ctx.save();
    ctx.filter = "blur(14px)";
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 60;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + 6, y + 14) : ctx.moveTo(x + 6, y + 14)));
    ctx.stroke();
    ctx.restore();
    // Drie lagen naalden: donker achter, midden, licht voor.
    [0.75, 1, 0.7].forEach((dens, layer) => {
      pts.forEach(([x, y, a]) => {
        const off = (r() - 0.5) * 34;
        const nx = x + Math.cos(a + Math.PI / 2) * off;
        const ny = y + Math.sin(a + Math.PI / 2) * off;
        needleCluster(ctx, r, nx, ny, 24 + layer * 3, a + (r() < 0.5 ? Math.PI / 2 : -Math.PI / 2), p, dens);
      });
    });
    // Sneeuwpoeder op de naalden.
    pts.forEach(([x, y, a], i) => {
      if (i % 2) return;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.25})`;
      ctx.beginPath(); ctx.arc(x + (r() - 0.5) * 30, y - 8 + (r() - 0.5) * 20, 1.2 + r() * 2.2, 0, TAU); ctx.fill();
    });
    // Versiering: dennenappels, hulst, ballen.
    pts.forEach(([x, y, a], i) => {
      if (i % 9 === 3) pinecone(ctx, r, x + (r() - 0.5) * 18, y + (r() - 0.5) * 16, 11 + r() * 5, a + (r() - 0.5));
      if (i % 11 === 6) {
        const hl = 20 + r() * 8;
        hollyLeaf(ctx, x, y, hl, a + 0.5 + r() * 0.4, p.garland[1]);
        hollyLeaf(ctx, x, y, hl * 0.9, a - 2.4 + r() * 0.4, p.garland[3]);
        berries(ctx, x, y, 4.2, p.berry);
      }
      if (i % 13 === 9) bauble(ctx, x + (r() - 0.5) * 20, y + 10 + (r() - 0.5) * 12, 8 + r() * 4, i % 2 ? p.gold[1] : p.red[0]);
    });
    // Lichtsnoer.
    const lights = [];
    pts.forEach(([x, y, a], i) => {
      if (i % 5) return;
      const off = Math.sin(i * 0.7) * 14;
      const lx = x + Math.cos(a + Math.PI / 2) * off, ly = y + Math.sin(a + Math.PI / 2) * off;
      lights.push([lx, ly]);
    });
    ctx.strokeStyle = "rgba(40,30,20,0.35)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    lights.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    lights.forEach(([x, y], i) => {
      glow(ctx, x, y, 16, p.win, 0.55);
      ctx.fillStyle = rgba(mix(p.win, WHITE, 0.55));
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
      if (i % 2 === 0) ov.push({ t: "fairy", x, y, s: 34, d: (i * 0.29) % 2.6 });
    });
    // Strik bovenin.
    bow(ctx, G.cx, G.spring - radius - 4, 36, p);
  }

  /* ------------------------------------------------------------------ lantaarns en kaarsen */
  function lantern(ctx, x, top, s, p, ov, chainFrom) {
    const gold = p.gold;
    // Ketting.
    if (chainFrom != null) {
      ctx.strokeStyle = rgba(gold[2], 0.9);
      ctx.lineWidth = 1.6;
      for (let y = chainFrom; y < top - s * 0.2; y += 7) {
        ctx.beginPath(); ctx.ellipse(x, y + 3, 2, 3.4, 0, 0, TAU); ctx.stroke();
      }
    }
    const w = s, h = s * 1.55;
    // Kapje.
    let g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, rgba(gold[0]));
    g.addColorStop(0.5, rgba(gold[1]));
    g.addColorStop(1, rgba(gold[2]));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.12, top);
    ctx.lineTo(x + w * 0.12, top);
    ctx.lineTo(x + w * 0.62, top + h * 0.2);
    ctx.lineTo(x - w * 0.62, top + h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.arc(x, top - 3, 4, 0, TAU); ctx.fill();
    // Glas met kaarslicht.
    const gy = top + h * 0.2, gh = h * 0.62;
    glow(ctx, x, gy + gh * 0.55, s * 2.6, p.winGlow, p.night ? 0.6 : 0.45);
    g = ctx.createLinearGradient(0, gy, 0, gy + gh);
    g.addColorStop(0, rgba(mix(p.win, WHITE, 0.55), 0.95));
    g.addColorStop(1, rgba(p.win, 0.85));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.46, gy); ctx.lineTo(x + w * 0.46, gy); ctx.lineTo(x + w * 0.4, gy + gh); ctx.lineTo(x - w * 0.4, gy + gh); ctx.closePath();
    ctx.fill();
    // Kaarsje.
    ctx.fillStyle = rgba(p.wax[0]);
    ctx.fillRect(x - w * 0.09, gy + gh * 0.55, w * 0.18, gh * 0.45);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath(); ctx.ellipse(x, gy + gh * 0.42, w * 0.05, w * 0.1, 0, 0, TAU); ctx.fill();
    ov.push({ t: "flame", x, y: gy + gh * 0.42, s: w * 0.9 });
    // Spijlen.
    ctx.strokeStyle = rgba(gold[2]);
    ctx.lineWidth = 2;
    [-0.46, 0, 0.46].forEach((u) => {
      ctx.beginPath(); ctx.moveTo(x + w * u, gy); ctx.lineTo(x + w * u * 0.87, gy + gh); ctx.stroke();
    });
    // Voet.
    g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, rgba(gold[0]));
    g.addColorStop(0.5, rgba(gold[1]));
    g.addColorStop(1, rgba(gold[2]));
    ctx.fillStyle = g;
    ctx.fillRect(x - w * 0.5, gy + gh, w, h * 0.1);
    ctx.fillRect(x - w * 0.3, gy + gh + h * 0.1, w * 0.6, h * 0.06);
  }

  function candle(ctx, x, base, w, h, p, ov) {
    glow(ctx, x, base - h - 12, w * 4.2, p.winGlow, p.night ? 0.5 : 0.38);
    const dish = ctx.createLinearGradient(x - w, 0, x + w, 0);
    dish.addColorStop(0, rgba(p.gold[0]));
    dish.addColorStop(0.5, rgba(p.gold[1]));
    dish.addColorStop(1, rgba(p.gold[2]));
    ctx.fillStyle = dish;
    ctx.beginPath(); ctx.ellipse(x, base - 2, w * 0.85, w * 0.16, 0, 0, TAU); ctx.fill();
    base -= 4;
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, rgba(mix(p.wax[0], WHITE, 0.4)));
    g.addColorStop(0.6, rgba(p.wax[0]));
    g.addColorStop(1, rgba(p.wax[1]));
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, base - h, w, h);
    // Druppels en een warme bovenkant.
    ctx.fillStyle = rgba(mix(p.wax[0], p.win, 0.25));
    ctx.beginPath(); ctx.ellipse(x, base - h, w / 2, w * 0.12, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(p.wax[0]);
    ctx.beginPath(); ctx.ellipse(x - w * 0.22, base - h + 8, w * 0.07, 9, 0, 0, TAU); ctx.fill();
    const k = w / 34;
    ctx.strokeStyle = "#3A2A20";
    ctx.lineWidth = 1.4 * k;
    ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x, base - h - 6 * k); ctx.stroke();
    // Vlam (de levende vlam komt er als laag overheen).
    const fy = base - h - 13 * k;
    const fg = ctx.createRadialGradient(x, fy + k, k, x, fy + k, 11 * k);
    fg.addColorStop(0, "rgba(255,255,240,1)");
    fg.addColorStop(0.5, rgba(p.win, 0.95));
    fg.addColorStop(1, rgba(p.winGlow, 0));
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.ellipse(x, fy, 5 * k, 11 * k, 0, 0, TAU); ctx.fill();
    ov.push({ t: "flame", x, y: fy, s: w * 1.1 });
  }

  function sillDecor(ctx, r, p, ov) {
    const y = G.sill;
    // Groen langs de bank.
    for (let i = 0; i < 70; i++) {
      const x = 60 + r() * 780;
      needleCluster(ctx, r, x, y - 2, 18 + r() * 10, -Math.PI / 2 + (r() - 0.5) * 1.6, p, 0.6);
    }
    candle(ctx, 176, y, 34, 108, p, ov);
    candle(ctx, 222, y, 30, 78, p, ov);
    candle(ctx, 262, y, 26, 54, p, ov);
    [[315, 10, p.red[0]], [345, 7, p.gold[1]], [560, 9, p.gold[1]], [590, 6, p.red[0]]].forEach(([x, s, c]) => bauble(ctx, x, y - s, s, c));
    pinecone(ctx, r, 395, y - 10, 16, 1.4);
    pinecone(ctx, r, 520, y - 9, 14, -1.3);
    // Hulst op de bank.
    hollyLeaf(ctx, 450, y - 6, 30, -2.7, p.garland[1]);
    hollyLeaf(ctx, 450, y - 6, 30, -0.4, p.garland[3]);
    berries(ctx, 448, y - 12, 5, p.berry);
    // Lantaarntje rechts.
    lantern(ctx, 712, y - 118, 62, p, ov, null);
    // Cadeautje.
    const gx = 790, gw = 56, gh = 44;
    ctx.fillStyle = rgba(p.red[0]);
    ctx.fillRect(gx - gw / 2, y - gh, gw, gh);
    ctx.fillStyle = rgba(mix(p.red[0], WHITE, 0.12));
    ctx.fillRect(gx - gw / 2 - 3, y - gh - 10, gw + 6, 12);
    ctx.fillStyle = rgba(p.gold[1]);
    ctx.fillRect(gx - 4, y - gh - 10, 8, gh + 10);
    ctx.beginPath(); ctx.ellipse(gx - 9, y - gh - 14, 10, 6, -0.5, 0, TAU); ctx.ellipse(gx + 9, y - gh - 14, 10, 6, 0.5, 0, TAU); ctx.fill();
  }

  /* ------------------------------------------------------------------ de hele scène */
  function scene(ctx, key, seed) {
    const p = PALETTES[key];
    const base = seed || 2026;
    // Elk onderdeel een eigen reeks: dan staan lichtjes en ramen in elke kleurvariant op dezelfde plek.
    let part = 0;
    const next = () => rng(base + (++part) * 97);
    let r = next();
    const ov = [];
    // Buiten (binnen de boog).
    ctx.save();
    archPath(ctx, 2);
    ctx.clip();
    sky(ctx, p, next());
    // De kerstster schuin boven de kerk, onder de tekst (die staat hoger in de lucht).
    christmasStar(ctx, 366, 812, 11, p, ov);
    ridge(ctx, next(), 902, 16, p.far, 1.2, 0.5, p);
    ridge(ctx, next(), 948, 12, [mix(p.far[0], p.near[1], 0.5), mix(p.far[1], p.near[1], 0.5)], 0.6, 0.4, p);
    field(ctx, next(), p);
    r = next();
    // Dorp.
    const spots = [
      [168, 990, 40, 30], [214, 996, 46, 36], [262, 988, 38, 28], [306, 1000, 50, 40], [360, 994, 42, 30],
      [540, 996, 44, 34], [590, 990, 38, 28], [700, 996, 48, 36], [752, 988, 38, 30], [800, 998, 44, 32],
    ];
    const trees = [[140, 996, 34], [240, 1002, 30], [334, 1004, 36], [398, 1000, 28], [520, 1003, 30], [566, 1002, 40], [726, 1003, 32], [778, 1004, 28]];
    trees.forEach(([x, b, h]) => pine(ctx, r, x, b, h, h * 0.5, p, { tiers: 4, snow: 0.8 }));
    church(ctx, G.cx, 996, p, ov);
    r = next();
    spots.forEach(([x, b, w, h], i) => house(ctx, r, x, b, w, h, p, ov, { lights: i === 1 || i === 3 || i === 7 }));
    r = next();
    fence(ctx, r, 214, 1150, 388, 1082, 7, 26, 14, p);
    fence(ctx, r, 520, 1076, 640, 1112, 5, 13, 20, p);
    bigTree(ctx, next(), 646, 1078, 212, p, ov);
    r = next();
    lamp(ctx, 330, 1262, 118, p, ov);
    lamp(ctx, 572, 1186, 84, p, ov);
    lamp(ctx, 404, 1112, 56, p, ov);
    lamp(ctx, 506, 1062, 36, p, ov);
    snowman(ctx, 306, 1214, 80, p);
    sled(ctx, 566, 1286, 66, p);
    // Dennen op de voorgrond.
    lushPine(ctx, next(), 176, G.sill + 8, 480, 250, p, { tiers: 13 });
    lushPine(ctx, next(), 758, G.sill + 8, 390, 210, p, { tiers: 11 });
    frost(ctx, next(), p);
    // Glans op het glas.
    const sheen = ctx.createLinearGradient(G.cx - G.R, G.spring - G.R, G.cx + G.R, G.sill);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.38, "rgba(255,255,255,0)");
    sheen.addColorStop(0.44, `rgba(255,255,255,${p.night ? 0.05 : 0.1})`);
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(0.56, `rgba(255,255,255,${p.night ? 0.03 : 0.06})`);
    sheen.addColorStop(0.6, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.restore();
    // Binnen.
    interior(ctx, next(), p);
    garland(ctx, next(), p, ov);
    lantern(ctx, 150, 382, 74, p, ov, 0);
    lantern(ctx, 750, 382, 74, p, ov, 0);
    sill(ctx, next(), p);
    sillDecor(ctx, next(), p, ov);
    return ov;
  }

  /* ------------------------------------------------------------------ reliëf voor de envelop
     Eerst een hoogtekaart (wit = hoog), dan belichting van linksboven. Het resultaat is alleen licht en
     schaduw op een doorzichtige achtergrond, zodat het op elke papierkleur werkt. */
  function heightCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    return { c, g };
  }

  function embossify(src, opt) {
    opt = opt || {};
    const w = src.width, h = src.height;
    const blurred = document.createElement("canvas");
    blurred.width = w; blurred.height = h;
    const bg = blurred.getContext("2d");
    bg.filter = `blur(${opt.blur || 2.2}px)`;
    bg.drawImage(src, 0, 0);
    const H = bg.getImageData(0, 0, w, h).data;
    const out = document.createElement("canvas");
    out.width = w; out.height = h;
    const og = out.getContext("2d");
    const img = og.createImageData(w, h);
    const d = img.data;
    const depth = opt.depth || 3.2;
    const lx = -0.62, ly = -0.62, lz = 0.48;
    const hi = opt.highlight || 1, lo = opt.shadow || 1;
    const at = (x, y) => H[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4] / 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)) * depth;
        const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)) * depth;
        const len = Math.sqrt(dx * dx + dy * dy + 1);
        const shade = ((-dx * lx) + (-dy * ly) + lz) / len - lz;
        const i = (y * w + x) * 4;
        if (shade > 0) {
          d[i] = 255; d[i + 1] = 253; d[i + 2] = 248;
          d[i + 3] = Math.min(255, shade * 255 * 1.35 * hi);
        } else {
          d[i] = 40; d[i + 1] = 26; d[i + 2] = 18;
          d[i + 3] = Math.min(255, -shade * 255 * 0.95 * lo);
        }
      }
    }
    og.putImageData(img, 0, 0);
    return out;
  }

  /* Motieven, getekend als hoogtekaart met witte vullingen en donkere groeven. */
  function eLeafHolly(g, x, y, len, angle) {
    g.save();
    g.translate(x, y);
    g.rotate(angle);
    const w = len * 0.34;
    g.beginPath();
    g.moveTo(0, 0);
    const spikes = 4;
    for (let i = 1; i <= spikes; i++) {
      const u = i / (spikes + 1);
      const wid = Math.sin(u * Math.PI) * w;
      g.quadraticCurveTo(len * (u - 0.1), -wid * 0.5, len * u, -wid - len * 0.05);
    }
    g.quadraticCurveTo(len * 0.92, -w * 0.25, len, 0);
    for (let i = spikes; i >= 1; i--) {
      const u = i / (spikes + 1);
      const wid = Math.sin(u * Math.PI) * w;
      g.quadraticCurveTo(len * (u + 0.1), wid * 0.5, len * u, wid + len * 0.05);
    }
    g.quadraticCurveTo(len * 0.05, w * 0.3, 0, 0);
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.lineWidth = Math.max(1.2, len * 0.035);
    g.beginPath(); g.moveTo(len * 0.06, 0); g.lineTo(len * 0.92, 0); g.stroke();
    g.lineWidth = Math.max(0.8, len * 0.02);
    for (let i = 1; i <= 3; i++) {
      const u = i / 4;
      g.beginPath(); g.moveTo(len * u, 0); g.lineTo(len * (u + 0.08), -w * 0.5); g.moveTo(len * u, 0); g.lineTo(len * (u + 0.08), w * 0.5); g.stroke();
    }
    g.restore();
  }
  function eBerry(g, x, y, r) {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(1, "#B8B8B8");
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  function eNeedles(g, r, x0, y0, x1, y1, len, density) {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / (3.2 / (density || 1)));
    const a0 = Math.atan2(y1 - y0, x1 - x0);
    g.strokeStyle = "#FFFFFF";
    g.lineCap = "round";
    g.lineWidth = Math.max(1.2, len * 0.09);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u;
      const l = len * (1 - u * 0.45);
      g.lineWidth = Math.max(1.1, l * 0.1);
      [-1, 1].forEach((side) => {
        const a = a0 + side * (0.75 + r() * 0.25);
        g.strokeStyle = `rgb(${200 + r() * 55},${200 + r() * 55},${200 + r() * 55})`;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke();
      });
    }
  }
  function eFirSprig(g, r, x, y, len, angle, needle) {
    const x1 = x + Math.cos(angle) * len, y1 = y + Math.sin(angle) * len;
    const nd = needle || len * 0.16;
    eNeedles(g, r, x, y, x1, y1, nd, 1.3);
    // Zijtakjes, om en om.
    for (let i = 1; i <= 3; i++) {
      const u = 0.2 + i * 0.18;
      const bx = x + (x1 - x) * u, by = y + (y1 - y) * u;
      const side = i % 2 ? 1 : -1;
      const a = angle + side * (0.55 + r() * 0.15);
      const l = len * (0.42 - i * 0.06);
      eNeedles(g, r, bx, by, bx + Math.cos(a) * l, by + Math.sin(a) * l, nd * 0.8, 1.3);
    }
  }
  function eStar(g, x, y, R, rr, points) {
    points = points || 5;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      const rad = i % 2 ? rr : R;
      g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    g.closePath();
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(1, "#C8C8C8");
    g.fillStyle = gr;
    g.fill();
    // Nerf: lijntjes van het midden naar de punten.
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = Math.max(0.8, R * 0.04);
    for (let i = 0; i < points; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / points;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * R * 0.9, y + Math.sin(a) * R * 0.9); g.stroke();
    }
  }
  function eSnowflake(g, x, y, R, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot || 0);
    g.strokeStyle = "#FFFFFF";
    g.lineCap = "round";
    g.lineWidth = Math.max(1.3, R * 0.1);
    for (let i = 0; i < 6; i++) {
      g.save();
      g.rotate((i * Math.PI) / 3);
      g.beginPath();
      g.moveTo(0, 0); g.lineTo(0, -R);
      [0.45, 0.72].forEach((u) => {
        const l = R * (u < 0.5 ? 0.34 : 0.24);
        g.moveTo(0, -R * u); g.lineTo(-l, -R * u - l * 0.9);
        g.moveTo(0, -R * u); g.lineTo(l, -R * u - l * 0.9);
      });
      g.stroke();
      g.restore();
    }
    g.fillStyle = "#FFFFFF";
    g.beginPath(); g.arc(0, 0, R * 0.14, 0, TAU); g.fill();
    g.restore();
  }
  function ePinecone(g, x, y, s, angle) {
    g.save();
    g.translate(x, y);
    g.rotate(angle);
    for (let row = 0; row < 7; row++) {
      const yy = row * s * 0.28 - s * 0.9;
      const w = s * 0.55 * Math.sin(((row + 1) / 8) * Math.PI);
      for (let i = -1; i <= 1; i++) {
        const gr = g.createRadialGradient(i * w * 0.6, yy - s * 0.05, 0, i * w * 0.6, yy, w * 0.5);
        gr.addColorStop(0, "#FFFFFF");
        gr.addColorStop(1, "#9A9A9A");
        g.fillStyle = gr;
        g.beginPath(); g.ellipse(i * w * 0.6, yy, w * 0.45, s * 0.19, 0, 0, TAU); g.fill();
      }
    }
    g.restore();
  }
  function eHollyCluster(g, r, x, y, s, angle) {
    eLeafHolly(g, x, y, s, angle - 0.55);
    eLeafHolly(g, x, y, s * 0.92, angle + 0.55);
    eLeafHolly(g, x, y, s * 0.75, angle + Math.PI + (r() - 0.5) * 0.4);
    eBerry(g, x - s * 0.02, y - s * 0.02, s * 0.11);
    eBerry(g, x + s * 0.13, y + s * 0.06, s * 0.1);
    eBerry(g, x - s * 0.08, y + s * 0.13, s * 0.095);
  }
  function eBow(g, x, y, s) {
    g.fillStyle = "#FFFFFF";
    [-1, 1].forEach((dir) => {
      g.save();
      g.translate(x, y);
      g.scale(dir, 1);
      g.beginPath();
      g.moveTo(0, 0);
      g.bezierCurveTo(s * 0.4, -s * 0.9, s * 1.5, -s * 0.9, s * 1.45, -s * 0.1);
      g.bezierCurveTo(s * 1.4, s * 0.55, s * 0.5, s * 0.45, 0, 0);
      g.fill();
      g.beginPath();
      g.moveTo(-s * 0.05, s * 0.1);
      g.bezierCurveTo(s * 0.3, s * 1.0, s * 0.1, s * 1.8, s * 0.55, s * 2.6);
      g.lineTo(s * 0.9, s * 2.55);
      g.bezierCurveTo(s * 0.55, s * 1.8, s * 0.7, s * 1.0, s * 0.3, s * 0.05);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(0,0,0,0.5)";
      g.lineWidth = Math.max(1, s * 0.05);
      g.beginPath(); g.moveTo(s * 0.15, -s * 0.05); g.bezierCurveTo(s * 0.5, -s * 0.45, s * 1.1, -s * 0.45, s * 1.1, -s * 0.1); g.stroke();
      g.restore();
    });
    eBerry(g, x, y, s * 0.3);
  }

  /* Samenstellingen. Elk geeft een hoogtekaart terug. */
  const EMBOSS = {
    // Bovenklep: een slinger van dennengroen en hulst die naar twee kanten afhangt, met een ster in het midden.
    boven(w, h, r) {
      const { c, g } = heightCanvas(w, h);
      const cx = w / 2, cy = h * 0.3;
      const s = w / 1000;
      const swag = (dir) => {
        const P = (u) => {
          const x0 = cx, y0 = cy, x1 = cx + dir * 240 * s, y1 = cy + 150 * s, x2 = cx + dir * 440 * s, y2 = cy + 40 * s;
          const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, q = u * u;
          return [a * x0 + b * x1 + q * x2, a * y0 + b * y1 + q * y2];
        };
        for (let i = 0; i < 22; i++) {
          const u = i / 21;
          const [x, y] = P(u);
          const [nx, ny] = P(Math.min(1, u + 0.05));
          const along = Math.atan2(ny - y, nx - x);
          const size = (1 - u * 0.55) * 120 * s;
          eFirSprig(g, r, x, y, size, along + (r() - 0.5) * 0.9 + (i % 2 ? 0.5 : -0.5), 15 * s);
        }
        [0.22, 0.5, 0.78].forEach((u, i) => {
          const [x, y] = P(u);
          eHollyCluster(g, r, x, y + 6 * s, (58 - i * 8) * s, dir > 0 ? 0.4 + i * 0.3 : Math.PI - 0.4 - i * 0.3);
        });
        [[0.36, 26], [0.64, 22]].forEach(([u, sz]) => { const [x, y] = P(u); ePinecone(g, x, y + 30 * s, sz * s, dir * 0.4); });
        const [ex, ey] = P(1);
        eSnowflake(g, ex + dir * 40 * s, ey - 30 * s, 20 * s, 0.2);
      };
      swag(-1);
      swag(1);
      // Kroon van takjes achter de ster.
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.32;
        eFirSprig(g, r, cx, cy, (120 - Math.abs(i - 3) * 16) * s, a, 14 * s);
      }
      eStar(g, cx, cy - 8 * s, 64 * s, 26 * s, 5);
      [[-160, -60, 16], [160, -60, 16], [-330, -30, 14], [330, -30, 14], [-90, 150, 12], [90, 150, 12]].forEach(([dx, dy, sz], i) => eSnowflake(g, cx + dx * s, cy + dy * s, sz * s, i * 0.4));
      return c;
    },
    // Onderklep: een krans met strik en sterretjes.
    krans(w, h, r) {
      const { c, g } = heightCanvas(w, h);
      const cx = w / 2, cy = h * 0.53, R = Math.min(w, h) * 0.34;
      const n = 44;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        const rr = R * (0.94 + (i % 3) * 0.06);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        eFirSprig(g, r, x, y, R * 0.4, a + Math.PI / 2 + 0.3 + (r() - 0.5) * 0.3, R * 0.06);
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.5;
        eHollyCluster(g, r, cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.26, a + Math.PI / 2);
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + 1.3;
        ePinecone(g, cx + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 1.02, R * 0.12, a);
      }
      eBow(g, cx, cy - R * 1.02, R * 0.26);
      eStar(g, cx, cy, R * 0.26, R * 0.11, 5);
      [[-0.5, 0.2], [0.5, 0.2], [0, 0.5], [-0.28, -0.4], [0.28, -0.4]].forEach(([dx, dy], i) => eSnowflake(g, cx + dx * R, cy + dy * R, R * 0.07, i));
      return c;
    },
    // Zijklep: een verticale rank van hulst, bessen en dennengroen.
    zijkant(w, h, r) {
      const { c, g } = heightCanvas(w, h);
      const x = w * 0.42;
      g.strokeStyle = "#FFFFFF";
      g.lineWidth = w * 0.02;
      g.beginPath(); g.moveTo(x, h * 0.04); g.bezierCurveTo(x + w * 0.25, h * 0.3, x - w * 0.2, h * 0.65, x + w * 0.05, h * 0.96); g.stroke();
      for (let i = 0; i < 8; i++) {
        const u = 0.08 + i * 0.12;
        const px = x + Math.sin(u * 6) * w * 0.12, py = h * u;
        if (i % 2) eHollyCluster(g, r, px, py, w * 0.26, i % 4 === 1 ? 0.2 : Math.PI - 0.2);
        else eFirSprig(g, r, px, py, w * 0.38, i % 4 === 0 ? -0.5 : Math.PI + 0.5, w * 0.06);
      }
      [[0.2, 0.18], [0.75, 0.42], [0.25, 0.7], [0.72, 0.88]].forEach(([u, v], i) => eSnowflake(g, w * u, h * v, w * 0.07, i));
      return c;
    },
    // Losse sterretjes en sneeuwvlokjes als achtergrond (herhalend patroon).
    patroon(w, h, r) {
      const { c, g } = heightCanvas(w, h);
      const pts = [[0.15, 0.2], [0.62, 0.12], [0.4, 0.5], [0.85, 0.46], [0.18, 0.78], [0.7, 0.82]];
      pts.forEach(([u, v], i) => {
        if (i % 2) eSnowflake(g, u * w, v * h, w * 0.035, i);
        else eStar(g, u * w, v * h, w * 0.022, w * 0.009, 5);
      });
      return c;
    },
  };

  /* Het zegel met een takje hulst en den eronder (los van de kleur: die komt uit het CSS). */

  /* ------------------------------------------------------------------ het huisje bij 'Locatie'
     Een knus huis in de sneeuw op een doorzichtige achtergrond (900 x 600), zodat het op elk papier staat. */
  function cottage(ctx, key) {
    const p = PALETTES[key];
    const r = rng(77);
    const W = 900, H = 600;
    const onDark = p.night;
    // Zachte winterhalo achter het huis: op licht papier geeft die de witte sneeuw houvast.
    const halo = ctx.createRadialGradient(450, 330, 60, 450, 330, 420);
    halo.addColorStop(0, rgba(onDark ? mix(p.far[0], WHITE, 0.08) : mix(p.far[1], p.sky[3], 0.25), onDark ? 0.55 : 0.75));
    halo.addColorStop(0.6, rgba(onDark ? p.far[1] : mix(p.far[0], WHITE, 0.2), onDark ? 0.3 : 0.4));
    halo.addColorStop(1, rgba(onDark ? p.far[1] : p.far[0], 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    // Zachte sneeuwheuvel met vervaagde randen.
    ctx.save();
    const mound = ctx.createRadialGradient(450, 560, 40, 450, 560, 430);
    mound.addColorStop(0, rgba(p.snow));
    mound.addColorStop(0.62, rgba(p.snow, 0.95));
    mound.addColorStop(1, rgba(p.snow, 0));
    ctx.fillStyle = mound;
    ctx.beginPath(); ctx.ellipse(450, 560, 440, 150, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // Schaduwtint op de sneeuw zodat hij ook op licht papier te zien is.
    ctx.save();
    ctx.filter = "blur(10px)";
    ctx.fillStyle = rgba(p.snowShade, onDark ? 0.5 : 0.55);
    ctx.beginPath(); ctx.ellipse(470, 520, 330, 40, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // Achtergrondgloed van het huis.
    glow(ctx, 450, 330, 330, p.winGlow, onDark ? 0.28 : 0.16);
    // Dennen achter het huis.
    lushPine(ctx, rng(5), 250, 470, 250, 150, p, { tiers: 8, snow: 0.8 });
    // Huis.
    const x0 = 300, x1 = 610, top = 250, base = 480;
    const wall = mix(p.walls[0], p.night ? BLACK : WHITE, p.night ? 0.12 : 0.02);
    let g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, rgba(mix(wall, WHITE, 0.12)));
    g.addColorStop(1, rgba(mix(wall, BLACK, 0.2)));
    ctx.fillStyle = g;
    ctx.fillRect(x0, top, x1 - x0, base - top);
    // Houten delen.
    ctx.strokeStyle = rgba(mix(wall, BLACK, 0.18), 0.55);
    ctx.lineWidth = 1.2;
    for (let y = top + 16; y < base; y += 16) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    // Schoorsteen met rook.
    ctx.fillStyle = rgba(mix(p.roof, "#8A4A3A", 0.35));
    ctx.fillRect(540, 120, 34, 90);
    ctx.fillStyle = rgba(p.snow);
    ctx.beginPath(); ctx.ellipse(557, 120, 24, 8, 0, 0, TAU); ctx.fill();
    ctx.save();
    ctx.filter = "blur(7px)";
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = rgba(onDark ? "#D3DCE0" : "#FFFFFF", (onDark ? 0.34 : 0.7) - i * 0.045);
      ctx.beginPath(); ctx.ellipse(560 + i * 9 + Math.sin(i) * 6, 104 - i * 20, 9 + i * 3.5, 10 + i * 3, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
    // Dak.
    ctx.fillStyle = rgba(p.roof);
    ctx.beginPath(); ctx.moveTo(x0 - 30, top + 6); ctx.lineTo(455, 96); ctx.lineTo(x1 + 30, top + 6); ctx.closePath(); ctx.fill();
    // Dikke sneeuwlaag met ijspegels.
    g = ctx.createLinearGradient(0, 90, 0, top + 20);
    g.addColorStop(0, rgba(mix(p.snow, WHITE, 0.5)));
    g.addColorStop(1, rgba(p.snow));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - 40, top + 2); ctx.lineTo(455, 84); ctx.lineTo(x1 + 40, top + 2);
    for (let i = 14; i >= 0; i--) { const u = i / 14; ctx.lineTo(x0 - 38 + u * (x1 - x0 + 76), top + 14 + (i % 2) * 6 + r() * 4); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(p.snowShade, 0.9);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = rgba(p.snowShade, 0.8);
    ctx.beginPath(); ctx.moveTo(455, 90); ctx.lineTo(x1 + 40, top + 2); ctx.lineTo(x1 + 34, top + 14); ctx.lineTo(455, 118); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(mix(p.snow, "#CFE3F2", 0.4), 0.9);
    for (let i = 0; i < 16; i++) {
      const ix = x0 - 20 + i * ((x1 - x0 + 40) / 15) + (r() - 0.5) * 6, len = 6 + r() * 16;
      ctx.beginPath(); ctx.moveTo(ix - 3, top + 18); ctx.lineTo(ix + 3, top + 18); ctx.lineTo(ix, top + 18 + len); ctx.closePath(); ctx.fill();
    }
    // Lichtsnoer langs de dakrand.
    const bulbs = [p.win, p.red[2], "#FFFFFF", p.gold[0], "#9FD3A8"];
    for (let i = 0; i <= 18; i++) {
      const u = i / 18;
      const bx = x0 - 30 + u * (x1 - x0 + 60), by = top + 22 + Math.sin(u * Math.PI * 6) * 5;
      glow(ctx, bx, by, 13, bulbs[i % bulbs.length], 0.75);
      ctx.fillStyle = rgba(mix(bulbs[i % bulbs.length], WHITE, 0.35));
      ctx.beginPath(); ctx.arc(bx, by, 3, 0, TAU); ctx.fill();
    }
    // Zolderraam.
    glow(ctx, 455, 175, 70, p.winGlow, onDark ? 0.6 : 0.35);
    ctx.fillStyle = rgba(p.win);
    ctx.beginPath(); ctx.arc(455, 175, 22, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(mix(wall, BLACK, 0.4)); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(455, 175, 22, 0, TAU); ctx.moveTo(455, 153); ctx.lineTo(455, 197); ctx.moveTo(433, 175); ctx.lineTo(477, 175); ctx.stroke();
    // Ramen met gordijntjes en een krans.
    [[360, 330], [540, 330]].forEach(([wx, wy]) => {
      glow(ctx, wx, wy + 30, 120, p.winGlow, onDark ? 0.55 : 0.32);
      ctx.fillStyle = rgba(mix(p.win, WHITE, 0.2));
      ctx.fillRect(wx - 36, wy, 72, 76);
      const gg = ctx.createLinearGradient(0, wy, 0, wy + 76);
      gg.addColorStop(0, rgba(mix(p.win, WHITE, 0.55)));
      gg.addColorStop(1, rgba(p.win));
      ctx.fillStyle = gg;
      ctx.fillRect(wx - 34, wy + 2, 68, 72);
      ctx.fillStyle = rgba(p.red[1], 0.85);
      ctx.beginPath(); ctx.moveTo(wx - 34, wy + 2); ctx.quadraticCurveTo(wx - 22, wy + 40, wx - 30, wy + 74); ctx.lineTo(wx - 34, wy + 74); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(wx + 34, wy + 2); ctx.quadraticCurveTo(wx + 22, wy + 40, wx + 30, wy + 74); ctx.lineTo(wx + 34, wy + 74); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(mix(wall, BLACK, 0.45)); ctx.lineWidth = 4;
      ctx.strokeRect(wx - 36, wy, 72, 76);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + 76); ctx.moveTo(wx - 36, wy + 38); ctx.lineTo(wx + 36, wy + 38); ctx.stroke();
      // Sneeuw op de vensterbank.
      ctx.fillStyle = rgba(p.snow);
      ctx.beginPath(); ctx.ellipse(wx, wy + 80, 44, 7, 0, 0, TAU); ctx.fill();
      // Lichtval op de sneeuw.
      ctx.save();
      ctx.filter = "blur(10px)";
      ctx.globalCompositeOperation = onDark ? "screen" : "source-over";
      ctx.fillStyle = rgba(p.winGlow, onDark ? 0.22 : 0.14);
      ctx.beginPath(); ctx.moveTo(wx - 40, base + 4); ctx.lineTo(wx + 40, base + 4); ctx.lineTo(wx + 90, base + 60); ctx.lineTo(wx - 90, base + 60); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    // Deur met krans en lantaarntje.
    const dx = 452;
    ctx.fillStyle = rgba(mix(p.red[1], BLACK, 0.2));
    ctx.beginPath(); ctx.moveTo(dx - 32, base); ctx.lineTo(dx - 32, 372); ctx.arc(dx, 372, 32, Math.PI, 0); ctx.lineTo(dx + 32, base); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(mix(p.red[1], BLACK, 0.45)); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx, 344); ctx.lineTo(dx, base); ctx.stroke();
    ctx.fillStyle = rgba(p.gold[1]);
    ctx.beginPath(); ctx.arc(dx + 20, 420, 3, 0, TAU); ctx.fill();
    // Krans.
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      needleCluster(ctx, r, dx + Math.cos(a) * 16, 392 + Math.sin(a) * 16, 9, a + Math.PI / 2, p, 0.5);
    }
    berries(ctx, dx - 8, 380, 2.6, p.berry);
    berries(ctx, dx + 10, 398, 2.4, p.berry);
    bow(ctx, dx, 408, 8, p);
    lantern(ctx, 404, 380, 26, p, [], null);
    // Stoepje en pad met voetstappen.
    ctx.fillStyle = rgba(p.snowShade);
    ctx.fillRect(dx - 46, base, 92, 10);
    ctx.fillStyle = rgba(p.snow);
    ctx.beginPath(); ctx.ellipse(dx, base + 2, 50, 5, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = rgba(p.snowDeep, 0.55);
      ctx.beginPath(); ctx.ellipse(dx + (i % 2 ? 10 : -10) + i * 3, base + 20 + i * 11, 4, 6, 0, 0, TAU); ctx.fill();
    }
    // Kerstboompje rechts met lichtjes en een sneeuwpop links.
    lushPine(ctx, rng(9), 680, 505, 190, 120, p, { tiers: 7, snow: 0.7 });
    for (let i = 0; i < 16; i++) {
      const k = 0.15 + (i / 16) * 0.7, y = 505 - 20 - k * 150, half = 120 * (1 - k * 0.85) * 0.42;
      const lx = 680 + (i % 2 ? 1 : -1) * half * (0.3 + r() * 0.6);
      glow(ctx, lx, y, 9, bulbs[i % bulbs.length], 0.8);
      ctx.fillStyle = rgba(mix(bulbs[i % bulbs.length], WHITE, 0.4));
      ctx.beginPath(); ctx.arc(lx, y, 2, 0, TAU); ctx.fill();
    }
    starShape(ctx, 680, 312, 9, 4, rgba(mix(p.gold[0], WHITE, 0.3)));
    glow(ctx, 680, 312, 28, p.win, 0.6);
    snowman(ctx, 222, 520, 92, p);
    fence(ctx, r, 120, 530, 250, 512, 5, 34, 26, p);
    // Glinsteringen.
    for (let i = 0; i < 90; i++) {
      const x = 90 + r() * 720, y = 470 + r() * 110;
      ctx.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.6})`;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    // Onderrand zacht laten verlopen.
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    // destination-in werkt op het hele vlak: dus een verloop over de volle hoogte (boven dekkend).
    const fade = ctx.createLinearGradient(0, 0, 0, H);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(470 / H, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ------------------------------------------------------------------ voorbeeldbeelden (static/img/demo/kerst-*)
     Getekende sfeerbeelden voor de voorbeeldkerstkaart: geen foto's, geen mensen. */
  function bokeh(ctx, r, W, H, n, colors, rmin, rmax, blur, alpha) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = r() * H, rad = rmin + r() * (rmax - rmin);
      const c = pickFrom(r, colors);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, rgba(mix(c, WHITE, 0.3), alpha * (0.5 + r() * 0.5)));
      g.addColorStop(0.75, rgba(c, alpha * 0.45));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  function vignette(ctx, W, H, strength) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(20,10,5,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  function present(ctx, x, base, w, h, paper, ribbon) {
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, rgba(mix(paper, WHITE, 0.15)));
    g.addColorStop(1, rgba(mix(paper, BLACK, 0.25)));
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, base - h, w, h);
    ctx.fillStyle = rgba(mix(paper, WHITE, 0.2));
    ctx.fillRect(x - w / 2 - 4, base - h - h * 0.16, w + 8, h * 0.18);
    ctx.fillStyle = rgba(ribbon);
    ctx.fillRect(x - w * 0.07, base - h - h * 0.16, w * 0.14, h * 1.16);
    ctx.fillRect(x - w / 2, base - h * 0.55, w, h * 0.1);
    ctx.beginPath();
    ctx.ellipse(x - w * 0.14, base - h - h * 0.24, w * 0.16, h * 0.1, -0.5, 0, TAU);
    ctx.ellipse(x + w * 0.14, base - h - h * 0.24, w * 0.16, h * 0.1, 0.5, 0, TAU);
    ctx.fill();
  }

  const FOTO = {
    // Een versierde kerstboom in een warme kamer, met cadeaus eronder.
    boom(ctx, W, H) {
      const p = PALETTES.kaarslicht, r = rng(301);
      let g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#3A2419"); g.addColorStop(0.7, "#5B3924"); g.addColorStop(1, "#2E1D14");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.5, H * 0.45, W * 0.9, "#FFB866", 0.32);
      bokeh(ctx, r, W, H * 0.8, 70, ["#FFC870", "#FFDFA8", "#FF9F55", "#F7E3B5"], W * 0.02, W * 0.07, 6, 0.6);
      // Vloer.
      g = ctx.createLinearGradient(0, H * 0.8, 0, H);
      g.addColorStop(0, "#6E4A30"); g.addColorStop(1, "#3E2818");
      ctx.fillStyle = g; ctx.fillRect(0, H * 0.82, W, H * 0.18);
      glow(ctx, W * 0.5, H * 0.86, W * 0.5, "#FFB866", 0.25);
      const tp = Object.assign({}, p, { snow: "#F2F5F0", snowShade: "#C9D4CC" });
      lushPine(ctx, rng(8), W * 0.5, H * 0.86, H * 0.72, W * 0.68, tp, { tiers: 13, snow: 0.18 });
      // Lichtjes en ballen.
      for (let i = 0; i < 140; i++) {
        const k = r() * 0.86, y = H * 0.86 - H * 0.08 - k * H * 0.6, half = W * 0.68 * (1 - k * 0.86) * 0.42;
        const x = W * 0.5 + (r() - 0.5) * 2 * half;
        if (i % 3) {
          glow(ctx, x, y, W * 0.022, "#FFC766", 0.8);
          ctx.fillStyle = "#FFF4D8"; ctx.beginPath(); ctx.arc(x, y, W * 0.0035, 0, TAU); ctx.fill();
        } else {
          bauble(ctx, x, y, W * (0.009 + r() * 0.008), pickFrom(r, [p.red[0], p.gold[1], p.red[1], "#E9E1D2"]));
        }
      }
      glow(ctx, W * 0.5, H * 0.13, W * 0.12, "#FFE3A0", 0.9);
      starShape(ctx, W * 0.5, H * 0.13, W * 0.04, W * 0.017, "#FFE7A6");
      [[0.3, 0.9, 0.16, 0.1, p.red[0], p.gold[0]], [0.44, 0.92, 0.12, 0.08, "#E8DCC6", p.red[0]], [0.62, 0.91, 0.18, 0.12, "#2F4A36", p.gold[0]], [0.76, 0.93, 0.1, 0.07, p.gold[1], p.red[1]]]
        .forEach(([x, b, w, h, c1, c2]) => present(ctx, W * x, H * b, W * w, H * h, c1, c2));
      vignette(ctx, W, H, 0.55);
    },
    // Warme lichtjes met een dennentak op de voorgrond.
    lichtjes(ctx, W, H) {
      const p = PALETTES.kaarslicht, r = rng(302);
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#2A1A12"); g.addColorStop(1, "#46301F");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      bokeh(ctx, r, W, H, 90, ["#FFC66E", "#FFE0A6", "#FF9E58", "#FFF1CF", "#E9B87A"], W * 0.015, W * 0.06, 4, 0.75);
      bokeh(ctx, r, W, H, 16, ["#FFD28A", "#FFB86B"], W * 0.07, W * 0.12, 14, 0.4);
      ctx.save();
      ctx.filter = "blur(1.2px)";
      const pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([W * (-0.05 + u * 1.1), H * (0.72 - Math.sin(u * Math.PI) * 0.12 + u * 0.1)]); }
      pts.forEach(([x, y]) => {
        needleCluster(ctx, r, x, y, W * 0.06, -Math.PI / 2 + (r() - 0.5), p, 1.6, 3.2);
        needleCluster(ctx, r, x, y + H * 0.02, W * 0.05, Math.PI / 2 + (r() - 0.5), p, 1.2, 3);
      });
      pts.forEach(([x, y], i) => { if (i % 7 === 3) bauble(ctx, x + W * 0.01, y + H * 0.05, W * 0.03, i % 2 ? p.red[0] : p.gold[1]); });
      pinecone(ctx, r, W * 0.34, H * 0.8, W * 0.035, 0.4);
      ctx.restore();
      vignette(ctx, W, H, 0.5);
    },
    // Een besneeuwd bos in het blauwe uur, met een verlichte hut.
    winterbos(ctx, W, H) {
      const p = PALETTES.winternacht, r = rng(303);
      let g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1A2650"); g.addColorStop(0.55, "#3C4C7E"); g.addColorStop(0.75, "#8C7E9A"); g.addColorStop(1, "#D9DDEB");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,250,235,${0.3 + r() * 0.6})`; ctx.beginPath(); ctx.arc(r() * W, r() * H * 0.45, r() * 1.6 + 0.4, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.filter = "blur(1.5px)";
      for (let i = 0; i < 34; i++) {
        const x = r() * W, b = H * 0.72 + r() * 12, h = H * (0.1 + r() * 0.1), w = h * 0.42;
        ctx.fillStyle = rgba(mix("#2B3868", "#8C93B5", r() * 0.35));
        ctx.beginPath(); ctx.moveTo(x, b - h); ctx.lineTo(x + w / 2, b); ctx.lineTo(x - w / 2, b); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(230,236,248,0.55)";
        ctx.beginPath(); ctx.moveTo(x, b - h); ctx.lineTo(x + w * 0.14, b - h * 0.7); ctx.lineTo(x - w * 0.14, b - h * 0.7); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      g = ctx.createLinearGradient(0, H * 0.68, 0, H);
      g.addColorStop(0, "#B9C3DC"); g.addColorStop(1, "#EEF1F8");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, H * 0.74); ctx.bezierCurveTo(W * 0.3, H * 0.68, W * 0.6, H * 0.8, W, H * 0.72); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      glow(ctx, W * 0.56, H * 0.72, W * 0.26, "#FFB24A", 0.4);
      house(ctx, r, W * 0.56, H * 0.78, W * 0.14, H * 0.11, p, [], { lights: true });
      [[0.08, 0.98, 0.62], [0.24, 1.02, 0.5], [0.86, 1.0, 0.66], [0.97, 0.98, 0.52], [0.38, 0.9, 0.32], [0.74, 0.88, 0.3]].forEach(([x, b, h]) =>
        lushPine(ctx, rng(Math.round(x * 100)), W * x, H * b, H * h, H * h * 0.5, p, { tiers: 10 }));
      for (let i = 0; i < 260; i++) {
        const rad = r() * 2.4 + 0.6;
        ctx.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.5})`;
        ctx.beginPath(); ctx.arc(r() * W, r() * H, rad, 0, TAU); ctx.fill();
      }
      vignette(ctx, W, H, 0.35);
    },
    // Kaarsen tussen dennengroen, dennenappels en kerstballen.
    kaarsen(ctx, W, H) {
      const p = PALETTES.kaarslicht, r = rng(304);
      let g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#241510"); g.addColorStop(0.7, "#3C2519"); g.addColorStop(1, "#1C110C");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      bokeh(ctx, r, W, H * 0.6, 60, ["#FFC66E", "#FFE0A6", "#FF9E58"], W * 0.02, W * 0.07, 8, 0.55);
      // Tafel.
      g = ctx.createLinearGradient(0, H * 0.7, 0, H);
      g.addColorStop(0, "#5A3A26"); g.addColorStop(1, "#2A1A10");
      ctx.fillStyle = g; ctx.fillRect(0, H * 0.72, W, H * 0.28);
      const cp = Object.assign({}, p, { winGlow: "#FFB24A" });
      const ov = [];
      [[0.32, 0.86, 0.12, 0.34], [0.5, 0.88, 0.14, 0.44], [0.68, 0.87, 0.11, 0.28]].forEach(([x, b, w, h]) => {
        glow(ctx, W * x, H * (b - h) - W * 0.03, W * 0.35, "#FFB866", 0.35);
        candle(ctx, W * x, H * b, W * w, H * h, cp, ov);
      });
      for (let i = 0; i < 80; i++) needleCluster(ctx, r, W * (0.08 + r() * 0.84), H * (0.86 + r() * 0.08), W * 0.06, -Math.PI / 2 + (r() - 0.5) * 2, p, 1, 2.6);
      pinecone(ctx, r, W * 0.16, H * 0.9, W * 0.05, 1.2);
      pinecone(ctx, r, W * 0.84, H * 0.92, W * 0.045, -1.1);
      [[0.22, 0.93, 0.035, p.red[0]], [0.42, 0.95, 0.028, p.gold[1]], [0.6, 0.94, 0.032, p.red[1]], [0.78, 0.9, 0.03, p.gold[1]]].forEach(([x, y, rad, c]) => bauble(ctx, W * x, H * y, W * rad, c));
      hollyLeaf(ctx, W * 0.5, H * 0.94, W * 0.08, -2.6, p.garland[1]);
      hollyLeaf(ctx, W * 0.5, H * 0.94, W * 0.08, -0.5, p.garland[3]);
      berries(ctx, W * 0.5, H * 0.93, W * 0.012, p.berry);
      vignette(ctx, W, H, 0.6);
    },
  };

  /* ------------------------------------------------------------------ opdrachten vanuit render.cjs */
  window.WL = { PALETTES, G, rng };

  window.renderWinterlicht = function (kind, key, w, h, type, quality) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    let meta = null;
    if (kind === "scene") {
      ctx.scale(w / G.W, h / G.H);
      meta = scene(ctx, key, 2026);
      grain(ctx, w, h, 0.07, 11);
    } else if (kind === "huis") {
      ctx.scale(w / 900, h / 600);
      cottage(ctx, key);
    } else if (kind.indexOf("foto-") === 0) {
      FOTO[kind.slice(5)](ctx, w, h);
      grain(ctx, w, h, 0.06, 5);
    } else if (kind.indexOf("relief-") === 0 || kind.indexOf("goud-") === 0) {
      // relief-<motief>: licht en schaduw; goud-<motief>: dezelfde vormen in goud (voor de glans bij openen).
      const motif = kind.split("-")[1];
      const height = EMBOSS[motif](w, h, rng(40 + motif.length));
      if (kind.indexOf("relief-") === 0) {
        ctx.drawImage(embossify(height, { blur: motif === "patroon" ? 1.6 : 2.4, depth: 3 }), 0, 0);
      } else {
        const tmp = document.createElement("canvas");
        tmp.width = w; tmp.height = h;
        const tg = tmp.getContext("2d");
        tg.filter = "blur(0.8px)";
        tg.drawImage(height, 0, 0);
        const data = tg.getImageData(0, 0, w, h);
        for (let i = 0; i < data.data.length; i += 4) {
          const v = data.data[i];
          data.data[i] = 246; data.data[i + 1] = 212; data.data[i + 2] = 140; data.data[i + 3] = v;
        }
        tg.putImageData(data, 0, 0);
        ctx.drawImage(tmp, 0, 0);
      }
    }
    return { data: c.toDataURL(type || "image/png", quality || 0.9), meta };
  };
})();
