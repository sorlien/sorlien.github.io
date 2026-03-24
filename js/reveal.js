/**
 * reveal.js
 *
 * Scroll-reveal system for case study pages.
 * Each .cs-subsection (numbered phase or named section) reveals as one unit.
 * .cs-section wrappers are never hidden — they're background containers only.
 * Full-width image breaks appear instantly.
 *
 * Skips .cs-hero which has its own entrance animation.
 *
 * Include this file on any case study page — no per-page setup needed.
 */

(function () {

  function init() {
    var main = document.querySelector('main');
    if (!main) return;

    // Each subsection (01 Research, 02 Strategy, Final thoughts content, etc.)
    main.querySelectorAll('.cs-subsection').forEach(function (el) {
      el.classList.add('reveal');
    });

    // "View other projects" has no cs-subsection — reveal the whole block
    var other = main.querySelector('.cs-other');
    if (other) other.classList.add('reveal');

    // Lower threshold on mobile so elements animate in sooner on shorter screens
    var isMobile = window.innerWidth < 768;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: isMobile ? 0.08 : 0.05,
      rootMargin: '0px 0px -40px 0px',
    });

    main.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
