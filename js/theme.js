/**
 * theme.js
 *
 * Handles the theme menu — a palette button in the nav that opens a
 * dropdown of themes (light, dark, vintage, cyber-retro, brutalist, retro-os).
 * Replaces the old dark-mode.js light/dark toggle.
 *
 * Saves the user's choice to localStorage (key 'theme') so it persists
 * across pages. Theme switches reuse the expanding-circle View Transition.
 *
 * TO REMOVE THEMES COMPLETELY:
 *   See instructions at the top of css/themes.css
 */

(function () {

  const KEY    = 'theme';
  const THEMES = ['light', 'dark', 'vintage', 'cyber-retro', 'neo-brutalism'];
  const root   = document.documentElement;

  // Apply saved preference immediately (belt & braces alongside the inline
  // head script) to avoid a flash of the wrong theme
  const saved = localStorage.getItem(KEY);
  if (saved && saved !== 'light' && THEMES.indexOf(saved) > -1) {
    root.setAttribute('data-theme', saved);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.theme-menu');
    if (!menu) return;

    const btn   = menu.querySelector('.theme-menu__btn');
    const list  = menu.querySelector('.theme-menu__list');
    const items = Array.prototype.slice.call(menu.querySelectorAll('.theme-menu__item'));

    const current = () => root.getAttribute('data-theme') || 'light';

    function syncChecked() {
      const cur = current();
      items.forEach(i => i.setAttribute('aria-checked', String(i.dataset.themeValue === cur)));
    }

    function apply(id) {
      if (id === 'light') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', id);
      localStorage.setItem(KEY, id);
      syncChecked();
      // Themes change fonts → anything that measured text (watermark fit,
      // carousel rolls) must recalibrate. Everything relevant listens on resize.
      window.dispatchEvent(new Event('resize'));
    }

    // Theme fonts load lazily (font-display: swap) — re-fit once they arrive
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', () => {
        window.dispatchEvent(new Event('resize'));
      });
    }

    /* ── Open / close ─────────────────────────────── */
    let open = false;

    function openMenu(focusItems) {
      if (open) return;
      open = true;
      list.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      // Only move focus on keyboard opens — on tap/click, focusing the active
      // item makes iOS Safari draw a :focus-visible ring on it
      if (focusItems) {
        const active = items.filter(i => i.getAttribute('aria-checked') === 'true')[0] || items[0];
        active.focus();
      }
    }

    function closeMenu(refocus) {
      if (!open) return;
      open = false;
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus();
    }

    /* ── Select a theme ───────────────────────────── */
    function select(id) {
      // Close first so the menu isn't part of the transition snapshot
      closeMenu(true);
      if (id === current()) return;

      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // No View Transitions support (or reduced motion) → plain swap.
      if (!document.startViewTransition || reduce) { apply(id); return; }

      // Expanding-circle reveal of the new theme, centred on the palette button.
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

      const vt = document.startViewTransition(() => apply(id));
      vt.ready.then(() => {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)',
                       'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)' }
        );
      });
    }

    /* ── Events ───────────────────────────────────── */
    // e.detail is 0 when the click came from Enter/Space, >0 from a pointer
    btn.addEventListener('click', (e) => { open ? closeMenu(false) : openMenu(e.detail === 0); });

    items.forEach(item => {
      item.addEventListener('click', () => select(item.dataset.themeValue));
    });

    // Keyboard: roving focus with wrap, Home/End, Escape
    list.addEventListener('keydown', (e) => {
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'Escape')         { e.preventDefault(); closeMenu(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Home')      { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End')       { e.preventDefault(); items[items.length - 1].focus(); }
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });

    // Outside click / tap closes (also covers opening the hamburger)
    document.addEventListener('click', (e) => {
      if (open && !menu.contains(e.target)) closeMenu(false);
    });

    // Tabbing out closes. relatedTarget is null when a focused item merely
    // blurs (iOS taps don't focus buttons) — closing then would flip the list
    // to pointer-events:none before the tap's click lands, eating the
    // selection. Outside taps are handled by the document click listener.
    list.addEventListener('focusout', (e) => {
      if (open && e.relatedTarget && !menu.contains(e.relatedTarget)) closeMenu(false);
    });

    syncChecked();
  });

})();
