/**
 * about-animation.js
 *
 * About page entrance animation sequence.
 * Plays once per session — subsequent visits show content immediately.
 */

window.initAbout = function () {
  const watermark = document.getElementById('aboutWatermark');
  if (!watermark) return; // not on about page

  const photo   = document.getElementById('aboutPhoto');
  const content = document.getElementById('aboutContent');
  const hint    = document.getElementById('scrollHint');

  const WATERMARK_DELAY    = 600;
  const WATERMARK_DURATION = 1000;
  const CONTENT_START      = WATERMARK_DELAY + WATERMARK_DURATION + 100;
  const HINT_START         = CONTENT_START + 400;
  const BOUNCE_START       = HINT_START + 600;

  function activateHint() {
    if (!hint) return;
    hint._hintActive = true;
    hint.style.animation = 'scroll-hint-bounce 1.4s ease-in-out infinite';
    hint.style.opacity   = '1';
    hint.style.transform = 'translateX(-50%) translateY(0)';
  }

  if (sessionStorage.getItem('anim-about-done')) {
    const main = document.querySelector('main');
    if (main) main.classList.add('skip-transitions');
    watermark.classList.add('is-visible');
    if (photo)   photo.classList.add('is-visible');
    if (content) content.classList.add('is-visible');
    activateHint();
    requestAnimationFrame(() => {
      if (main) main.classList.remove('skip-transitions');
      document.documentElement.classList.remove('js-skip-intro');
    });
    return;
  }

  sessionStorage.setItem('anim-about-done', '1');

  // On mobile, CSS handles layout — skip inline transforms but still animate the hint.
  if (window.innerWidth < 768) {
    setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);
    setTimeout(() => {
      if (!hint) return;
      hint.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      hint.style.opacity    = '1';
      hint.style.transform  = 'translateX(-50%) translateY(0)';
    }, HINT_START);
    setTimeout(() => {
      if (!hint) return;
      hint.style.transition = '';
      hint._hintActive      = true;
      hint.style.animation  = 'scroll-hint-bounce 1.4s ease-in-out infinite';
    }, BOUNCE_START);
    return;
  }

  setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);
  setTimeout(() => {
    if (photo)   photo.classList.add('is-visible');
    if (content) content.classList.add('is-visible');
  }, CONTENT_START);

  // Hint: fade + rise entrance, then bounce
  setTimeout(() => {
    if (!hint) return;
    hint.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    hint.style.opacity    = '1';
    hint.style.transform  = 'translateX(-50%) translateY(0)';
  }, HINT_START);
  setTimeout(() => {
    if (!hint) return;
    hint.style.transition = '';
    hint._hintActive      = true;
    hint.style.animation  = 'scroll-hint-bounce 1.4s ease-in-out infinite';
  }, BOUNCE_START);
};

document.addEventListener('DOMContentLoaded', window.initAbout);
