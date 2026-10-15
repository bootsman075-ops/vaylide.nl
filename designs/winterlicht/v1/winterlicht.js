/* Winterlicht v1: kraskaartjes met goudfolie voor de datum.
   Zonder dit script staat de datum er gewoon; schermlezers lezen altijd de volledige datum voor
   (verborgen tekst in de sectie), en de knop 'Toon de datum zonder krassen' werkt met het toetsenbord.
   Wijzig een uitgebrachte versie niet: maak een v2. */

/* De gouden laag van de envelop laadt pas als de rest er is: hij is nodig bij het openen, niet eerder. */
(function () {
  "use strict";
  function done() { document.documentElement.classList.add("wl-geladen"); }
  if (document.readyState === "complete") done(); else window.addEventListener("load", done);
})();

/* De kop vult precies het scherm: de voorbeeldbalk bovenaan gaat eraf, zodat 'Scroll verder' in beeld blijft. */
(function () {
  "use strict";
  var bar = document.querySelector(".inv-banner");
  if (!bar) return;
  function set() { document.documentElement.style.setProperty("--wl-bar", bar.offsetHeight + "px"); }
  set();
  if (window.ResizeObserver) new ResizeObserver(set).observe(bar);
})();

/* Veel tekst (een lange naam, veel namen eronder): de tekst in het kerstraam wordt iets kleiner, zodat hij boven
   het kerkje blijft. Zonder dit script staat de tekst er op de gewone maat. */
(function () {
  "use strict";
  var art = document.querySelector(".wl-hero__art");
  var text = art && art.querySelector(".wl-hero__text");
  if (!text) return;
  var LIMIT = 0.485; // tot hier mag de tekst komen, als deel van de hoogte van de tekening (de torenspits staat op 49%)
  function fit() {
    text.style.removeProperty("--wl-fit");
    var scale = 1;
    for (var i = 0; i < 4; i++) {
      var room = art.clientHeight * LIMIT - text.offsetTop;
      var need = text.offsetHeight;
      if (!need || need <= room || scale <= 0.62) break;
      scale = Math.max(0.62, scale * (room / need) * 0.98);
      text.style.setProperty("--wl-fit", scale.toFixed(3));
    }
  }
  // Opnieuw meten zodra de sierletters er zijn (daarvoor meet de browser een reserveletter) en bij een andere maat.
  fit();
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(fit);
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", fit);
  }
  window.addEventListener("load", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(art);
})();

/* De lichtjes in het kerstraam rusten zodra de kop uit beeld is: dat spaart de processor van oudere telefoons. */
(function () {
  "use strict";
  var lights = document.querySelector(".wl-lights");
  if (!lights || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (entries) {
    lights.classList.toggle("wl-lights--rust", !entries[entries.length - 1].isIntersecting);
  }).observe(lights);
})();

