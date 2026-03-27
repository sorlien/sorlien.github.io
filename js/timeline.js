/**
 * timeline.js
 *
 * Fully scroll-linked, reversible timeline animation.
 * Every value — line, dots, cards — is derived directly from scroll
 * progress each frame. Scrolling back up plays everything in reverse.
 *
 * Progress 0→1 maps to the timeline travelling from near the viewport
 * bottom up toward the top. No time-based transitions; no lerp.
 */

(function () {

  function initTimeline() {
    var timeline = document.querySelector('.cs-timeline');
    if (!timeline) return;

    var fill  = timeline.querySelector('.cs-timeline__line-fill');
    var items = Array.prototype.slice.call(
                  timeline.querySelectorAll('.cs-timeline__item'));

    // Smooth symmetric easing — identical feel scrolling forward or back
    function smoothstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    // Map a value from one range to a 0→1 local progress, then ease it
    function rangeProgress(value, start, end) {
      return smoothstep((value - start) / (end - start));
    }

    function getProgress() {
      var rect  = timeline.getBoundingClientRect();
      var viewH = window.innerHeight;
      // 0: stub enters near viewport bottom  |  1: timeline near top
      var start = viewH * 0.85;
      var end   = viewH * 0.10;
      return Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    }

    function update() {
      var progress = getProgress();

      // ── Line ──────────────────────────────────────────────────────────
      var lineH    = fill.parentElement.offsetHeight;
      var minScale = lineH > 0 ? 40 / lineH : 0.05;
      fill.style.transform = 'scaleY(' + (minScale + progress * (1 - minScale)) + ')';

      // ── Dots + Cards ──────────────────────────────────────────────────
      // Each item has a 0.25-wide window, staggered by 0.15.
      // Cards start early (0.30) so they overlap the line drawing — feels
      // like one continuous motion rather than two sequential phases.
      items.forEach(function (item, i) {
        var dot       = item.querySelector('.cs-timeline__dot');
        var card      = item.querySelector('.cs-timeline__card');
        var cardStart = 0.30 + i * 0.15;
        var cardEnd   = cardStart + 0.25;
        var p         = rangeProgress(progress, cardStart, cardEnd);

        // Dot: scale 0→1 in sync with card
        dot.style.transform = 'scale(' + p + ')';

        // Card: scale 0→1 and tilt 6deg→0deg simultaneously
        card.style.opacity   = String(p);
        card.style.transform = 'scale(' + p + ') rotate(' + (6 * (1 - p)) + 'deg)';
      });

      ticking = false;
    }

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize',   update,   { passive: true });

    update(); // initial paint / pre-scrolled state
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeline);
  } else {
    initTimeline();
  }

}());
