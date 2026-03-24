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

    toggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';

      if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_KEY, 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem(STORAGE_KEY, 'dark');
      }
    });
  });

})();
