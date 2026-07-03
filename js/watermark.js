/**
 * watermark.js
 *
 * Drives the single persistent background watermark (#siteWatermark): as each
 * section crosses the viewport midline, the word rolls over vertically —
 * odometer style (old word up & out, new word rises in), matching the projects
 * carousel title roll. Uses the same midline IntersectionObserver as the nav.
 */
(function () {
  'use strict';

  var track = document.getElementById('siteWatermarkTrack');
  if (!track) return;
  var roll = track.parentNode;            // .site-watermark__roll (the clip window)

  // Keep a side margin on desktop: the big word can be wider than the viewport
  // (worse with a browser sidebar open), so scale the roll down to fit when it
  // would otherwise reach the edges. Centred origin → symmetric margins.
  var SIDE = 0.05;                        // min 5% clear on each side
  function fit() {
    if (window.innerWidth < 768) { roll.style.transform = ''; return; }   // mobile: leave as-is
    roll.style.transform = 'scale(1)';                                    // measure natural width
    // Scale by the WIDEST word so every word uses the SAME scale — otherwise a
    // longer word (PORTFOLIO) shrinks more than a shorter one (PROJECTS) and the
    // shared letters (the "P") render at different sizes between sections.
    var probe = document.createElement('span');
    probe.className = 'site-watermark__word';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    roll.appendChild(probe);
    var maxW = 0;
    for (var i = 0; i < MAP.length; i++) {
      probe.textContent = MAP[i].text;
      maxW = Math.max(maxW, probe.getBoundingClientRect().width);
    }
    roll.removeChild(probe);
    if (!maxW) return;
    var target = window.innerWidth * (1 - 2 * SIDE);
    roll.style.transform = 'scale(' + Math.min(1, target / maxW).toFixed(4) + ')';
  }

  var MAP = [
    { id: 'hero', text: 'PORTFOLIO' },
    { id: 'projects', text: 'PROJECTS' },
    { id: 'about',    text: 'ABOUT ME' },
    { id: 'outro',    text: 'ABOUT ME' }   /* outro lives under the About section */
  ];

  var current = 'PORTFOLIO';
  var ROLL_MS = 600;

  function setWord(text) {
    if (text === current) return;
    current = text;

    var incoming = document.createElement('span');
    incoming.className = 'site-watermark__word';
    incoming.textContent = text;
    track.appendChild(incoming);

    void track.offsetWidth;                                   // commit before animating
    var n = track.children.length;                            // roll up to the newest line
    // Words are --roll-height tall (1em for Thunder, taller for theme fonts) —
    // measure instead of assuming 1em, or the glide lands short and snaps.
    var wordH = parseFloat(getComputedStyle(track.children[0]).height) || track.children[0].offsetHeight;
    track.style.transition = 'transform ' + (ROLL_MS / 1000) + 's cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = 'translateY(-' + ((n - 1) * wordH) + 'px)';

    fit();   // scale to keep side margins for the incoming word

    clearTimeout(track._cleanup);
    track._cleanup = setTimeout(function () {
      track.style.transition = 'none';
      track.style.transform = 'translateY(0)';
      while (track.children.length > 1) track.removeChild(track.firstChild);   // keep only newest
    }, ROLL_MS + 40);
  }

  var targets = MAP
    .map(function (m) { return { el: document.getElementById(m.id), text: m.text }; })
    .filter(function (t) { return t.el; });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var m = targets.find(function (t) { return t.el === e.target; });
        if (m) setWord(m.text);
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t.el); });
  }

  fit();                                          // initial word
  window.addEventListener('resize', fit);
  // The display font (Thunder) loads after first paint; the fallback is wider, so
  // the initial measure under-scales. Re-fit once the real font is in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
})();
