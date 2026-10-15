/* Kerstcoupé v1: het filmpje van de gordijnen in de opening, en de groet op het raam passend maken.
   - Na een tik op 'Open de gordijnen' speelt het filmpje (zonder geluid). Het laatste beeld is hetzelfde als de kop,
     dus als het openingsscherm vervaagt, loopt het naadloos over in de groet op het raam.
   - Is het filmpje nog niet (helemaal) geladen of mag het niet spelen, dan gaan de gordijnen open met een overvloeier.
   - Bij 'minder beweging' of 'Beweging uit' speelt er niets: invite.js opent dan rustig, direct op het open raam.
   Dit script draait vóór invite.js (het staat eerder in de pagina), zodat de tijden van de opening al kloppen
   op het moment dat invite.js ze leest. Zonder dit script opent de kaart met de overvloeier (style.css).
   Wijzig een uitgebrachte versie niet: maak een v2. */
(function () {
  "use strict";
  var html = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* De voorbeeldbalk: het beeld in de opening begint eronder, net als de kop, zodat ze precies op elkaar passen. */
  var bar = document.querySelector(".inv-banner");
  function setBar() { html.style.setProperty("--kc-bar", (bar ? bar.offsetHeight : 0) + "px"); }
  setBar();

  /* Veel tekst op het raam: de letters worden kleiner (nooit groter), zodat alles op het glas blijft. */
  var box = document.querySelector("[data-kc-fit]");
  function fit() {
    if (!box || !box.firstElementChild) return;
    var inner = box.firstElementChild;
    var scale = 1;
    box.style.setProperty("--kc-fit", "1");
    // Alleen de hoogte telt: de regels lopen in de breedte gewoon door naar een volgende regel.
    // (offsetHeight, niet scrollHeight: de waas achter de letters steekt bewust buiten het tekstvak uit.)
    for (var i = 0; i < 4; i++) {
      var room = box.clientHeight / Math.max(1, inner.offsetHeight);
      if (room >= 0.995) break;
      scale = Math.max(0.55, scale * room * 0.98);
      box.style.setProperty("--kc-fit", scale.toFixed(3));
    }
  }
  fit();
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { setBar(); fit(); }, 120);
  });
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(fit);
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", fit);
  }

  /* ---------- De opening ---------- */
  var cover = document.querySelector(".kc-cover");
  var film = cover && cover.querySelector("[data-kc-film]");
  if (!cover) return;
  if (film) {
    film.muted = true;
    film.addEventListener("playing", function () { cover.classList.add("kc-cover--film"); });
  }

  function timing(duration, intro, out) {
    cover.setAttribute("data-duration", String(duration));
    cover.setAttribute("data-fx-intro", String(intro));
    cover.style.setProperty("--kc-out", out + "ms");
  }
  /* Het filmpje speelt toch niet: dan de overvloeier (zie style.css). */
  function fade() { cover.classList.remove("kc-cover--speelt", "kc-cover--film"); }

  cover.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (html.classList.contains("is-opening") || html.classList.contains("is-open")) return;
      if (reduceMotion || html.classList.contains("fx-paused")) return;
      // Alleen afspelen als het hele filmpje er is; anders hapert het halverwege.
      // (De standaardtijden in invitation.html horen bij de overvloeier.)
      if (film && film.readyState >= 4) {
        cover.classList.add("kc-cover--speelt");
        timing(4300, 3700, 3800);
        try { film.currentTime = 0; } catch (e) { /* nog niet te spoelen */ }
        var attempt = film.play();
        if (attempt && attempt.catch) attempt.catch(fade);
      }
    });
  });

  /* 'Beweging uit' tijdens het filmpje: meteen naar het open raam (het laatste beeld). */
  function calmFilm() {
    if (!film || film.paused || !html.classList.contains("fx-paused")) return;
    film.pause();
    try { film.currentTime = film.duration || film.currentTime; } catch (e) { /* laat staan */ }
  }
  new MutationObserver(calmFilm).observe(html, { attributes: true, attributeFilter: ["class"] });
})();
