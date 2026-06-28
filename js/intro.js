/**
 * intro.js
 *
 * First-visit intro: the AS logo self-draws on a white screen, then "flies" to
 * the nav logo's spot as the curtain lifts to reveal the hero.
 *
 *   1. Outline trace (stroke-dashoffset) → ink fill   [CSS, .intro-draw]
 *   2. Wait until BOTH the draw is done AND the fold frames are preloaded
 *      (hero-fold.js signals via window.__foldFramesReady / __onFoldFrames).
 *   3. Logo tweens to the nav logo position, then the white overlay fades out
 *      (SVG sits over the real nav logo, so the hand-off is seamless).
 *
 * Return visits (frames cached) and reduced-motion skip straight to content.
 */
(function () {
  'use strict';

  var loader = document.getElementById('foldLoader');
  if (!loader) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var firstVisit = !document.documentElement.classList.contains('frames-cached');

  // No intro — just clear the overlay.
  if (!firstVisit || reduce) {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    return;
  }

  var logo = document.getElementById('introLogo');
  var root = document.documentElement;
  root.classList.add('intro-active');                 // hold the hero content back

  // Kick off the draw on the next frame so the initial (hidden) state commits.
  requestAnimationFrame(function () { loader.classList.add('intro-draw'); });

  var DRAW_MS    = 2300;   // ink finishes at 1.7s + 0.6s
  var framesReady = !!window.__foldFramesReady;
  var drawDone    = false;
  var finished    = false;

  window.__onFoldFrames = function () { framesReady = true; maybeFinish(); };
  setTimeout(function () { drawDone = true; maybeFinish(); }, DRAW_MS);

  function maybeFinish() {
    if (finished || !framesReady || !drawDone) return;
    finished = true;
    flyToNav();
  }

  function flyToNav() {
    var navLogo = document.querySelector('.nav__logo');
    var src = logo && logo.getBoundingClientRect();
    var dst = navLogo && navLogo.getBoundingClientRect();
    if (!src || !dst || !src.width || !dst.width) { dismiss(); return; }

    var scale = dst.width / src.width;
    var tx = dst.left - src.left;
    var ty = dst.top  - src.top;

    logo.style.transformOrigin = 'top left';
    logo.style.transition = 'transform 0.8s var(--ease-pop)';
    requestAnimationFrame(function () {
      logo.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(4) + ')';
    });

    var landed = false;
    function land(e) { if ((!e || e.propertyName === 'transform') && !landed) { landed = true; dismiss(); } }
    logo.addEventListener('transitionend', land);
    setTimeout(land, 900);   // fallback if transitionend doesn't fire
  }

  function dismiss() {
    root.classList.remove('intro-active');   // hero content eases up
    loader.classList.add('is-done');         // curtain fades, revealing the page (SVG fades over the nav logo)
    var remove = function () { if (loader.parentNode) loader.parentNode.removeChild(loader); };
    loader.addEventListener('transitionend', function (e) { if (e.propertyName === 'opacity') remove(); });
    setTimeout(remove, 1000);
  }
})();
