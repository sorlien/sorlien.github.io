/**
 * hero-animation.js
 *
 * Home page entrance animation sequence.
 * Plays once per session — subsequent visits show content immediately.
 *
 * To adjust timing, change the constants below.
 * WATERMARK_DURATION must match the CSS transition on .anim-scale-up.
 *
 * Timing:
 *   t=0ms                                            Nav slides down       — 700ms, ease-back
 *   t=WATERMARK_DELAY                                Watermark grows       — WATERMARK_DURATION, ease-back
 *   t=WATERMARK_DELAY+WATERMARK_DURATION+CONTENT_GAP Name + photo glide in — 1100ms, gentle
 */

const WATERMARK_DELAY    = 600;   // ms — when watermark starts
const WATERMARK_DURATION = 1000;  // ms — must match CSS transition on .anim-scale-up
const CONTENT_GAP        = 100;   // ms — pause after watermark finishes before name+photo

window.initHome = function () {
  const nav       = document.getElementById('siteNav');
  const watermark = document.getElementById('heroWatermark');
  const name      = document.getElementById('heroName');
  const photo     = document.getElementById('heroPhoto');

  if (!watermark) return; // not on home page

  // Nav animation: only on initial page load (nav not yet visible).
  // On SPA navigation back to home the nav is already showing — skip it.
  if (nav && !nav.classList.contains('nav--visible')) {
    if (!sessionStorage.getItem('anim-home-done')) {
      nav.classList.add('nav--animate');
      void nav.offsetHeight; // force reflow so transition fires
      nav.classList.add('nav--visible');
    }
  }

  if (sessionStorage.getItem('anim-home-done')) {
    const main = document.querySelector('main');
    if (main) main.classList.add('skip-transitions');
    watermark.classList.add('is-visible');
    name.classList.add('is-visible');
    photo.classList.add('is-visible');
    requestAnimationFrame(() => {
      if (main) main.classList.remove('skip-transitions');
      document.documentElement.classList.remove('js-skip-intro');
    });
    return;
  }

  // First visit this session — play animation and mark as done
  sessionStorage.setItem('anim-home-done', '1');

  // On mobile the layout is static (flex column) — skip horizontal slide,
  // just fade up so the CSS position:static layout isn't disrupted
  if (window.innerWidth < 768) {
    name.style.transition  = 'opacity 0.9s var(--ease-gentle), transform 1.1s var(--ease-gentle)';
    photo.style.transition = 'opacity 0.9s var(--ease-gentle), transform 1.1s var(--ease-gentle)';
    name.style.transform   = 'translateY(40px)';
    photo.style.transform  = 'translateY(40px)';
  }

  setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);
  setTimeout(() => {
    name.classList.add('is-visible');
    photo.classList.add('is-visible');
  }, WATERMARK_DELAY + WATERMARK_DURATION + CONTENT_GAP);
};

document.addEventListener('DOMContentLoaded', window.initHome);