(function () {
  "use strict";

  var group = document.querySelector("[data-scratch-group]");
  if (!group || !window.HTMLCanvasElement) return;
  var tiles = Array.prototype.slice.call(group.querySelectorAll(".wl-scratch__tile"));
  var after = document.querySelector("[data-scratch-after]");
  var allBtn = document.querySelector("[data-scratch-all]");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Goudfolie: verloop, geborstelde strepen, reliëfsterretjes en een glansbaan. */
  function paintFoil(canvas, index) {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(10, Math.round(rect.width * dpr)), h = Math.max(10, Math.round(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    var g = canvas.getContext("2d");
    var r = rng(17 + index * 31);
    var base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#B8893F");
    base.addColorStop(0.28, "#F3DB9C");
    base.addColorStop(0.5, "#C99A4E");
    base.addColorStop(0.72, "#F6E2AC");
    base.addColorStop(1, "#A97C35");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) {
      var y = r() * h;
      g.strokeStyle = r() < 0.5 ? "rgba(255,248,220," + (0.08 + r() * 0.12) + ")" : "rgba(110,72,20," + (0.05 + r() * 0.08) + ")";
      g.lineWidth = dpr * (0.5 + r());
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y + (r() - 0.5) * 6 * dpr);
      g.stroke();
    }
    // Reliëfsterretjes (licht links boven, schaduw rechts onder).
    var step = 26 * dpr;
    for (var yy = step / 2; yy < h; yy += step) {
      for (var xx = ((yy / step) % 2 ? step / 2 : 0) + step / 4; xx < w; xx += step) {
        star(g, xx + dpr, yy + dpr, 3.2 * dpr, "rgba(95,60,15,0.28)");
        star(g, xx, yy, 3.2 * dpr, "rgba(255,250,228,0.55)");
      }
    }
    var shine = g.createLinearGradient(0, 0, w, h);
    shine.addColorStop(0.3, "rgba(255,255,255,0)");
    shine.addColorStop(0.45, "rgba(255,255,255,0.35)");
    shine.addColorStop(0.6, "rgba(255,255,255,0)");
    g.fillStyle = shine;
    g.fillRect(0, 0, w, h);
    // Een sneeuwvlok in het midden als teken dat hier iets onder zit.
    g.save();
    g.translate(w / 2, h / 2);
    g.strokeStyle = "rgba(110,72,20,0.45)";
    g.lineWidth = 1.6 * dpr;
    g.lineCap = "round";
    var R = Math.min(w, h) * 0.16;
    for (var a = 0; a < 6; a++) {
      g.rotate(Math.PI / 3);
      g.beginPath();
      g.moveTo(0, 0); g.lineTo(0, -R);
      g.moveTo(0, -R * 0.55); g.lineTo(-R * 0.22, -R * 0.78);
      g.moveTo(0, -R * 0.55); g.lineTo(R * 0.22, -R * 0.78);
      g.stroke();
    }
    g.restore();
    canvas._dpr = dpr;
  }

  function star(g, x, y, R, color) {
    g.fillStyle = color;
    g.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 ? R * 0.42 : R;
      g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    g.closePath();
    g.fill();
  }

  function sparkle(tile) {
    if (calm || document.documentElement.classList.contains("fx-paused")) return;
    for (var i = 0; i < 7; i++) {
      var s = document.createElement("span");
      s.className = "wl-scratch__spark";
      var a = (i / 7) * Math.PI * 2;
      s.style.setProperty("--dx", Math.round(Math.cos(a) * 46) + "px");
      s.style.setProperty("--dy", Math.round(Math.sin(a) * 46) + "px");
      tile.appendChild(s);
      window.setTimeout(function (el) { return function () { el.remove(); }; }(s), 1000);
    }
  }

  function checkDone() {
    var done = tiles.every(function (t) { return t.classList.contains("is-revealed"); });
    if (done) {
      if (after) after.classList.add("is-shown");
      if (allBtn) allBtn.hidden = true;
    }
    return done;
  }

  function reveal(tile) {
    if (tile.classList.contains("is-revealed")) return;
    tile.classList.add("is-revealed");
    sparkle(tile);
    checkDone();
  }

  tiles.forEach(function (tile, index) {
    var canvas = tile.querySelector("[data-scratch]");
    if (!canvas) return;
    var ready = false;
    var drawing = false;
    var last = null;
    var moves = 0;

    function prepare() {
      if (tile.classList.contains("is-revealed")) return;
      paintFoil(canvas, index);
      ready = true;
    }

    function point(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * canvas._dpr, y: (e.clientY - rect.top) * canvas._dpr };
    }

    function scratch(p) {
      var g = canvas.getContext("2d");
      var rad = 17 * canvas._dpr;
      // Wegkrassen met een dekkende kleur: anders haalt elke streek maar een deel van de folie weg.
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = "#000";
      g.strokeStyle = "#000";
      g.lineCap = "round";
      g.lineJoin = "round";
      g.lineWidth = rad * 2;
      g.beginPath();
      if (last) { g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); }
      g.beginPath();
      g.arc(p.x, p.y, rad, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = "source-over";
      last = p;
      if (++moves % 6 === 0 && cleared() > 0.48) reveal(tile);
    }

    // Hoeveel van de folie is weg? Een grove steekproef is genoeg.
    function cleared() {
      var g = canvas.getContext("2d");
      var data = g.getImageData(0, 0, canvas.width, canvas.height).data;
      var total = 0, open = 0, stride = 4 * 24;
      for (var i = 3; i < data.length; i += stride) { total++; if (data[i] < 40) open++; }
      return total ? open / total : 0;
    }

    canvas.addEventListener("pointerdown", function (e) {
      if (!ready || tile.classList.contains("is-revealed")) return;
      drawing = true;
      last = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* oudere browser */ }
      scratch(point(e));
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      scratch(point(e));
    });
    function stop() { drawing = false; last = null; }
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("lostpointercapture", stop);

    // Pas tekenen als het vakje een maat heeft (het staat eerst onzichtbaar of onder het openingsscherm).
    if ("ResizeObserver" in window) {
      var seen = false;
      new ResizeObserver(function () {
        if (canvas.clientWidth > 0 && (!seen || ready)) { seen = true; prepare(); }
      }).observe(canvas);
    } else {
      window.addEventListener("load", prepare);
    }
  });

  if (allBtn) {
    allBtn.hidden = false;
    allBtn.addEventListener("click", function () {
      tiles.forEach(reveal);
      // De knop verdwijnt; de focus gaat naar de kop van de sectie.
      var title = document.getElementById("wl-date-title");
      if (title) { title.setAttribute("tabindex", "-1"); title.focus(); }
    });
  }
})();
