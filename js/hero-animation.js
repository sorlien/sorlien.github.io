/**
 * hero-animation.js
 *
 * Home page entrance animation sequence.
 * Plays once per session — subsequent visits show content immediately.
 *
 * Timing:
 *   t=0ms               Nav slides down    — 700ms, ease-back
 *   t=WATERMARK_DELAY   Watermark grows    — WATERMARK_DURATION, ease-back
 */

const WATERMARK_DELAY    = 600;   // ms — when watermark starts
const WATERMARK_DURATION = 1000;  // ms — must match CSS transition on .anim-scale-up

window.initHome = function () {
  const nav       = document.getElementById('siteNav');
  const watermark = document.getElementById('heroWatermark');
  const embed     = document.querySelector('.hero__embed');
  const pill      = document.querySelector('.hero__pill');

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
    requestAnimationFrame(() => {
      if (main) main.classList.remove('skip-transitions');
      document.documentElement.classList.remove('js-skip-intro');
    });

    // Pill appears instantly on return visits
    if (pill) pill.classList.add('is-visible');

    if (embed) {
      let shown = false;
      const showEmbed = () => {
        if (shown) return;
        shown = true;
        embed.classList.add('is-visible');
      };

      // Re-initialize Unicorn Studio now that main.innerHTML has been replaced
      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        window.UnicornStudio.init();
      }

      // Watch for UnicornStudio to inject its canvas — show as soon as it's ready
      const observer = new MutationObserver(() => {
        if (embed.querySelector('canvas, iframe')) {
          observer.disconnect();
          showEmbed();
        }
      });
      observer.observe(embed, { childList: true, subtree: true });

      // Fallback: show after 800ms so it never stays hidden too long
      setTimeout(() => { observer.disconnect(); showEmbed(); }, 800);
    }
    return;
  }

  sessionStorage.setItem('anim-home-done', '1');

  setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);

  if (embed) {
    let timerDone  = false;
    let canvasDone = false;

    const showEmbed = () => {
      if (!timerDone || !canvasDone) return;
      embed.classList.add('is-visible');
      if (pill) pill.classList.add('is-visible');
    };

    // Timer gate: wait until after watermark animation completes
    setTimeout(() => { timerDone = true; showEmbed(); }, WATERMARK_DELAY + WATERMARK_DURATION + 200);

    // Canvas gate: wait until Unicorn Studio has injected its canvas
    const observer = new MutationObserver(() => {
      if (embed.querySelector('canvas, iframe')) {
        observer.disconnect();
        canvasDone = true;
        showEmbed();
      }
    });
    observer.observe(embed, { childList: true, subtree: true });

    // Fallback: if canvas never appears, show after 6s regardless
    setTimeout(() => { observer.disconnect(); canvasDone = true; showEmbed(); }, 6000);
  }

};

document.addEventListener('DOMContentLoaded', window.initHome);

// Block clicks on the Unicorn Studio badge regardless of how their handler is attached.
// Runs in capture phase so it fires before any listener they registered.
document.addEventListener('click', function (e) {
  var badge = document.querySelector('a[href*="unicorn.studio"], a[href*="unicornstudio"]');
  if (!badge) return;
  var rect = badge.getBoundingClientRect();
  if (e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);
