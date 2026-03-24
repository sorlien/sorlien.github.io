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

  const WATERMARK_DELAY    = 600;
  const WATERMARK_DURATION = 1000;
  const CONTENT_START      = WATERMARK_DELAY + WATERMARK_DURATION + 100;

  if (sessionStorage.getItem('anim-about-done')) {
    const main = document.querySelector('main');
    if (main) main.classList.add('skip-transitions');
    watermark.classList.add('is-visible');
    photo.classList.add('is-visible');
    content.classList.add('is-visible');
    requestAnimationFrame(() => {
      if (main) main.classList.remove('skip-transitions');
      document.documentElement.classList.remove('js-skip-intro');
    });
    return;
  }

  sessionStorage.setItem('anim-about-done', '1');

  // On mobile, CSS handles layout and visibility via !important rules —
  // skip all JS inline styles and animate nothing (avoids transform conflicts).
  if (window.innerWidth < 768) {
    setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);
    return;
  }

  setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);
  setTimeout(() => {
    photo.classList.add('is-visible');
    content.classList.add('is-visible');
  }, CONTENT_START);
};

document.addEventListener('DOMContentLoaded', window.initAbout);
