/**
 * router.js
 *
 * Client-side router — keeps the nav static across page navigations.
 *
 * Intercepts clicks on .nav__link, fetches the target page, and swaps
 * only the <main> content and page-specific <style id="page-style">.
 * The nav stays in place — no flash, no reload.
 *
 * Each page must expose a window.initXxx function that sets up its content.
 * Page-specific <style> tags must have id="page-style".
 */

const PAGE_INITS = {
  'index.html':    'initHome',
  'projects.html': 'initProjects',
  'about.html':    'initAbout',
};

async function navigateTo(href) {
  try {
    const res  = await fetch(href);
    const text = await res.text();
    const doc  = new DOMParser().parseFromString(text, 'text/html');

    // Swap page-specific style
    const newStyle = doc.getElementById('page-style');
    const curStyle = document.getElementById('page-style');
    if (newStyle && curStyle) {
      curStyle.replaceWith(newStyle.cloneNode(true));
    } else if (newStyle) {
      document.head.appendChild(newStyle.cloneNode(true));
    } else if (curStyle) {
      curStyle.remove();
    }

    // Swap main content first so page-script can find the new DOM elements
    document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;

    // Swap page-specific script (re-create element to trigger execution)
    const newScript = doc.getElementById('page-script');
    const curScript = document.getElementById('page-script');
    if (curScript) curScript.remove();
    if (newScript) {
      const s = document.createElement('script');
      s.id = 'page-script';
      s.textContent = newScript.textContent;
      document.body.appendChild(s);
    }

    // Reset scroll to top before the new page initialises
    window.scrollTo(0, 0);

    // Update page title and URL
    document.title = doc.title;
    history.pushState({}, doc.title, href);

    // Update active nav link and slide indicator
    document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('nav__link--active'));
    const newActive = document.querySelector(`.nav__link[href="${href}"]`);
    if (newActive) {
      newActive.classList.add('nav__link--active');
      if (typeof window.slideNavTo === 'function') window.slideNavTo(newActive);
    }

    // Remove js-skip-intro so page animations can run
    document.documentElement.classList.remove('js-skip-intro');

    // Call page-specific init function
    const filename = href.split('/').pop() || 'index.html';
    const initName = PAGE_INITS[filename];
    if (initName && typeof window[initName] === 'function') {
      window[initName]();
    }
  } catch (err) {
    // On any error, fall back to normal navigation
    window.location.href = href;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Intercept .nav__link clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('.nav__link');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    const current = location.pathname.split('/').pop() || 'index.html';
    if (href === current) return; // already on this page

    e.preventDefault();
    navigateTo(href);
  });

  // Handle browser back / forward buttons
  window.addEventListener('popstate', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    navigateTo(page || 'index.html');
  });
});
