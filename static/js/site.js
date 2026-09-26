/* Vierlief website: kleine verbeteringen bovenop werkende HTML (alles werkt ook zonder JavaScript). */
(function () {
  "use strict";

  // Live voorbeeld op de homepage: wissel van ontwerp.
  document.querySelectorAll("[data-demo]").forEach(function (demo) {
    var frame = demo.querySelector("[data-demo-frame]");
    var full = demo.querySelector("[data-demo-full]");
    demo.querySelectorAll("[data-demo-src]").forEach(function (button) {
      button.addEventListener("click", function () {
        demo.querySelectorAll("[data-demo-src]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        button.setAttribute("aria-pressed", "true");
        var src = button.getAttribute("data-demo-src");
        if (frame) frame.src = src;
        if (full) full.href = src.replace(/[?&]embed=1/, "");
      });
    });
  });

  // Keuzelijst die direct het formulier verstuurt.
  document.querySelectorAll("[data-autosubmit]").forEach(function (select) {
    select.addEventListener("change", function () { if (select.form) select.form.submit(); });
  });

  // Tekstveld met link: alles selecteren bij focus.
  document.querySelectorAll("[data-select-all]").forEach(function (input) {
    input.addEventListener("focus", function () { input.select(); });
  });

  // Kopieerknoppen (klantomgeving).
  document.querySelectorAll("[data-copy-text]").forEach(function (button) {
    button.hidden = false;
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy-text");
      var label = button.textContent;
      function done(ok) {
        button.textContent = ok ? "Gekopieerd" : "Kopiëren lukte niet";
        window.setTimeout(function () { button.textContent = label; }, 2200);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var area = document.createElement("textarea");
        area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(area);
        done(ok);
      }
    });
  });

  // Bevestiging voor gevaarlijke acties.
  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!window.confirm(form.getAttribute("data-confirm"))) event.preventDefault();
    });
  });

  // Dubbel versturen van formulieren voorkomen.
  document.querySelectorAll("form[data-once]").forEach(function (form) {
    form.addEventListener("submit", function () {
      window.setTimeout(function () {
        form.querySelectorAll("button[type=submit]").forEach(function (b) { b.disabled = true; b.setAttribute("aria-disabled", "true"); });
      }, 0);
    });
  });
})();
