/* Kerstexpress v1: het filmpje in de opening.
   Het filmpje heeft de envelop al (de klep gaat open in de film), dus de envelop van de opening verdwijnt dan.
   Zonder dit script of zonder filmpje blijft de envelop staan, zoals in de eerste versie van de opening.
   Bij 'minder beweging' of 'Beweging uit' speelt het filmpje niet af: het eerste beeld blijft staan.
   Wijzig een uitgebrachte versie niet: maak een v2. */
(function () {
  "use strict";
  var cover = document.querySelector(".kx-cover");
  var film = cover && cover.querySelector("[data-kx-film]");
  if (!film) return;
  var html = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Het filmpje speelt alleen als de opening in beeld is, niet 'stil' staat en de gast niet op 'Beweging uit' tikte.
  function sync() {
    if (!cover.classList.contains("kx-cover--film")) return;
    var calm = reduceMotion || html.classList.contains("fx-paused");
    var show = html.classList.contains("has-cover") && !html.classList.contains("is-opening");
    if (!calm && show) {
      if (film.paused) film.play().catch(function () {});
    } else if (!film.paused) {
      film.pause();
    }
  }

  function showFilm() {
    cover.classList.add("kx-cover--film");
    sync();
  }

  film.muted = true;
  if (film.readyState >= 2) showFilm();
  film.addEventListener("loadeddata", showFilm);
  document.addEventListener("invite:opening", function () { film.pause(); });
  new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ["class"] });
})();
