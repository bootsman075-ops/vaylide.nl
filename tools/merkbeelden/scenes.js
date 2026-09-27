/* Vaylide: eigen sfeerbeelden voor de website, getekend op een canvas.
   Geen foto's of stockbeeld: alleen verlopen, vervaagde vormen en korrel.
   Wordt gebruikt door render.cjs (zie README in deze map). */
(function () {
  "use strict";

  function rng(seed) {
    let s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const mix = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));

  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function leaf(ctx, x, y, len, width, angle, color, alpha, vein) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, -width, 0, width);
    g.addColorStop(0, rgba(mix(color, [255, 255, 255], .18), alpha));
    g.addColorStop(1, rgba(mix(color, [0, 0, 0], .18), alpha));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * .3, -width, len * .75, -width * .8, len, 0);
    ctx.bezierCurveTo(len * .75, width * .8, len * .3, width, 0, 0);
    ctx.fill();
    if (vein) {
      ctx.strokeStyle = rgba(mix(color, [255, 255, 255], .35), alpha * .45);
      ctx.lineWidth = Math.max(1, width * .06);
      ctx.beginPath(); ctx.moveTo(len * .04, 0); ctx.quadraticCurveTo(len * .5, -width * .08, len * .96, 0); ctx.stroke();
    }
    ctx.restore();
  }

  // Een twijg: gebogen steel met bladeren om en om.
  function sprig(ctx, r, x, y, len, angle, color, alpha, leafLen, blur) {
    ctx.save();
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    const steps = 9;
    let px = x, py = y, a = angle;
    ctx.strokeStyle = rgba(mix(color, [0, 0, 0], .1), alpha * .8);
    ctx.lineWidth = Math.max(1.5, leafLen * .045);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      pts.push([px, py, a]);
      px += Math.cos(a) * len / steps;
      py += Math.sin(a) * len / steps;
      a += (r() - .5) * .12;
    }
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.stroke();
    pts.slice(1).forEach((p, i) => {
      const side = i % 2 ? 1 : -1;
      const size = leafLen * (1 - i / (steps + 3)) * (.8 + r() * .35);
      leaf(ctx, p[0], p[1], size, size * .36, p[2] + side * (.75 + r() * .35), mix(color, [40, 50, 30], r() * .3), alpha, true);
    });
    leaf(ctx, px, py, leafLen * .6, leafLen * .22, a, color, alpha, true);
    ctx.restore();
  }

  // Een zachte bloem (pioen/roos): buitenste bladeren, gebolde lagen en een dicht hart.
  function bloom(ctx, r, x, y, size, base, alpha, blur) {
    ctx.save();
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    const shade = mix(base, [150, 105, 90], .32);
    const light = mix(base, [255, 252, 246], .45);
    // Buitenste, open bladeren.
    const outer = 11;
    for (let p = 0; p < outer; p++) {
      const a = (p / outer) * Math.PI * 2 + r() * .35;
      const rad = size * (.9 + r() * .25);
      ctx.save();
      ctx.translate(x + Math.cos(a) * rad * .42, y + Math.sin(a) * rad * .42 * .82);
      ctx.rotate(a + (r() - .5) * .3);
      const g = ctx.createRadialGradient(-rad * .25, 0, rad * .05, 0, 0, rad * .6);
      g.addColorStop(0, rgba(mix(base, light, .3), alpha));
      g.addColorStop(.75, rgba(base, alpha));
      g.addColorStop(1, rgba(shade, alpha * .95));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, rad * .5, rad * .38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Gebolde lagen naar binnen toe, met schaduw onder elke laag.
    for (let l = 0; l < 4; l++) {
      const ring = size * (.62 - l * .13);
      const n = 9 - l;
      for (let p = 0; p < n; p++) {
        const a = (p / n) * Math.PI * 2 + l * .7 + r() * .4;
        const px = x + Math.cos(a) * ring * .45, py = y + Math.sin(a) * ring * .38;
        const pr = ring * (.55 + r() * .15);
        ctx.fillStyle = rgba(shade, alpha * .35);
        ctx.beginPath(); ctx.ellipse(px, py + pr * .12, pr * .62, pr * .42, a, 0, Math.PI * 2); ctx.fill();
        const g = ctx.createLinearGradient(px, py - pr * .5, px, py + pr * .5);
        g.addColorStop(0, rgba(light, alpha));
        g.addColorStop(1, rgba(mix(base, shade, .25), alpha));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(px, py, pr * .6, pr * .4, a, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Dicht hart met kleine gekrulde blaadjes.
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, d = r() * size * .16;
      ctx.fillStyle = rgba(r() > .5 ? light : mix(base, shade, .4), alpha * .9);
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, size * (.05 + r() * .06), size * (.03 + r() * .03), a, 0, Math.PI * 2); ctx.fill();
    }
    glow(ctx, x, y, size * .3, mix(base, [205, 160, 120], .5), alpha * .35);
    ctx.restore();
  }

  function bokeh(ctx, r, n, area, colors, rMin, rMax, aMin, aMax, blur) {
    ctx.save();
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    for (let i = 0; i < n; i++) {
      const x = area[0] + r() * (area[2] - area[0]);
      const y = area[1] + r() * (area[3] - area[1]);
      const rad = rMin + r() * (rMax - rMin);
      const c = colors[Math.floor(r() * colors.length)];
      const a = aMin + r() * (aMax - aMin);
      const g = ctx.createRadialGradient(x, y, rad * .2, x, y, rad);
      g.addColorStop(0, rgba(c, a * .75));
      g.addColorStop(.85, rgba(c, a));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function grain(ctx, w, h, amount, seed) {
    const r = rng(seed);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - .5) * amount;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }

  const SCENES = {
    // Gouden uur in een tuin: licht links, groen en bloemen rechts.
    hero(ctx, w, h) {
      const r = rng(11);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#F8EADB"); bg.addColorStop(.5, "#F0D7BB"); bg.addColorStop(1, "#D5B991");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // Verre bomen, zonbeschenen en sterk vervaagd.
      ctx.save(); ctx.filter = "blur(42px)";
      for (let i = 0; i < 34; i++) {
        const x = w * (.5 + r() * .56), y = h * (-.05 + r() * .72), rad = w * (.04 + r() * .08);
        const c = mix([104, 112, 70], [172, 164, 110], r());
        ctx.fillStyle = rgba(c, .38 + r() * .32);
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // Laagstaande zon en lichtwaas.
      glow(ctx, w * .6, h * .2, w * .5, [255, 238, 206], .75);
      glow(ctx, w * .6, h * .2, w * .16, [255, 250, 236], .95);
      glow(ctx, w * .3, h * .45, w * .45, [252, 236, 214], .55);
      bokeh(ctx, r, 90, [w * .48, 0, w, h * .85], [[255, 242, 212], [255, 228, 184], [252, 250, 238]], 5, 30, .16, .5, 2);
      // Gras en veld onderin, zacht.
      ctx.save(); ctx.filter = "blur(26px)";
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = rgba(mix([186, 160, 112], [140, 136, 90], r()), .35 + r() * .25);
        ctx.beginPath(); ctx.ellipse(w * (.35 + r() * .7), h * (.8 + r() * .25), w * (.06 + r() * .08), h * .06, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // Takken van voren, onscherp.
      sprig(ctx, r, w * 1.03, h * -.02, w * .34, Math.PI * .8, [98, 112, 74], .88, w * .07, 9);
      sprig(ctx, r, w * 1.02, h * .42, w * .26, Math.PI * .95, [112, 124, 84], .8, w * .05, 6);
      sprig(ctx, r, w * .7, h * 1.06, w * .22, -Math.PI * .58, [104, 118, 80], .78, w * .045, 5);
      // Bloemen rechtsonder.
      bloom(ctx, r, w * .88, h * .84, w * .08, [247, 236, 220], .97, 2.5);
      bloom(ctx, r, w * .76, h * .97, w * .062, [242, 219, 204], .95, 5);
      bloom(ctx, r, w * .985, h * .64, w * .05, [249, 240, 228], .92, 8);
      bloom(ctx, r, w * .64, h * .9, w * .04, [246, 230, 216], .9, 12);
      bokeh(ctx, r, 26, [w * .5, h * .05, w, h], [[255, 247, 228]], 2.5, 9, .35, .8, 1);
      // Licht dat van links naar crème verloopt.
      const fade = ctx.createLinearGradient(0, 0, w * .56, 0);
      fade.addColorStop(0, "rgba(250,240,229,.92)"); fade.addColorStop(1, "rgba(250,240,229,0)");
      ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, 7, 3);
    },

    // Donker groen met bloemen links: achtergrond voor 'Meer dan een uitnodiging'.
    groen(ctx, w, h) {
      const r = rng(23);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#27301F"); bg.addColorStop(.5, "#1D251A"); bg.addColorStop(1, "#141A12");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.filter = "blur(46px)";
      for (let i = 0; i < 30; i++) {
        const x = r() * w, y = r() * h, rad = w * (.04 + r() * .1);
        ctx.fillStyle = rgba(mix([52, 66, 42], [88, 96, 62], r()), .45 + r() * .35);
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      glow(ctx, w * .82, h * .15, w * .35, [150, 150, 110], .22);
      // Blad links, scherper naar voren.
      for (let i = 0; i < 7; i++) {
        sprig(ctx, r, w * (-.04 + r() * .12), h * (r()), w * (.18 + r() * .14), -Math.PI * (.1 - r() * .35), [70, 92, 60], .9, w * (.04 + r() * .025), 3 + r() * 9);
      }
      bloom(ctx, r, w * .09, h * .22, w * .06, [236, 214, 200], .95, 3);
      bloom(ctx, r, w * .2, h * .55, w * .07, [240, 222, 206], .95, 2);
      bloom(ctx, r, w * .05, h * .82, w * .065, [232, 204, 192], .95, 4);
      bloom(ctx, r, w * .3, h * .9, w * .05, [244, 230, 214], .9, 9);
      bloom(ctx, r, w * .33, h * .12, w * .045, [236, 212, 198], .85, 12);
      // Rechts rustig en donker voor de tekst.
      const fade = ctx.createLinearGradient(w * .38, 0, w, 0);
      fade.addColorStop(0, "rgba(22,28,19,0)"); fade.addColorStop(.35, "rgba(22,28,19,.72)"); fade.addColorStop(1, "rgba(20,26,17,.86)");
      ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
      bokeh(ctx, r, 16, [w * .55, 0, w, h], [[190, 190, 150]], 20, 60, .04, .1, 8);
      grain(ctx, w, h, 8, 5);
    },

    // Zacht botanisch stilleven voor 'Liever iets unieks?'.
    maatwerk(ctx, w, h) {
      const r = rng(37);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#FBF4EC"); bg.addColorStop(1, "#EFE1D0");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      glow(ctx, w * .75, h * .15, w * .6, [255, 247, 234], .9);
      ctx.save(); ctx.filter = "blur(30px)";
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = rgba(mix([214, 196, 170], [190, 176, 150], r()), .35);
        ctx.beginPath(); ctx.arc(w * (.5 + r() * .5), h * (.4 + r() * .6), w * (.05 + r() * .08), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // Kaarten met zachte schaduw.
      function card(x, y, cw, ch, rot, fill) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.shadowColor = "rgba(90,70,50,.22)"; ctx.shadowBlur = w * .03; ctx.shadowOffsetY = w * .01;
        ctx.fillStyle = fill; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(184,149,95,.55)"; ctx.lineWidth = Math.max(1, w * .0016);
        ctx.strokeRect(-cw / 2 + cw * .07, -ch / 2 + cw * .07, cw - cw * .14, ch - cw * .14);
        ctx.restore();
      }
      card(w * .63, h * .56, w * .3, w * .42, -.12, "#FFFCF7");
      card(w * .78, h * .5, w * .28, w * .39, .09, "#FDF8F1");
      // Envelop met zegel.
      ctx.save(); ctx.translate(w * .56, h * .86); ctx.rotate(.05);
      ctx.shadowColor = "rgba(90,70,50,.2)"; ctx.shadowBlur = w * .025; ctx.shadowOffsetY = w * .008;
      ctx.fillStyle = "#F3E6D6"; ctx.fillRect(-w * .2, -w * .09, w * .4, w * .18);
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(160,130,100,.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w * .2, -w * .09); ctx.lineTo(0, w * .02); ctx.lineTo(w * .2, -w * .09); ctx.stroke();
      const sg = ctx.createRadialGradient(-w * .008, w * .012, 2, 0, w * .02, w * .03);
      sg.addColorStop(0, "#C9A56C"); sg.addColorStop(1, "#8E6A3B");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, w * .02, w * .028, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      sprig(ctx, r, w * 1.02, h * .08, w * .34, Math.PI * .82, [120, 136, 104], .9, w * .06, 1.5);
      sprig(ctx, r, w * .98, h * 1.02, w * .3, -Math.PI * .7, [110, 128, 96], .85, w * .055, 4);
      bloom(ctx, r, w * .95, h * .72, w * .07, [242, 222, 208], .96, 1.5);
      bloom(ctx, r, w * .43, h * .98, w * .05, [246, 232, 220], .9, 6);
      const fade = ctx.createLinearGradient(0, 0, w * .6, 0);
      fade.addColorStop(0, "rgba(250,244,236,.96)"); fade.addColorStop(1, "rgba(250,244,236,0)");
      ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, 6, 9);
    },
  };

  window.renderScene = function (name, w, h, type, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    SCENES[name](ctx, w, h);
    document.body.appendChild(canvas);
    return canvas.toDataURL(type || "image/webp", quality || .82);
  };
})();
