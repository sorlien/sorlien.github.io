/**
 * nav-mobile.js
 *
 * Hamburger menu logic for mobile nav.
 * Toggles .nav--open on #siteNav.
 * Closes on link click or outside click.
 */
(function () {
  var nav = document.getElementById('siteNav');
  if (!nav) return;
  var btn = nav.querySelector('.nav__hamburger');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('nav--open');
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('nav--open') && !nav.contains(e.target)) {
      nav.classList.remove('nav--open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}());
