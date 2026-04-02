/**
 * hero-animation.js
 *
 * Home page: three-layer parallax hero with scroll-driven reveal.
 *
 * Entry sequence (first visit):
 *   t=0ms      Nav slides down            (700ms, ease-back)
 *   t=600ms    Watermark scales up         (1000ms, ease-back)
 *   t=1700ms   Middle layer: carousel-style launch from below
 *   t=3400ms   Scroll hint fades in + bounces
 *
 * Scroll sequence (fully reversible, 0 → 50vh):
 *   Watermark exits upward (same as About page)
 *   Background layer fades + rises in
 *   Foreground layer fades + rises in (slight stagger)
 *   Scroll hint exits downward
 *   View Projects button fades in (last 25% of scroll range)
 *   Scrolling back up reverses everything
 *
 * Mouse parallax (desktop only):
 *   Mid: always active once started
 *   Bg + Fg: combined with scroll offset so both work simultaneously
 *   Background  ±8px  |  Middle ±15px  |  Foreground ±25px
 */

var EASE_SPRING = 'cubic-bezier(0.34, 1.35, 0.64, 1)'; // matches --ease-spring

window.initHome = function () {
  var nav       = document.getElementById('siteNav');
  var watermark = document.getElementById('heroWatermark');
  var layerName = document.getElementById('heroLayerName');
  var layerBg   = document.getElementById('heroLayerBg');
  var layerMid  = document.getElementById('heroLayerMid');
  var layerFg   = document.getElementById('heroLayerFg');
  var hint      = document.getElementById('heroScrollHint');
  var viewBtn   = document.getElementById('heroViewBtn');

  if (!layerMid) return; // not on home page

  // ── Clean up previous listeners / RAF ───────────────────────────────────
  if (window._heroRaf)       { cancelAnimationFrame(window._heroRaf); window._heroRaf = null; }
  if (window._heroMouseMove) { document.removeEventListener('mousemove', window._heroMouseMove); window._heroMouseMove = null; }
  if (window._heroScroll)    { window.removeEventListener('scroll', window._heroScroll); window._heroScroll = null; }
  // Clean up about-page listeners — _aboutWheel is non-passive and blocks scroll if left behind
  if (window._aboutWheel)        { window.removeEventListener('wheel',  window._aboutWheel);        window._aboutWheel = null; }
  if (window._aboutScroll)       { window.removeEventListener('scroll', window._aboutScroll);        window._aboutScroll = null; }
  if (window._aboutMobileScroll) { window.removeEventListener('scroll', window._aboutMobileScroll);  window._aboutMobileScroll = null; }

  // ── Nav entrance (first visit only) ──────────────────────────────────────
  if (nav && !nav.classList.contains('nav--visible')) {
    if (!sessionStorage.getItem('anim-home-done')) {
      nav.classList.add('nav--animate');
      void nav.offsetHeight;
      nav.classList.add('nav--visible');
    }
  }

  // ── Shared scroll state (read by RAF, written by scroll driver) ───────────
  // nameScrollP / bgScrollP / fgScrollP: 0 = hidden, 1 = fully revealed
  // Scroll driver updates these; RAF combines them with parallax
  var nameScrollP = 0;
  var bgScrollP   = 0;
  var fgScrollP   = 0;

  // ── Parallax state ────────────────────────────────────────────────────────
  var mouseX = window.innerWidth  / 2;
  var mouseY = window.innerHeight / 2;
  var nameX = 0, nameY = 0;
  var bgX   = 0, bgY   = 0;
  var midX  = 0, midY  = 0;
  var fgX   = 0, fgY   = 0;

  var NAME_RANGE = 6;
  var BG_RANGE   = 8;
  var MID_RANGE  = 15;
  var FG_RANGE   = 25;
  var LERP_SPEED = 0.08;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function parallaxFrame() {
    var cx = window.innerWidth  / 2;
    var cy = window.innerHeight / 2;
    var nx = (mouseX - cx) / cx; // –1 → 1
    var ny = (mouseY - cy) / cy;

    // Parallax only active once scrolling has started (bg layer becoming visible)
    var tnx = bgScrollP > 0 ? nx : 0;
    var tny = bgScrollP > 0 ? ny : 0;

    // Mid: pure parallax
    midX = lerp(midX, tnx * MID_RANGE, LERP_SPEED);
    midY = lerp(midY, tny * MID_RANGE, LERP_SPEED);
    if (layerMid) layerMid.style.transform =
      'translate(' + midX.toFixed(2) + 'px,' + midY.toFixed(2) + 'px)';

    // Name, Bg, Fg: parallax offset COMBINED with scroll-driven base offset
    nameX = lerp(nameX, tnx * NAME_RANGE, LERP_SPEED);
    nameY = lerp(nameY, tny * NAME_RANGE, LERP_SPEED);
    bgX   = lerp(bgX,   tnx * BG_RANGE,   LERP_SPEED);
    bgY   = lerp(bgY,   tny * BG_RANGE,   LERP_SPEED);
    fgX   = lerp(fgX,   tnx * FG_RANGE,   LERP_SPEED);
    fgY   = lerp(fgY,   tny * FG_RANGE,   LERP_SPEED);

    var nameBaseY = (1 - nameScrollP) * 20;
    var bgBaseY   = (1 - bgScrollP)   * 30;
    var fgBaseY   = (1 - fgScrollP)   * 50;

    if (layerName) layerName.style.transform =
      'translate(' + nameX.toFixed(2) + 'px,' + (nameY + nameBaseY).toFixed(2) + 'px)';
    if (layerBg) layerBg.style.transform =
      'translate(' + bgX.toFixed(2) + 'px,' + (bgY + bgBaseY).toFixed(2) + 'px)';
    if (layerFg) layerFg.style.transform =
      'translate(' + fgX.toFixed(2) + 'px,' + (fgY + fgBaseY).toFixed(2) + 'px)';

    window._heroRaf = requestAnimationFrame(parallaxFrame);
  }

  function startParallax() {
    if (window.innerWidth < 768) return; // mobile: opacity-only reveal, no parallax
    window._heroMouseMove = function (e) { mouseX = e.clientX; mouseY = e.clientY; };
    document.addEventListener('mousemove', window._heroMouseMove);
    parallaxFrame();
  }

  // ── Scroll driver ─────────────────────────────────────────────────────────
  function setupScroll() {
    window._heroScroll = function () {
      var vh      = window.innerHeight;
      var sy      = window.scrollY;
      var exitEnd = vh * 0.5;
      var exitP   = Math.min(1, Math.max(0, sy / exitEnd));

      // Scroll hint: exits on scroll, restores when back at top
      if (hint && hint._hintActive) {
        var hintP = Math.min(1, sy / 60);
        if (hintP > 0) {
          hint.style.animation = 'none';
          hint.style.opacity   = (1 - hintP).toFixed(3);
          hint.style.transform = 'translateX(-50%) translateY(' + (hintP * 40) + 'px)';
        } else {
          hint.style.animation = 'hero-hint-bounce 1.4s ease-in-out infinite';
          hint.style.opacity   = '1';
          hint.style.transform = 'translateX(-50%) translateY(0)';
        }
      }

      // View projects button: fades in + rises up only when fully scrolled down
      if (viewBtn) {
        var btnShowP = Math.min(1, Math.max(0, (exitP - 0.75) / 0.25));
        viewBtn.style.opacity       = btnShowP.toFixed(3);
        viewBtn.style.transform     = 'translateX(-50%) translateY(' + ((1 - btnShowP) * 40) + 'px)';
        viewBtn.style.pointerEvents = btnShowP > 0.5 ? 'auto' : 'none';
      }

      // Watermark exits upward on scroll, restores when back at top
      if (sy === 0) {
        // Clear inline overrides so CSS (.is-visible) takes back control
        if (watermark) {
          watermark.style.removeProperty('transform');
          watermark.style.removeProperty('opacity');
          watermark.style.removeProperty('transition');
        }
      } else if (watermark) {
        watermark.style.setProperty('transform',  'translateY(' + (-exitP * 90) + 'px) scale(' + (1 - exitP * 0.5) + ')', 'important');
        watermark.style.setProperty('opacity',    Math.max(0, 1 - exitP * 1.8).toFixed(3), 'important');
        watermark.style.setProperty('transition', 'none', 'important');
      }

      // Scroll reveal — name first, then bg, then fg (staggered)
      nameScrollP = exitP;                                                        // 0%–100%
      bgScrollP   = Math.min(1, Math.max(0, (exitP - 0.60) / 0.40));             // 60%–100%
      fgScrollP   = Math.min(1, Math.max(0, (exitP - 0.75) / 0.25));             // 75%–100%

      if (layerName) layerName.style.opacity = nameScrollP.toFixed(3);
      if (layerBg)   layerBg.style.opacity   = bgScrollP.toFixed(3);
      if (layerFg)   layerFg.style.opacity   = fgScrollP.toFixed(3);
    };
    window.addEventListener('scroll', window._heroScroll, { passive: true });
    window._heroScroll(); // run once to set initial state
  }

  // ── Return visit: show everything immediately ────────────────────────────
  if (sessionStorage.getItem('anim-home-done')) {
    // Suppress transitions so nothing animates on tab switch
    document.documentElement.classList.add('js-skip-intro');
    if (watermark) watermark.classList.add('is-visible');
    if (layerMid)  { layerMid.style.opacity = '1'; layerMid.style.filter = ''; }
    // All layers start fully revealed on return visits
    nameScrollP = 1; bgScrollP = 1; fgScrollP = 1;
    if (layerName) layerName.style.opacity = '1';
    if (layerBg)   layerBg.style.opacity   = '1';
    if (layerFg)   layerFg.style.opacity   = '1';
    // Activate scroll hint immediately
    if (hint) {
      hint.style.opacity   = '1';
      hint.style.transform = 'translateX(-50%) translateY(0)';
      hint.style.animation = 'hero-hint-bounce 1.4s ease-in-out infinite';
      hint._hintActive     = true;
    }
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('js-skip-intro');
    });
    setupScroll();
    startParallax();
    return;
  }

  sessionStorage.setItem('anim-home-done', '1');

  // ── First visit: staggered entry ─────────────────────────────────────────
  var WATERMARK_DELAY    = 600;
  var WATERMARK_DURATION = 1000;
  var LAYERS_START       = WATERMARK_DELAY + WATERMARK_DURATION + 100; // 1700ms

  // 1. Watermark scales up
  setTimeout(function () {
    if (watermark) watermark.classList.add('is-visible');
  }, WATERMARK_DELAY);

  // 2. Middle: carousel-style launch — tiny, blurred, far below, springs straight up
  if (layerMid) {
    layerMid.style.transition = 'none';
    layerMid.style.transform  = 'translateY(600px) scale(0.12)';
    layerMid.style.filter     = 'blur(14px)';
    layerMid.style.opacity    = '0';
    void layerMid.offsetHeight;
    setTimeout(function () {
      layerMid.style.transition = 'transform 1.5s ' + EASE_SPRING +
                                  ', filter 1.2s ease' +
                                  ', opacity 1.1s ' + EASE_SPRING;
      layerMid.style.transform  = '';
      layerMid.style.filter     = '';
      layerMid.style.opacity    = '';
    }, LAYERS_START);
  }

  // 3. Scroll hint appears after middle settles
  var HINT_START   = LAYERS_START + 1500 + 200; // 3400ms
  var BOUNCE_START = HINT_START + 600;           // 4000ms

  setTimeout(function () {
    if (!hint) return;
    hint.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    hint.style.opacity    = '1';
    hint.style.transform  = 'translateX(-50%) translateY(0)';
  }, HINT_START);

  setTimeout(function () {
    if (!hint) return;
    hint.style.transition = '';
    hint._hintActive      = true;
    hint.style.animation  = 'hero-hint-bounce 1.4s ease-in-out infinite';
  }, BOUNCE_START);

  // 6. Scroll driver starts immediately so scroll works from the first moment
  setupScroll();

  // Parallax RAF starts after middle layer entrance settles (avoid fighting the spring transition)
  var PARALLAX_START = LAYERS_START + 1500 + 100; // 3300ms
  setTimeout(function () {
    if (layerMid) layerMid.style.transition = 'none';
    startParallax();
  }, PARALLAX_START);
};

document.addEventListener('DOMContentLoaded', window.initHome);
