/* Scroll-driven scenes for the About page.
   Each [data-scene] section gets a --p custom property (0 → 1) as it scrolls
   through; all the animation is CSS calc() on top of that. */
(function () {
  // Settings (these were the design tool's tweakable props)
  var MOTION = 1;            // 0–2, strength of the slide/parallax movement
  var SMOOTH_SCROLL = true;  // ease --p towards its target instead of snapping
  var BLACK_AND_WHITE = true;

  var root = document.getElementById('root');
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) SMOOTH_SCROLL = false;

  root.style.setProperty('--m', String(MOTION));
  root.style.setProperty('--gs', BLACK_AND_WHITE ? '1' : '0');

  // Hero intro
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.style.setProperty('--in', '1'); });
  });

  var scenes = Array.prototype.slice.call(root.querySelectorAll('[data-scene]'));
  var cur = new Map();
  var raf = null;

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  function tick() {
    raf = null;
    var vh = window.innerHeight;
    var moving = false;

    scenes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var t = clamp01(-r.top / Math.max(1, r.height - vh));
      var c = cur.has(el) ? cur.get(el) : t;
      var p = SMOOTH_SCROLL ? c + (t - c) * 0.14 : t;
      if (Math.abs(t - p) < 0.0005) p = t; else moving = true;
      cur.set(el, p);
      el.style.setProperty('--p', p.toFixed(4));

      var n = el.querySelector('[data-count]');
      if (n) {
        var k = clamp01((p - 0.1) / 0.4);
        n.textContent = Math.round(+n.dataset.count * (1 - Math.pow(1 - k, 3))).toLocaleString('en-GB');
      }
      var y = el.querySelector('[data-year]');
      if (y) {
        var ky = clamp01((p - 0.05) / 0.75);
        y.textContent = ky >= 1 ? 'Today' : String(1998 + Math.round(28 * ky));
      }
    });

    var se = document.scrollingElement || document.documentElement;
    root.style.setProperty('--gp', (se.scrollTop / Math.max(1, se.scrollHeight - se.clientHeight)).toFixed(4));

    if (moving) raf = requestAnimationFrame(tick);
  }

  function onScroll() { if (!raf) raf = requestAnimationFrame(tick); }

  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  window.addEventListener('resize', onScroll);
  tick();
})();
