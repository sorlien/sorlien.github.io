/**
 * scroll-orchestrator.js
 *
 * The single "spine" for the one-page site (replaces the old SPA router).
 *
 * The page stacks scroll-driven sections. Two of them — the Projects carousel
 * and the About orbital — are CAPTURE sections: while one owns the screen it
 * LOCKS the page scroll and converts wheel/touch into internal "steps" (spin to
 * the next/previous item). You cannot leave until the section has spun to its
 * boundary (last item going down, first item going up) AND a short hold has
 * elapsed — then the scroll is released into the neighbouring section. This
 * makes a capture section impossible to skip past, even with a fast fling.
 *
 * Native-scroll sections (hero fold, outro) register nothing and scroll freely.
 *
 * A capture adapter is:
 *   {
 *     el:        the sticky 100vh "pin" element (what fills the viewport),
 *     atStart(): true when at the first internal item,
 *     atEnd():   true when at the last internal item,
 *     step(dy):  advance one item in the gesture direction (dy>0 forward),
 *     isBusy():  (optional) true while an internal animation is mid-flight,
 *   }
 */
window.ScrollOrchestrator = (function () {
  'use strict';

  function clamp(min, max, v) { return Math.min(max, Math.max(min, v)); }

  function sectionProgress(track) {
    var r = track.getBoundingClientRect();
    var scrollable = track.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(0, 1, (-r.top) / scrollable);
  }

  var captures = [];
  var started  = false;

  // ── Lock state ──
  var engaged  = null;  // the capture currently locking the scroll
  var lockY    = 0;     // scrollY held while engaged
  var armed    = true;  // may engage; set false after a release until the pin leaves
  var snapping = false; // true while the eased glide into the framed position runs
  var SNAP_MS  = 420;   // duration of that glide
  var suppressUntil = 0; // while in the future, the lock is fully off (used for in-page nav)

  // ── Release / boundary-hold state ──
  var releaseUntil = 0; // during this window the lock is off so native scroll can carry out
  var releaseDir   = 0; // direction of the last release (+1 down, -1 up)
  var RELEASE_MS   = 600;
  var BOUNDARY_HOLD_MS = 320; // first item settles + holds this long before releasing back up
  var END_HOLD_MS      = 220; // last item — held briefly, then clearly scrolls past
  var ARRIVAL_HOLD_MS  = 140; // brief landing beat before spinning is allowed
  var engagedAt    = 0;       // when the current section engaged
  var endArrived   = 0;
  var startArrived = 0;

  // ── Gesture gating (one item-step per gesture) ──
  // A trackpad flick's momentum tail outlives the carousel's busy window, so
  // the leftover wheel events used to fire a SECOND step (skipping an item).
  // A step is allowed once per gesture. A new wheel gesture starts after a
  // silence gap, or when the delta magnitude RISES again mid-tail (a fresh
  // flick); a new touch gesture starts on touchstart. Boundary holds and
  // releases are untouched — a single fling can still carry you out.
  var stepAllowed  = true;
  var lastWheelT   = 0;
  var lastWheelMag = 0;
  var WHEEL_GAP_MS = 220;  // wheel silence longer than this = new gesture
                           // (a quick re-flick inside the gap is caught by WHEEL_RISE)
  var WHEEL_RISE   = 1.4;  // |delta| must exceed the tail by this ratio = new flick
  var WHEEL_FLOOR  = 40;   // …and by this absolute amount. A dying tail jitters
                           // around tiny values (2–7) where a pure ratio test
                           // false-triggers; a genuine flick starts well above this.

  function register(adapter) {
    if (adapter && adapter.el) captures.push(adapter);
  }

  // The capture whose pin currently owns the viewport CENTRE. Using the centre
  // (not "exactly fills") gives a wide ~1-viewport catch window, so a fast
  // scroll can't jump over the section between two events.
  function ownsCentre() {
    var mid = window.innerHeight / 2;
    for (var i = 0; i < captures.length; i++) {
      var r = captures[i].el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) return captures[i];
    }
    return null;
  }

  // Eased glide into a target scrollY (easeOutCubic), instead of an abrupt jump.
  function glideTo(toY, done) {
    var fromY = window.scrollY;
    var dist = toY - fromY;
    if (Math.abs(dist) < 2) { snapping = false; if (done) done(); return; }
    snapping = true;
    var t0 = performance.now();
    (function frame() {
      var p = clamp(0, 1, (performance.now() - t0) / SNAP_MS);
      var e = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, Math.round(fromY + dist * e));
      if (p < 1) { requestAnimationFrame(frame); }
      else { snapping = false; if (done) done(); }
    })();
  }

  function engage(c) {
    engaged = c;
    endArrived = 0; startArrived = 0;
    stepAllowed = false;      // the gesture that carried you in shouldn't also spin
    // Frame the pin at the top, gliding there smoothly. The arrival dwell starts
    // once the glide settles, so the entry item rests for a beat before spinning.
    lockY = Math.round(window.scrollY + c.el.getBoundingClientRect().top);
    glideTo(lockY, function () { engagedAt = performance.now(); });
  }

  function release(dir) {
    engaged = null;
    snapping = false;
    armed = false;            // don't re-engage until the pin leaves the centre…
    releaseDir = dir;
    releaseUntil = performance.now() + RELEASE_MS;
    endArrived = 0; startArrived = 0;
  }

  function maybeEngage(now) {
    if (!armed || now < releaseUntil || now < suppressUntil) return;
    var c = ownsCentre();
    if (c) engage(c);
  }

  // Temporarily disengage and stop clamping/engaging — used by in-page nav so a
  // programmatic smooth-scroll can pass through locked sections.
  function suppress(ms) {
    suppressUntil = performance.now() + (ms || 1200);
    engaged = null;
    snapping = false;
    armed = true;
  }

  // Boundary hold + release + step. Mutates lock state; may call release().
  function spin(a, delta, now) {
    // Hold the entry item while the glide settles, then for a beat after, so
    // project 1 (entering down) / project 4 (entering up) don't fly past.
    // Loose sections (the About orbital) skip all holds/settle-gates — easy in, easy out.
    var arrivalHold  = a.loose ? 0 : ARRIVAL_HOLD_MS;
    var boundaryHold = a.loose ? 0 : BOUNDARY_HOLD_MS;
    var endHold      = a.loose ? 0 : END_HOLD_MS;

    if (snapping || now - engagedAt < arrivalHold) return;

    var busy = a.isBusy && a.isBusy();

    if (delta > 0) {                       // forward / down
      startArrived = 0;
      if (a.atEnd()) {
        if (busy && !a.loose) { endArrived = 0; return; }  // let the last item finish settling first
        if (endArrived === 0) endArrived = now;
        if (now - endArrived < endHold) return;            // hold pinned (briefly)
        release(1); return;
      }
      endArrived = 0;
    } else if (delta < 0) {                // back / up
      endArrived = 0;
      if (a.atStart()) {
        if (busy && !a.loose) { startArrived = 0; return; } // wait for project 1 to fully spin in
        if (startArrived === 0) startArrived = now;         // then dwell so it's clearly seen
        if (now - startArrived < boundaryHold) return;
        release(-1); return;
      }
      startArrived = 0;
    }
    // Loose sections (the About orbital) spin continuously with the gesture —
    // gesture gating only applies to stepped sections (the Projects carousel).
    if ((a.loose || stepAllowed) && !(a.isBusy && a.isBusy())) {
      if (!a.loose) stepAllowed = false; // consumed — next step needs a new gesture
      a.step(delta);
    }
  }

  // ── Scroll: hold the lock; arm/engage when appropriate ──
  function onScroll() {
    var now = performance.now();
    if (now < suppressUntil) { engaged = null; return; }   // in-page nav in progress
    if (engaged) {
      if (snapping) return;                           // gliding in — don't fight it
      if (now < releaseUntil) return;                 // releasing — let it scroll
      if (window.scrollY !== lockY) window.scrollTo(0, lockY);   // re-clamp drift
      return;
    }
    if (!armed) {
      if (!ownsCentre()) armed = true;                // pin left the centre → re-arm
      return;
    }
    maybeEngage(now);
  }

  // ── Wheel ──
  function onWheel(e) {
    var now = performance.now();
    if (now < suppressUntil) return;                  // in-page nav in progress — let it scroll
    // New gesture? (silence gap, or delta rising again = fresh flick mid-tail)
    var mag = Math.abs(e.deltaY);
    if (now - lastWheelT > WHEEL_GAP_MS ||
        (mag >= WHEEL_FLOOR && mag > lastWheelMag * WHEEL_RISE)) stepAllowed = true;
    lastWheelT = now; lastWheelMag = mag;
    if (!engaged) {
      var d = e.deltaY > 0 ? 1 : -1;
      if (!armed && d !== releaseDir) armed = true;   // reversed direction → re-arm
      maybeEngage(now);
      if (engaged) { e.preventDefault(); return; }    // just snapped in; spin on next event
      return;                                         // native-scroll section
    }
    spin(engaged, e.deltaY, now);
    if (engaged) e.preventDefault();   // hold the page only while still captured; on release, let this event scroll
  }

  // ── Touch ──
  var touchY = 0, touchAccum = 0, TOUCH_STEP = 44;

  function onTouchStart(e) { touchY = e.touches[0].clientY; touchAccum = 0; stepAllowed = true; }

  function onTouchMove(e) {
    var now = performance.now();
    if (now < suppressUntil) return;
    var y = e.touches[0].clientY;
    var dy = touchY - y;          // >0 → dragging up → "forward"
    touchY = y;
    if (!engaged) {
      var d = dy > 0 ? 1 : -1;
      if (!armed && d !== releaseDir) armed = true;
      maybeEngage(now);
      if (engaged) { e.preventDefault(); return; }
      return;
    }
    touchAccum += dy;
    while (Math.abs(touchAccum) >= TOUCH_STEP) {
      var s = touchAccum > 0 ? TOUCH_STEP : -TOUCH_STEP;
      spin(engaged, s, now);
      if (!engaged) { touchAccum = 0; break; }   // released → stop capturing, let native scroll carry
      touchAccum -= s;
    }
    if (engaged) e.preventDefault();   // hold the page only while still captured
  }

  function start() {
    if (started) return;
    started = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
  }

  return {
    register: register,
    start: start,
    suppress: suppress,
    clamp: clamp,
    sectionProgress: sectionProgress,
    get active() { return engaged; },
  };
})();
