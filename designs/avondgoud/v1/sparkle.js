/* Avondgoud v1: fonkelend goud bij het openen. Draait alleen tijdens de opening
   en niet bij 'minder beweging'. Puur decoratief (aria-hidden canvas). */
(function () {
  "use strict";
  document.addEventListener("invite:opening", function (event) {
    if (event.detail && event.detail.reduceMotion) return;
    var canvas = document.querySelector("[data-sparkle]");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    ctx.scale(ratio, ratio);
    var style = getComputedStyle(document.body);
    var golds = [style.getPropertyValue("--ag-gold").trim() || "#D7B878", style.getPropertyValue("--ag-gold-2").trim() || "#F1DFB0"];
    var particles = [];
    for (var i = 0; i < 70; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.2 + Math.random() * 3.4;
      particles.push({
        x: w / 2, y: h / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6,
        r: 0.9 + Math.random() * 2.4, life: 0, max: 60 + Math.random() * 60, tone: Math.random() < 0.6 ? 0 : 1
      });
    }
    var start = performance.now();
    function frame(now) {
      ctx.clearRect(0, 0, w, h);
      var alive = 0;
      particles.forEach(function (p) {
        if (p.life > p.max) return;
        alive++;
        p.life++;
        p.x += p.vx; p.y += p.vy; p.vy += 0.025; p.vx *= 0.992;
        var alpha = 1 - p.life / p.max;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = golds[p.tone];
        ctx.shadowColor = golds[0];
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (alive && now - start < 2600) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  });
})();
