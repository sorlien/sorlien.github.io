/**
 * outro.js
 *
 * The closing "outro" — the three-layer parallax illustration, relocated to the
 * bottom of the one-pager and revealed in two phases as it scrolls into view:
 *
 *   Phase 1: the profile photo (mid layer) eases in ALONE (fade + settle).
 *   Phase 2: once it's in place, the name / background / foreground layers
 *            reveal on continued scroll, with pointer-parallax (desktop).
 *
 * Reveal is section-relative (from the section's own getBoundingClientRect), so
 * it works correctly at the bottom of the page.
 */
(function () {
  'use strict';

  var section   = document.getElementById('outro');
  if (!section) return;

  var layerName = document.getElementById('outroLayerName');
  var layerBg   = document.getElementById('outroLayerBg');
  var layerMid  = document.getElementById('outroLayerMid');
  var layerFg   = document.getElementById('outroLayerFg');

  function clamp(min, max, v) { return Math.min(max, Math.max(min, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Phase progress (set by scroll, read by the RAF):
  //   midP   — profile photo entrance  (phase 1)
  //   nameP/bgP/fgP — other layers     (phase 2, staggered)
  var nameP = 0, bgP = 0, fgP = 0;
  var parallaxOn = false;   // true only once the profile photo is fully in place

  // Pointer-parallax state
  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  var nameX = 0, nameY = 0, bgX = 0, bgY = 0, midX = 0, midY = 0, fgX = 0, fgY = 0;
  var NAME_RANGE = 6, BG_RANGE = 8, MID_RANGE = 15, FG_RANGE = 25, LERP_SPEED = 0.08;
  var raf = null;

  function frame() {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var nx = (mouseX - cx) / cx, ny = (mouseY - cy) / cy;
    // Parallax only kicks in once the profile photo is in place (phase 2).
    var on = parallaxOn;
    var tnx = on ? nx : 0, tny = on ? ny : 0;

    // Other layers: rise in (base offset from their progress) + parallax.
    // (The profile photo springs in via CSS — see #outroLayerMid.is-in.)
    nameX = lerp(nameX, tnx * NAME_RANGE, LERP_SPEED); nameY = lerp(nameY, tny * NAME_RANGE, LERP_SPEED);
    bgX   = lerp(bgX,   tnx * BG_RANGE,   LERP_SPEED); bgY   = lerp(bgY,   tny * BG_RANGE,   LERP_SPEED);
    fgX   = lerp(fgX,   tnx * FG_RANGE,   LERP_SPEED); fgY   = lerp(fgY,   tny * FG_RANGE,   LERP_SPEED);

    if (layerName) {
      layerName.style.opacity = nameP.toFixed(3);
      layerName.style.transform = 'translate(' + nameX.toFixed(2) + 'px,' + (nameY + (1 - nameP) * 20).toFixed(2) + 'px)';
    }
    if (layerBg) {
      layerBg.style.opacity = bgP.toFixed(3);
      layerBg.style.transform = 'translate(' + bgX.toFixed(2) + 'px,' + (bgY + (1 - bgP) * 30).toFixed(2) + 'px)';
    }
    if (layerFg) {
      layerFg.style.opacity = fgP.toFixed(3);
      layerFg.style.transform = 'translate(' + fgX.toFixed(2) + 'px,' + (fgY + (1 - fgP) * 50).toFixed(2) + 'px)';
    }

    raf = requestAnimationFrame(frame);
  }

  // Pinned-progress: 0 only once the outro is pinned at the top (i.e. the
  // section above has fully scrolled out of view), then 1 across the pin travel.
  // This keeps the layers hidden while About is still on screen.
  function onScroll() {
    var vh = window.innerHeight;
    var rect = section.getBoundingClientRect();

    // Phase 1: profile photo springs in as the outro ENTERS — it doesn't wait
    // for the section above to be fully gone.
    if (layerMid) layerMid.classList.toggle('is-in', rect.top < vh * 0.6);

    // Phase 2: parallax layers start only once the outro is PINNED (section
    // above fully out of view), then stagger in.
    var scrollable = section.offsetHeight - vh;
    var p = scrollable > 0 ? clamp(0, 1, (-rect.top) / scrollable) : 0;   // 0 until pinned
    parallaxOn = p > 0.02;
    nameP = clamp(0, 1, p / 0.5);
    bgP   = clamp(0, 1, (p - 0.12) / 0.5);
    fgP   = clamp(0, 1, (p - 0.24) / 0.5);

    if (layerName) layerName.style.opacity = nameP.toFixed(3);
    if (layerBg)   layerBg.style.opacity   = bgP.toFixed(3);
    if (layerFg)   layerFg.style.opacity   = fgP.toFixed(3);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (window.innerWidth >= 768) {
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    frame();
  }
})();
