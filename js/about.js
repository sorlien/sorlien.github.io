/**
 * about.js
 *
 * The About section of the one-pager. Two independent pieces:
 *
 *  1. Word-reveal (native scroll, passive) — the sticky portrait exits and a
 *     paragraph lights up word-by-word. Driven by the section's OWN
 *     getBoundingClientRect (section-relative), so it works at any page offset.
 *
 *  2. Orbital photo carousel (CAPTURE) — registers an adapter with the
 *     ScrollOrchestrator. Releases UP at the first photo (back into the reveal)
 *     and DOWN at the last photo (forward into the Outro). Desktop only; mobile
 *     renders a native horizontal photo strip.
 */

/* ───────────────────────── 1. Word-reveal driver ───────────────────────── */
(function () {
  'use strict';

  var section   = document.getElementById('aboutSection');
  var watermark = document.getElementById('aboutWatermark');
  var photo     = document.getElementById('aboutPhoto');
  var overlay   = document.getElementById('aboutRevealOverlay');
  var textEl    = document.getElementById('aboutRevealText');
  var hint      = document.getElementById('scrollHint');
  if (!section) return;

  // Word-reveal runs on mobile too. On mobile the text block is position:sticky
  // (CSS): it scrolls up in normal flow, sticks at centre while the words light,
  // then scrolls away. So JS only fades it in on entry + lights words — the CSS
  // sticky handles the hold (no big pinned section, so spacing stays tight).

  // Split the paragraph into word spans.
  var words = textEl.textContent.trim().split(/\s+/);
  textEl.innerHTML = words.map(function (w) {
    return '<span class="about-reveal__word">' + w + '</span>';
  }).join(' ');
  var spans = textEl.querySelectorAll('.about-reveal__word');
  var n = spans.length;

  // Entrance: the watermark + portrait settle into their resting (visible)
  // state, then exit on scroll. (Replaces the old about-animation.js sequence.)
  watermark.classList.add('is-visible');
  if (photo) photo.classList.add('is-visible');

  function onScroll() {
    var vh          = window.innerHeight;
    var rectTop     = section.getBoundingClientRect().top;
    var local       = Math.max(0, -rectTop);                 // section-relative scroll (after pin)
    var scrollRange = section.offsetHeight - vh;
    var mobile      = window.innerWidth < 768;
    // Mobile: enter sooner and slide further into view, then start lighting words
    // earlier — less dead white space before things happen.
    var exitEnd      = vh * (mobile ? 0.12 : 0.5);
    var overlayStart = mobile ? 0       : vh * 0.10;
    var overlayRange = mobile ? vh * 0.45 : vh * 0.45;
    var overlayRise  = mobile ? vh * 0.16 : vh * 0.22;

    // Scroll hint exit (only once active)
    if (hint && hint._hintActive) {
      var hintP = Math.min(1, local / 60);
      if (hintP > 0) {
        hint.style.animation  = 'none';
        hint.style.opacity    = (1 - hintP).toFixed(3);
        hint.style.transform  = 'translateX(-50%) translateY(' + (hintP * 40) + 'px)';
      } else {
        hint.style.animation  = 'scroll-hint-bounce 1.4s ease-in-out infinite';
        hint.style.opacity    = '1';
        hint.style.transform  = 'translateX(-50%) translateY(0)';
      }
    }

    // Phase 1: watermark + photo exit (0 → exitEnd)
    if (local > 0) {
      var exitP = Math.min(1, Math.max(0, local / exitEnd));
      if (watermark) {
        watermark.style.setProperty('transform',  'translateY(' + (-exitP * 90) + 'px) scale(' + (1 - exitP * 0.5) + ')', 'important');
        watermark.style.setProperty('opacity',    Math.max(0, 1 - exitP * 1.8).toFixed(3), 'important');
        watermark.style.setProperty('transition', 'none', 'important');
      }
      if (photo) {
        photo.style.setProperty('transform',  'translateX(' + (exitP * exitP * vh * (window.innerWidth / vh)) + 'px)', 'important');
        photo.style.setProperty('transition', 'none', 'important');
      }
    } else if (watermark) {
      watermark.style.removeProperty('transform');
      watermark.style.removeProperty('opacity');
      watermark.style.removeProperty('transition');
      if (photo) { photo.style.removeProperty('transform'); photo.style.removeProperty('transition'); }
    }

    // Phase 2: overlay eases up — starts sooner (10vh) and over a longer, gentler
    // window (10vh → 55vh) with a small rise so it doesn't "fly in".
    // Mobile: fade/rise in while the section is still ENTERING (rectTop: 0.85vh → 0.15vh),
    // so the text shows during the scroll-in instead of after a blank viewport.
    // Fade the text up as it scrolls in. On mobile the block is position:sticky,
    // so we only fade + a small rise that settles to 0 (CSS holds it at centre);
    // no parallax — it scrolls in normally, sticks, lights, then scrolls away.
    var overlayP = mobile
      ? Math.min(1, Math.max(0, (vh - rectTop) / (vh * 0.55)))   // fade in as it enters
      : Math.min(1, Math.max(0, (local - overlayStart) / overlayRange));
    if (overlay) {
      overlay.style.opacity       = overlayP.toFixed(3);
      overlay.style.transform     = 'translateY(' + ((1 - overlayP) * overlayRise) + 'px)';
      overlay.style.pointerEvents = overlayP > 0.5 ? 'auto' : 'none';
    }

    // Phase 3: word reveal (exitEnd → scrollRange)
    var wordP    = Math.min(1, Math.max(0, (local - exitEnd) / (scrollRange - exitEnd)));
    var frontier = wordP * n;
    for (var i = 0; i < n; i++) spans[i].classList.toggle('is-lit', i < frontier);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Activate the scroll hint shortly after load (matches old entrance feel).
  if (hint) {
    setTimeout(function () {
      hint.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      hint.style.opacity    = '1';
      hint.style.transform  = 'translateX(-50%) translateY(0)';
      hint._hintActive      = true;
      hint.style.animation  = 'scroll-hint-bounce 1.4s ease-in-out infinite';
    }, 400);
  }
})();


/* ───────────────────────── 2. Orbital carousel ─────────────────────────── */
(function () {
  'use strict';

  var orbitalEl = document.getElementById('aboutOrbital');
  var stage     = document.getElementById('orbitalStage');
  var track     = document.getElementById('orbitalTrack');
  var mobileEl  = document.getElementById('orbitalMobile');
  if (!track) return;

  var IMAGES = [
    'assets/images/about/image1.jpg',
    'assets/images/about/image2.JPG',
    'assets/images/about/image3.JPG',
    'assets/images/about/image4.JPG',
    'assets/images/about/image5.JPG',
    'assets/images/about/image6.JPG',
    'assets/images/about/image7.JPG'
  ];
  var ALTS = ['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6', 'Image 7'];

  // Mobile: native horizontal strip, no scroll capture.
  if (window.innerWidth < 768) {
    if (mobileEl) {
      for (var m = 0; m < IMAGES.length; m++) {
        var mc = document.createElement('div');
        mc.className = 'orbital-mobile__card';
        var mi = document.createElement('img');
        mi.src = IMAGES[m];
        mi.alt = ALTS[m];
        mc.appendChild(mi);
        mobileEl.appendChild(mc);
      }
    }
    return;
  }

  // ── Config ──
  var Ncards = 7;
  var W = 300, H = 533, R = 1200, GAP = 0.26;
  var OFFSETS      = [-3, -2, -1, 0, 1, 2, 3].map(function (x) { return x * GAP; });
  var INITIAL_BASE = 3 * GAP;   // card[0] starts centered
  var BASE_MAX     =  3 * GAP;  // card[0] centered (start)
  var BASE_MIN     = -3 * GAP;  // card[6] centered (end)
  var SENS         = 0.00045;
  var TENSION  = [0.030, 0.038, 0.044, 0.062, 0.044, 0.038, 0.030];
  var FRICTION = [0.85,  0.84,  0.83,  0.80,  0.83,  0.84,  0.85];

  // ── State ──
  var baseTarget = INITIAL_BASE;
  var angles     = OFFSETS.map(function (o) { return INITIAL_BASE + o; });
  var vels       = [0, 0, 0, 0, 0, 0, 0];
  var rafId      = null;

  // ── Build DOM ──
  var cards = [];
  for (var i = 0; i < Ncards; i++) {
    var el  = document.createElement('div');
    el.className = 'orbital-card';
    el.style.width  = W + 'px';
    el.style.height = H + 'px';
    var img = document.createElement('img');
    img.src = IMAGES[i];
    img.alt = ALTS[i];
    img.draggable = false;
    el.appendChild(img);
    track.appendChild(el);
    cards.push(el);
  }

  // ── Render loop ──
  function frame() {
    var sw = stage.offsetWidth, sh = stage.offsetHeight;
    var cx = sw / 2;
    var cy = sh * 0.5 + R;   // circle centre below the stage → cards fan upward
    var moving = false;

    for (var j = 0; j < Ncards; j++) {
      var target = baseTarget + OFFSETS[j];
      var delta  = target - angles[j];
      vels[j]    = vels[j] * FRICTION[j] + delta * TENSION[j];
      angles[j] += vels[j];
      if (Math.abs(vels[j]) > 0.00008 || Math.abs(delta) > 0.00008) moving = true;

      var a   = angles[j];
      var px  = cx + R * Math.sin(a);
      var py  = cy - R * Math.cos(a);
      var rot = a * (180 / Math.PI);
      var dist = Math.abs(a) / GAP;
      var sc   = Math.max(0.75, 1 - dist * 0.10);
      var op   = Math.max(0.50, 1 - dist * 0.18);

      var c = cards[j];
      c.style.opacity   = op.toFixed(3);
      c.style.transform = 'translate(' + (px - W / 2).toFixed(1) + 'px,' + (py - H / 2).toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
      c.style.zIndex    = String(Math.round((1 - dist * 0.12) * 10));
    }
    rafId = moving ? requestAnimationFrame(frame) : null;
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(frame); }

  function clamp(min, max, v) { return Math.min(max, Math.max(min, v)); }

  // ── Register capture adapter ──
  if (window.ScrollOrchestrator) {
    window.ScrollOrchestrator.register({
      el:      orbitalEl,
      // A playful element, not a gate: no entry/boundary holds, so it's easy to
      // spin into and out of (straight on to the closing animation below).
      loose:   true,
      atStart: function () { return baseTarget >= INITIAL_BASE - 0.001; },
      // Released down only once the LAST card has actually settled at centre.
      atEnd:   function () { return baseTarget <= BASE_MIN + 0.001 && Math.abs(angles[Ncards - 1]) < 0.02; },
      step:    function (d) { baseTarget = clamp(BASE_MIN, BASE_MAX, baseTarget - d * SENS); kick(); },
      isBusy:  function () { return false; },
    });
  }

  kick();   // initial render
})();
