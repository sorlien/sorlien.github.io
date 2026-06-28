/**
 * hero-fold.js
 *
 * Scroll-scrubbed "origami fold" hero. Ported from the origami-test prototype
 * (transparent PNG sequence drawn to a <canvas>), with two changes for the
 * portfolio:
 *   1. NO checkerboard — frames composite directly over the page background.
 *   2. The canvas is fit into a stage box (right column on desktop, below the
 *      text on mobile) instead of filling the whole viewport.
 *
 * This is a NATIVE-SCROLL section: frame index is derived from the track's
 * own getBoundingClientRect, so it works at any vertical offset and never
 * captures the wheel. It does not register with the ScrollOrchestrator.
 */
(function () {
  'use strict';

  var N = 74;                              // frame_0000 .. frame_0073
  var FRAME_W = 720, FRAME_H = 1280;
  var ASPECT = FRAME_W / FRAME_H;

  var track  = document.getElementById('hero');
  var canvas = document.getElementById('foldStage');
  if (!track || !canvas) return;

  var stage   = canvas.parentNode;          // .hero-fold__stage
  var ctx     = canvas.getContext('2d');
  var loader  = document.getElementById('foldLoader');
  var pctEl   = document.getElementById('foldPct');
  var barEl   = document.getElementById('foldBar');

  // On return visits within the session the frames are already cached and load
  // instantly, so the loader would just flash by — hide it up front.
  var cached = false;
  try { cached = !!sessionStorage.getItem('foldLoaded'); } catch (e) {}
  if (cached && loader) loader.style.display = 'none';

  // ── Sizing (devicePixelRatio aware), fit-contain into the stage box ──
  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var box = stage.getBoundingClientRect();
    var dispW = box.width;
    var dispH = box.height;
    if (dispW <= 0 || dispH <= 0) return;

    if (dispW / dispH > ASPECT) dispW = dispH * ASPECT;  // box wider than frame → limit width
    else                        dispH = dispW / ASPECT;  // box taller than frame → limit height

    // Enlarge past the contain-fit so the figure reads bigger; the sticky's
    // overflow:hidden crops the (transparent) top/bottom margins. Mobile stacks
    // the fold above the text with room to spare, so push it larger there.
    var SCALE = window.innerWidth < 768 ? 2.0 : 1.3;
    dispW *= SCALE;
    dispH *= SCALE;

    canvas.style.width  = dispW + 'px';
    canvas.style.height = dispH + 'px';
    canvas.width  = Math.round(dispW * dpr);
    canvas.height = Math.round(dispH * dpr);

    current = -1;          // force a redraw at the new size
    requestTick();
  }

  // ── Draw (transparent PNG over page background — no checkerboard) ──
  function draw(idx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var img = images[idx];
    if (img && img.complete) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  // ── Scroll → frame index (section-relative) ──
  function computeIndex() {
    var rect = track.getBoundingClientRect();
    var scrollable = track.offsetHeight - window.innerHeight;
    var p = scrollable > 0 ? (-rect.top) / scrollable : 0;
    p = Math.min(1, Math.max(0, p));
    return Math.round(p * (N - 1));
  }

  var hint = document.getElementById('foldHint');

  var current = -1, target = 0, ticking = false;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  function tick() {
    ticking = false;
    if (target !== current) { current = target; draw(current); }
  }
  function onScroll() {
    target = computeIndex();
    requestTick();
    if (hint) hint.style.opacity = Math.max(0, 1 - window.scrollY / 120).toFixed(3);  // fade out as you scroll
  }

  // ── Preload all frames, then start ──
  var images = new Array(N);
  var loaded = 0;
  function srcFor(i) { return 'assets/frames/frame_' + String(i).padStart(4, '0') + '.webp'; }

  function onOne() {
    loaded++;
    var pct = Math.round((loaded / N) * 100);
    if (pctEl) pctEl.textContent = pct;
    if (barEl) barEl.style.width = pct + '%';
    if (loaded === N) start();
  }

  function start() {
    try { sessionStorage.setItem('foldLoaded', '1'); } catch (e) {}
    resize();
    target = computeIndex();
    current = -1;
    requestTick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    // Frames are ready — let the intro (intro.js) dismiss the loader when its
    // draw is also done. (Falls back to removing the loader if intro isn't present.)
    window.__foldFramesReady = true;
    if (typeof window.__onFoldFrames === 'function') window.__onFoldFrames();
    else if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  for (var i = 0; i < N; i++) {
    var img = new Image();
    img.onload = onOne;
    img.onerror = onOne;   // never deadlock the loader on a bad frame
    img.src = srcFor(i);
    images[i] = img;
  }
})();
