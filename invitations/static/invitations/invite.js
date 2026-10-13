/* Vaylide: gedrag van de uitnodigingspagina.
   Openen, onthullen, afteller, muziek (alleen na een tik), delen en aanmelden.
   Alles werkt ook zonder dit script: de inhoud blijft dan gewoon leesbaar. */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  html.classList.add("invite-ready");

  /* Melodieën voor het speeldoosje in de voorbeelden: [midi, lengte in achtsten].
     'Stille nacht' (Franz Xaver Gruber, 1818) is publiek domein; de zetting en de klank zijn eigen synthese. */
  var MELODIES = {
    "stille-nacht": {
      eighth: 0.37,
      melody: [
        [67, 1.5], [69, 0.5], [67, 1], [64, 3], [67, 1.5], [69, 0.5], [67, 1], [64, 3],
        [74, 2], [74, 1], [71, 3], [72, 2], [72, 1], [67, 3],
        [69, 2], [69, 1], [72, 1.5], [71, 0.5], [69, 1], [67, 1.5], [69, 0.5], [67, 1], [64, 3],
        [69, 2], [69, 1], [72, 1.5], [71, 0.5], [69, 1], [67, 1.5], [69, 0.5], [67, 1], [64, 3],
        [74, 2], [74, 1], [77, 1.5], [74, 0.5], [71, 1], [72, 3], [76, 3],
        [72, 1.5], [67, 0.5], [64, 1], [67, 1.5], [65, 0.5], [62, 1], [60, 6]
      ],
      // Per maat (6 achtsten) twee begeleidingstonen: grondtoon en kwint, op tel 1 en tel 2.
      bass: [[48, 55], [48, 55], [43, 50], [48, 55], [41, 48], [48, 55], [41, 48], [48, 55], [43, 50], [48, 55], [48, 43], [48, 55]],
      rest: 3
    }
  };

  /* ---------- Muziek ---------- */
  var music = (function () {
    var root = document.querySelector("[data-music]");
    if (!root) return { play: function () {}, available: false };
    var toggle = root.querySelector("[data-music-toggle]");
    var label = root.querySelector("[data-music-label]");
    var audio = root.querySelector("[data-music-audio]");
    var melody = root.getAttribute("data-music-synth");
    var synth = root.hasAttribute("data-music-synth") ? (MELODIES[melody] ? createMusicBox(MELODIES[melody]) : createSynth()) : null;
    var playing = false;
    if (!audio && !synth) return { play: function () {}, available: false };
    toggle.hidden = false;

    function setState(on) {
      playing = on;
      toggle.setAttribute("aria-pressed", on ? "true" : "false");
      label.textContent = on ? "Muziek pauzeren" : "Muziek afspelen";
    }
    function play() {
      if (synth) { synth.start(); setState(true); return; }
      var attempt = audio.play();
      if (attempt && attempt.then) {
        attempt.then(function () { setState(true); }).catch(function () {
          setState(false);
          label.textContent = "Muziek kon niet starten";
        });
      } else { setState(true); }
    }
    function pause() {
      if (synth) synth.stop(); else audio.pause();
      setState(false);
    }
    if (audio) {
      audio.addEventListener("error", function () {
        toggle.disabled = true;
        label.textContent = "Muziek niet beschikbaar";
      });
    }
    toggle.addEventListener("click", function () { if (playing) pause(); else play(); });
    return { play: play, available: true };
  })();

  /* Speeldoosje met een melodie: klokjesklank (grondtoon plus boventonen) en een zachte galm. */
  function createMusicBox(tune) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = null, out = null, timer = null, nextTime = 0, index = 0, playing = false;
    var events = [];
    var t = 0;
    tune.melody.forEach(function (n) { events.push({ at: t, midi: n[0] + 12, len: n[1], gain: 0.16 }); t += n[1]; });
    tune.bass.forEach(function (pair, i) {
      events.push({ at: i * 6, midi: pair[0] + 12, len: 3, gain: 0.07 });
      events.push({ at: i * 6 + 3, midi: pair[1] + 12, len: 3, gain: 0.055 });
    });
    events.sort(function (a, b) { return a.at - b.at; });
    var loopLength = t + (tune.rest || 0);

    function setup() {
      ctx = new AC();
      var master = ctx.createGain();
      master.gain.value = 0.9;
      var soften = ctx.createBiquadFilter();
      soften.type = "lowpass";
      soften.frequency.value = 4200;
      // Galm: een korte, zelfgemaakte impulsrespons (ruis die wegsterft).
      var verb = ctx.createConvolver();
      var len = Math.round(ctx.sampleRate * 2.4);
      var ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var c = 0; c < 2; c++) {
        var data = ir.getChannelData(c);
        for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      }
      verb.buffer = ir;
      var wet = ctx.createGain();
      wet.gain.value = 0.32;
      out = ctx.createGain();
      out.connect(soften);
      soften.connect(master);
      out.connect(verb);
      verb.connect(wet);
      wet.connect(master);
      master.connect(ctx.destination);
    }

    function bell(midi, when, gain) {
      var f = 440 * Math.pow(2, (midi - 69) / 12);
      [[1, 1, 2.2], [2.01, 0.28, 0.9], [3.02, 0.1, 0.45], [4.2, 0.05, 0.25]].forEach(function (part) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f * part[0];
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(gain * part[1], when + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, when + part[2]);
        osc.connect(g);
        g.connect(out);
        osc.start(when);
        osc.stop(when + part[2] + 0.05);
      });
    }

    function schedule() {
      var ahead = ctx.currentTime + 0.35;
      while (nextTime < ahead) {
        var e = events[index];
        bell(e.midi, nextTime, e.gain);
        index++;
        var nextAt = index < events.length ? events[index].at : loopLength;
        var delta = nextAt - e.at;
        if (index >= events.length) { index = 0; }
        nextTime += delta * tune.eighth;
      }
    }

    return {
      start: function () {
        if (!ctx) setup();
        if (ctx.state === "suspended") ctx.resume();
        if (playing) return;
        playing = true;
        index = 0;
        nextTime = ctx.currentTime + 0.08;
        schedule();
        timer = setInterval(schedule, 100);
      },
      stop: function () {
        // Wat al klinkt, sterft vanzelf uit in de galm.
        playing = false;
        clearInterval(timer);
        timer = null;
      }
    };
  }

  /* Speeldoosje voor de voorbeelden (eigen synthese, geen bestand nodig).
     Melodie: canon-achtige akkoordenreeks (publiek domein). */
  function createSynth() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = null, timer = null, step = 0;
    var chords = [
      [62, 66, 69], [57, 61, 64], [59, 62, 66], [54, 57, 61],
      [55, 59, 62], [50, 54, 57], [55, 59, 62], [57, 61, 64]
    ];
    function note(midi, when, length, volume) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(volume, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(when);
      osc.stop(when + length + 0.05);
    }
    function tick() {
      var chord = chords[Math.floor(step / 4) % chords.length];
      var t = ctx.currentTime + 0.05;
      var pattern = [0, 1, 2, 1];
      note(chord[pattern[step % 4]] + 12, t, 1.4, 0.06);
      if (step % 4 === 0) note(chord[0] - 12, t, 2.4, 0.05);
      step++;
    }
    return {
      start: function () {
        if (!ctx) ctx = new AC();
        if (ctx.state === "suspended") ctx.resume();
        if (!timer) { tick(); timer = setInterval(tick, 420); }
      },
      stop: function () { clearInterval(timer); timer = null; }
    };
  }

  /* ---------- Openingsscherm ---------- */
  (function () {
    var cover = document.querySelector("[data-cover]");
    var main = document.getElementById("uitnodiging");
    if (!cover || !main) return;
    var key = "vierlief-open:" + location.pathname;
    var skip = /^#(aanmelden|aanmelden-formulier|uitnodiging)/.test(location.hash);
    try { if (sessionStorage.getItem(key)) skip = true; } catch (e) { /* privémodus */ }
    if (skip) { finish(true); return; }

    html.classList.add("has-cover");
    main.inert = true;
    var opened = false;

    cover.querySelectorAll("[data-open]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.preventDefault();
        if (el.hasAttribute("data-open-music")) music.play();
        open();
      });
      el.addEventListener("keydown", function (event) {
        if (event.key === " " || event.key === "Spacebar") { event.preventDefault(); el.click(); }
      });
    });

    function open() {
      if (opened) return;
      opened = true;
      /* Rustig openen bij 'minder beweging' of als de gast de beweging heeft stilgezet (effects.js). */
      var calm = reduceMotion || html.classList.contains("fx-paused");
      var duration = calm ? 250 : parseInt(cover.getAttribute("data-duration") || "2200", 10);
      html.classList.add("is-opening");
      if (calm) html.classList.add("is-opening-reduced");
      document.dispatchEvent(new CustomEvent("invite:opening", { detail: { reduceMotion: calm } }));
      window.setTimeout(function () { finish(false); }, duration);
    }

    function finish(instant) {
      html.classList.remove("has-cover", "is-opening", "is-opening-reduced");
      html.classList.add("is-open");
      cover.hidden = true;
      main.inert = false;
      try { sessionStorage.setItem(key, "1"); } catch (e) { /* privémodus */ }
      if (!instant) {
        window.scrollTo(0, 0);
        var heading = main.querySelector("h1");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
      document.dispatchEvent(new CustomEvent("invite:opened", { detail: { instant: !!instant } }));
    }
  })();

  /* ---------- Onthullen bij scrollen ---------- */
  (function () {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------- Afteller ---------- */
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var target = Date.parse(el.getAttribute("data-countdown"));
    if (isNaN(target)) return;
    var parts = {};
    el.querySelectorAll("[data-unit]").forEach(function (n) { parts[n.getAttribute("data-unit")] = n; });
    var done = el.parentNode.querySelector("[data-countdown-done]");
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function show(node, value) {
      if (!node || node.textContent === value) return;
      node.textContent = value;
      /* Cijfer klapt om (alleen met beweging; zie effects.css). */
      if (html.classList.contains("fx-motion")) {
        node.classList.remove("is-tick");
        void node.offsetWidth;
        node.classList.add("is-tick");
      }
    }
    function update() {
      /* Stilgezet met de knop 'Beweging': de afteller loopt pas verder als de beweging weer aan staat. */
      if (html.classList.contains("fx-paused")) return true;
      var diff = Math.max(0, target - Date.now());
      if (diff <= 0) {
        el.hidden = true;
        if (done) done.hidden = false;
        return false;
      }
      var s = Math.floor(diff / 1000);
      var days = Math.floor(s / 86400);
      show(parts.days, String(days));
      show(parts.hours, pad(Math.floor((s % 86400) / 3600)));
      show(parts.minutes, pad(Math.floor((s % 3600) / 60)));
      show(parts.seconds, pad(s % 60));
      var dayLabel = parts.days && parts.days.nextElementSibling;
      if (dayLabel) dayLabel.textContent = days === 1 ? "dag" : "dagen";
      return true;
    }
    if (update()) {
      var timer = window.setInterval(function () { if (!update()) window.clearInterval(timer); }, 1000);
    }
  });

  /* ---------- Tijdzone-opmerking als de gast in een andere tijdzone zit ---------- */
  try {
    var guestZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelectorAll("[data-tz-note]").forEach(function (el) {
      if (guestZone && guestZone !== el.getAttribute("data-tz-note")) el.hidden = false;
    });
  } catch (e) { /* oudere browser */ }

  /* ---------- Link kopiëren en delen ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.hidden = false;
    var status = btn.closest(".inv-share") && btn.closest(".inv-share").querySelector("[data-copy-status]");
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done(ok) {
        if (status) status.textContent = ok ? "Link gekopieerd." : "Kopiëren lukte niet. Selecteer de link handmatig: " + text;
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
  if (navigator.share) {
    document.querySelectorAll("[data-native-share]").forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        navigator.share({ title: btn.getAttribute("data-share-title"), url: btn.getAttribute("data-share-url") }).catch(function () {});
      });
    });
  }

  /* ---------- Aanmelden ---------- */
  document.querySelectorAll("[data-rsvp-form]").forEach(function (form) {
    var status = form.querySelector("[data-rsvp-status]");
    var submit = form.querySelector("[data-rsvp-submit]");
    var submitLabel = submit ? submit.textContent : "";
    var busy = false;
    var demo = form.hasAttribute("data-rsvp-demo");

    function syncAttending() {
      var checked = form.querySelector("input[name='attending']:checked");
      var attending = !checked || checked.value === "ja";
      form.querySelectorAll("[data-when-attending]").forEach(function (block) {
        block.hidden = !attending;
        block.querySelectorAll("input, select, textarea").forEach(function (input) { input.disabled = !attending; });
      });
    }
    form.querySelectorAll("input[name='attending']").forEach(function (r) { r.addEventListener("change", syncAttending); });
    syncAttending();

    function setStatus(message, isError) {
      if (!status) return;
      status.textContent = message || "";
      status.classList.toggle("is-error", !!isError);
    }
    function clearErrors() {
      form.querySelectorAll(".field__error[data-js]").forEach(function (n) { n.remove(); });
      form.querySelectorAll("[aria-invalid]").forEach(function (n) { n.removeAttribute("aria-invalid"); });
    }
    function showErrors(errors) {
      var first = null;
      Object.keys(errors).forEach(function (name) {
        var input = form.querySelector("[name='" + name + "']");
        var message = document.createElement("p");
        message.className = "field__error";
        message.setAttribute("data-js", "");
        message.textContent = errors[name];
        if (input) {
          input.setAttribute("aria-invalid", "true");
          var field = input.closest(".field") || input.parentNode;
          field.appendChild(message);
          if (!first) first = input;
        } else if (status) {
          setStatus(errors[name], true);
        }
      });
      if (first) first.focus();
    }
    function localCheck() {
      var errors = {};
      var name = form.querySelector("[name='name']");
      if (name && !name.value.trim()) errors.name = "Vul je naam in.";
      if (!form.querySelector("input[name='attending']:checked")) errors.attending = "Kies of je erbij bent.";
      form.querySelectorAll("[required]").forEach(function (input) {
        if (input.disabled || input.name === "name" || input.name === "attending") return;
        if (input.type === "radio") {
          if (!form.querySelector("input[name='" + input.name + "']:checked")) errors[input.name] = "Beantwoord deze vraag.";
        } else if (!String(input.value || "").trim()) {
          errors[input.name] = "Beantwoord deze vraag.";
        }
      });
      return errors;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (busy) return;
      clearErrors();
      setStatus("");
      var errors = localCheck();
      if (Object.keys(errors).length) { showErrors(errors); setStatus("Controleer de gemarkeerde velden.", true); return; }
      var attending = !!form.querySelector("input[name='attending'][value='ja']:checked");
      if (demo) {
        setStatus("Dit is een voorbeeld: je antwoord is niet opgeslagen. In een echte uitnodiging komt het direct bij de organisator binnen.");
        /* Het feestje komt uit de verstuurknop: die is op dit moment in beeld. */
        document.dispatchEvent(new CustomEvent("invite:rsvp", { detail: { attending: attending, demo: true, target: form.querySelector("[data-rsvp-submit]") || form } }));
        return;
      }
      busy = true;
      submit.disabled = true;
      submit.textContent = "Bezig met versturen…";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json", "X-Requested-With": "fetch" },
        credentials: "same-origin"
      }).then(function (response) {
        return response.json().catch(function () { return { ok: false, message: "Er ging iets mis. Probeer het opnieuw." }; })
          .then(function (data) { data.status = response.status; return data; });
      }).then(function (data) {
        if (data.ok) {
          var box = document.createElement("div");
          box.className = "rsvp__thanks";
          box.setAttribute("tabindex", "-1");
          var title = document.createElement("h3");
          title.textContent = data.title || "Bedankt!";
          var text = document.createElement("p");
          text.textContent = data.message || "Je antwoord is opgeslagen.";
          box.appendChild(title);
          box.appendChild(text);
          if (data.edit_url) {
            var p = document.createElement("p");
            var a = document.createElement("a");
            a.className = "inv-link";
            a.href = data.edit_url;
            a.textContent = "Wijzig je antwoord";
            p.appendChild(a);
            box.appendChild(p);
          }
          form.replaceWith(box);
          box.focus();
          document.dispatchEvent(new CustomEvent("invite:rsvp", { detail: { attending: attending, demo: false, target: box } }));
          return;
        }
        busy = false;
        submit.disabled = false;
        submit.textContent = submitLabel;
        if (data.errors) showErrors(data.errors);
        setStatus(data.message || "Je antwoord is niet opgeslagen. Probeer het opnieuw.", true);
      }).catch(function () {
        busy = false;
        submit.disabled = false;
        submit.textContent = submitLabel;
        setStatus("Geen verbinding. Je antwoord is nog niet opgeslagen; probeer het opnieuw.", true);
      });
    });
  });
})();
