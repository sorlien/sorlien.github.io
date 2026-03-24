/**
 * nav-indicator.js
 *
 * Sliding underline that moves between nav items across page navigations.
 *
 * - First visit: indicator appears instantly under the active link
 * - On click: saves the current link's href to sessionStorage
 * - On next page: indicator starts at the saved position and slides to the active link
 *
 * For SPA navigation (router.js), call window.slideNavTo(link) directly
 * instead of relying on the sessionStorage mechanism.
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
  if (!_indicator || !_indicatorNav) return;
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

// Slide the indicator to a link — called by router.js on SPA navigation
window.slideNavTo = function (link) {
  _place(link, true);
};

function initNavIndicator() {
  _indicatorNav = document.querySelector('.nav');
  if (!_indicatorNav) return;

  const links      = Array.from(document.querySelectorAll('.nav__link'));
  const activeLink = document.querySelector('.nav__link--active');
  if (!activeLink) return;

  // Reuse existing indicator or create a new one
  _indicator = _indicatorNav.querySelector('.nav__indicator');
  if (!_indicator) {
    _indicator = document.createElement('span');
    _indicator.className = 'nav__indicator';
    _indicatorNav.appendChild(_indicator);
  }

  // Cross-page animation (full page navigations only)
  const fromHref = sessionStorage.getItem('nav-from');
  sessionStorage.removeItem('nav-from');

  if (fromHref) {
    const fromLink = links.find(l => l.getAttribute('href') === fromHref);
    if (fromLink && fromLink !== activeLink) {
      const activeProps = _getProps(activeLink);

      _place(fromLink, false);

      requestAnimationFrame(() => {
        _indicator.classList.add('nav__indicator--instant');
        _indicator.style.width = activeProps.width + 'px';
        _indicator.style.top   = activeProps.top   + 'px';
        void _indicator.offsetWidth;
        _indicator.classList.remove('nav__indicator--instant');
        _indicator.style.left = activeProps.left + 'px';
      });
    } else {
      _place(activeLink, false);
    }
  } else {
    _place(activeLink, false);
  }

  // Save active href before navigating away (used by full page nav fallback)
  links.forEach(link => {
    link.addEventListener('click', () => {
      const current = document.querySelector('.nav__link--active');
      if (current) sessionStorage.setItem('nav-from', current.getAttribute('href'));
    });
  });
}

// Wait for fonts to load before measuring link positions.
document.addEventListener('DOMContentLoaded', () => {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initNavIndicator);
  } else {
    initNavIndicator();
  }
});

// Re-position indicator on resize (link positions shift with viewport width).
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    const activeLink = document.querySelector('.nav__link--active');
    if (activeLink) _place(activeLink, false);
  }, 100);
});
