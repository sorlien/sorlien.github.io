/**
 * nav-indicator.js
 *
 * Sliding underline + scroll-spy for the one-page site.
 *
 * - Nav links are in-page anchors (#hero / #projects / #about). Clicking one
 *   smooth-scrolls to that section (done in JS because the global
 *   scroll-behavior is `auto` so it doesn't fight the wheel-jacking sections).
 * - A scroll-spy IntersectionObserver marks the section crossing the viewport
 *   midline as active and slides the underline to its link.
 */

let _indicator    = null;
let _indicatorNav = null;

function _getProps(link) {
  const navRect  = _indicatorNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  return {
    left:  linkRect.left   - navRect.left,
    width: linkRect.width,
    top:   linkRect.bottom - navRect.top,
  };
}

function _place(link, animate) {
  if (!_indicator || !_indicatorNav || !link) return;
  const { left, width, top } = _getProps(link);
  if (!animate) _indicator.classList.add('nav__indicator--instant');
  _indicator.style.left  = left  + 'px';
  _indicator.style.width = width + 'px';
  _indicator.style.top   = top   + 'px';
  if (!animate) {
    void _indicator.offsetWidth;
    _indicator.classList.remove('nav__indicator--instant');
  }
}

function _setActive(link) {
  if (!link) return;
  document.querySelectorAll('.nav__link').forEach((l) => l.classList.remove('nav__link--active'));
  link.classList.add('nav__link--active');
  _place(link, true);
}

function initNavIndicator() {
  _indicatorNav = document.querySelector('.nav');
  if (!_indicatorNav) return;

  const links = Array.from(document.querySelectorAll('.nav__link'));
  if (!links.length) return;

  // Reuse or create the indicator.
  _indicator = _indicatorNav.querySelector('.nav__indicator');
  if (!_indicator) {
    _indicator = document.createElement('span');
    _indicator.className = 'nav__indicator';
    _indicatorNav.appendChild(_indicator);
  }

  // Case-study subpages use cross-page links (../index.html#…), not in-page
  // hashes. There, just sit the indicator under the pre-set active link — no
  // smooth-scroll, no scroll-spy.
  const hashLinks = links.filter((l) => (l.getAttribute('href') || '').charAt(0) === '#');
  if (!hashLinks.length) {
    _place(document.querySelector('.nav__link--active') || links[0], false);
    return;
  }

  // Map nav links to the sections they point at (by href hash).
  const linkByHash = {};
  links.forEach((l) => {
    const href = l.getAttribute('href') || '';
    if (href.charAt(0) === '#') linkByHash[href.slice(1)] = l;
  });

  function navTo(top) {
    // Release any scroll-locked section so the programmatic scroll isn't clamped.
    if (window.ScrollOrchestrator && window.ScrollOrchestrator.suppress) window.ScrollOrchestrator.suppress(1300);
    // Custom eased tween (native smooth-scroll is unreliable here, and a known
    // duration lets the suppression window cover the whole motion).
    var start = window.scrollY, dist = top - start, t0 = performance.now(), dur = 750;
    if (Math.abs(dist) < 2) return;
    (function step() {
      var p = Math.min(1, (performance.now() - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);   // easeOutCubic
      window.scrollTo(0, Math.round(start + dist * e));
      if (p < 1) requestAnimationFrame(step);
    })();
  }

  // Smooth-scroll on click (global scroll-behavior is `auto`).
  links.forEach((l) => {
    const href = l.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    l.addEventListener('click', (e) => {
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      navTo(target.getBoundingClientRect().top + window.scrollY);
    });
  });

  // Logo → back to the top (home). On case-study pages it keeps its
  // ../index.html href (this whole block is skipped there — see early return).
  const logo = document.querySelector('.nav__logo');
  if (logo && (logo.getAttribute('href') || '').charAt(0) === '#') {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = document.getElementById('siteNav');
      if (nav) nav.classList.remove('nav--open');     // close the menu if open
      document.body.style.overflow = '';
      navTo(0);
    });
  }

  // Place under the first link initially.
  _setActive(links[0]);

  // ── Scroll-spy: the section crossing the viewport midline is active ──
  // The Outro has no nav link, so it maps to the About link (keeps it lit).
  const spyTargets = [];
  function add(id, link) {
    const el = document.getElementById(id);
    if (el && link) spyTargets.push({ el, link });
  }
  add('hero', linkByHash.hero);
  add('projects', linkByHash.projects);
  add('about',    linkByHash.about);
  add('outro',    linkByHash.about);

  if (spyTargets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = spyTargets.find((t) => t.el === entry.target);
        if (match) _setActive(match.link);
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach((t) => spy.observe(t.el));
  }
}

// Wait for fonts before measuring link positions.
document.addEventListener('DOMContentLoaded', () => {
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initNavIndicator);
  else initNavIndicator();
});

// Floating pill: add .nav--scrolled once scrolled down.
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function update() { nav.classList.toggle('nav--scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// Re-position the indicator on resize.
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    const activeLink = document.querySelector('.nav__link--active');
    if (activeLink) _place(activeLink, false);
  }, 100);
});
