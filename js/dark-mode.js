/**
 * dark-mode.js
 *
 * Handles the light/dark mode toggle.
 * Saves the user's preference to localStorage so it persists across pages.
 *
 * TO REMOVE DARK MODE COMPLETELY:
 *   See instructions at the top of css/dark-mode.css
 */

(function () {

  const STORAGE_KEY = 'theme';
  const root        = document.documentElement;

  // Apply saved preference immediately (before page renders)
  // to avoid a flash of the wrong theme
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    function applyTheme() {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem(STORAGE_KEY, 'dark');
      }
    }

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    toggle.addEventListener('click', () => {
      // No View Transitions support (or reduced motion) → plain swap.
      // (The icons still animate via CSS in every browser.)
      if (!document.startViewTransition || reduce) { applyTheme(); return; }

      // Expanding-circle reveal of the new theme, centred on the toggle.
      const r = toggle.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

      const vt = document.startViewTransition(applyTheme);
      vt.ready.then(() => {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)',
                       'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)' }
        );
      });
    });
  });

})();
