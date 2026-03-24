/**
 * projects.js
 *
 * Spinning wheel carousel + mechanical text transitions for the projects page.
 *
 * - Three slots (A/B/C) cycle roles: prev, active, next
 * - Scroll / swipe / arrow keys navigate between projects
 * - Project number and title roll up/down like an odometer
 * - Description fades out then back in
 * - All text animations complete in sync with the phone transition (650ms)
 *
 * Projects are defined in projects-data.js.
 */

window.initProjects = function () {
  const watermark = document.getElementById('projectsWatermark');
  if (!watermark) return;

  // ── State ───────────────────────────────────────
  const N = projects.length;
  let currentIndex = 0;
  // Global flag — shared across re-initialisations so two handler instances
  // can never both think it's safe to navigate at the same time.
  window._projectsAnimating = false;

  // ── DOM references ──────────────────────────────
  const infoEl     = document.getElementById('projectInfo');
  const descEl     = document.getElementById('projectDescription');
  const readMoreEl = document.getElementById('readMoreBtn');

  // Number odometer slots
  const digitA = document.getElementById('projectNumberA');
  const digitB = document.getElementById('projectNumberB');

  // Title roll slots
  const titleA = document.getElementById('projectTitleA');
  const titleB = document.getElementById('projectTitleB');

  // Carousel image slots
  const elA  = document.getElementById('carouselA');
  const elB  = document.getElementById('carouselB');
  const elC  = document.getElementById('carouselC');
  const imgA = document.getElementById('carouselImgA');
  const imgB = document.getElementById('carouselImgB');
  const imgC = document.getElementById('carouselImgC');

  let slots    = { prev: elA,  active: elB,  next: elC  };
  let slotImgs = { prev: imgA, active: imgB, next: imgC };
  let activeDigit = 'A';
  let activeTitleDigit = 'A';

  // ── Index helpers ───────────────────────────────
  function wrap(n)    { return ((n % N) + N) % N; }
  function nextIdx(i) { return wrap(i + 1); }
  function prevIdx(i) { return wrap(i - 1); }

  // ── Carousel helpers ────────────────────────────
  function setPos(el, pos, instant) {
    if (instant) {
      el.style.transition = 'none';
      el.setAttribute('data-pos', pos);
      void el.offsetWidth;
      el.style.transition = '';
    } else {
      el.setAttribute('data-pos', pos);
    }
  }

  function setImg(imgEl, index) {
    const p = projects[index];
    imgEl.src = p.image;
    imgEl.alt = p.title;
  }

  // ── Number odometer ──────────────────────────────
  function extractNum(numberStr) {
    return numberStr.split(' ')[1]; // "Project 01" → "01"
  }

  function initNumber(numStr) {
    digitA.textContent      = numStr;
    digitA.style.transition = 'none';
    digitA.style.transform  = 'translateY(0)';
    digitB.textContent      = '';
    digitB.style.transition = 'none';
    digitB.style.transform  = 'translateY(110%)';
    activeDigit = 'A';
  }

  function rollNumber(numStr, direction) {
    const outgoing = activeDigit === 'A' ? digitA : digitB;
    const incoming = activeDigit === 'A' ? digitB : digitA;
    const outExit  = direction === 'next' ? 'translateY(-110%)' : 'translateY(110%)';
    const inStart  = direction === 'next' ? 'translateY(110%)'  : 'translateY(-110%)';
    const easing   = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';

    incoming.textContent      = numStr;
    incoming.style.transition = 'none';
    incoming.style.transform  = inStart;
    void incoming.offsetWidth;

    outgoing.style.transition = easing;
    incoming.style.transition = easing;
    outgoing.style.transform  = outExit;
    incoming.style.transform  = 'translateY(0)';

    activeDigit = activeDigit === 'A' ? 'B' : 'A';
  }

  // ── Title roll ───────────────────────────────────
  function initTitle(text) {
    titleA.textContent      = text;
    titleA.style.transition = 'none';
    titleA.style.transform  = 'translateY(0)';
    titleB.textContent      = '';
    titleB.style.transition = 'none';
    titleB.style.transform  = 'translateY(110%)';
    activeTitleDigit = 'A';
  }

  function rollTitle(text, direction) {
    const outgoing = activeTitleDigit === 'A' ? titleA : titleB;
    const incoming = activeTitleDigit === 'A' ? titleB : titleA;
    const outExit  = direction === 'next' ? 'translateY(-110%)' : 'translateY(110%)';
    const inStart  = direction === 'next' ? 'translateY(110%)'  : 'translateY(-110%)';
    const easing   = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';

    incoming.textContent      = text;
    incoming.style.transition = 'none';
    incoming.style.transform  = inStart;
    void incoming.offsetWidth;

    outgoing.style.transition = easing;
    incoming.style.transition = easing;
    outgoing.style.transform  = outExit;
    incoming.style.transform  = 'translateY(0)';

    activeTitleDigit = activeTitleDigit === 'A' ? 'B' : 'A';
  }

  // ── Description fade ─────────────────────────────
  function initDesc(text) {
    descEl.style.transition = 'none';
    descEl.style.opacity    = '1';
    descEl.textContent      = text;
  }

  function fadeDesc(text) {
    // Fade out over 200ms, swap content, fade back in to complete at ~650ms
    descEl.style.transition = 'opacity 0.2s ease';
    descEl.style.opacity    = '0';
    setTimeout(() => {
      descEl.textContent      = text;
      descEl.style.transition = 'opacity 0.45s ease';
      descEl.style.opacity    = '1';
    }, 210);
  }

  // ── Render ──────────────────────────────────────
  function renderInfo(index, animate, direction) {
    const p = projects[index];

    if (animate) {
      rollNumber(extractNum(p.number), direction);
      setTimeout(() => rollTitle(p.title, direction), 75); // staggered 75ms after number
      fadeDesc(p.description);
    } else {
      initNumber(extractNum(p.number));
      initTitle(p.title);
      initDesc(p.description);
    }

    readMoreEl.href = p.readMoreLink;
    document.getElementById('projectCarousel').setAttribute('data-project', p.id);
  }

  function initCarousel() {
    setImg(slotImgs.prev,   prevIdx(currentIndex));
    setImg(slotImgs.active, currentIndex);
    setImg(slotImgs.next,   nextIdx(currentIndex));
    setPos(slots.prev,   'prev',   true);
    setPos(slots.active, 'active', true);
    setPos(slots.next,   'next',   true);
    renderInfo(currentIndex, false);
  }

  // ── Navigate next ────────────────────────────────
  function navigateNext() {
    if (window._projectsAnimating) return;
    window._projectsAnimating = true;

    const newActiveIdx = nextIdx(currentIndex);
    const newNextIdx   = nextIdx(newActiveIdx);

    const prevSlot   = slots.prev;
    const activeSlot = slots.active;
    const nextSlot   = slots.next;
    const prevImg    = slotImgs.prev;
    const activeImg  = slotImgs.active;
    const nextImg    = slotImgs.next;

    setImg(prevImg, newNextIdx);
    setPos(prevSlot, 'exit-right', true);

    setPos(activeSlot, 'prev',   false);
    setPos(nextSlot,   'active', false);
    setPos(prevSlot,   'next',   false);

    currentIndex = newActiveIdx;
    slots    = { prev: activeSlot, active: nextSlot,  next: prevSlot  };
    slotImgs = { prev: activeImg,  active: nextImg,   next: prevImg   };

    renderInfo(currentIndex, true, 'next');
    setTimeout(() => { window._projectsAnimating = false; }, 1400);
  }

  // ── Navigate back ────────────────────────────────
  function navigateBack() {
    if (window._projectsAnimating) return;
    window._projectsAnimating = true;

    const newActiveIdx = prevIdx(currentIndex);
    const newPrevIdx   = prevIdx(newActiveIdx);

    const prevSlot   = slots.prev;
    const activeSlot = slots.active;
    const nextSlot   = slots.next;
    const prevImg    = slotImgs.prev;
    const activeImg  = slotImgs.active;
    const nextImg    = slotImgs.next;

    setImg(nextImg, newPrevIdx);
    setPos(nextSlot, 'exit-left', true);

    setPos(activeSlot, 'next',   false);
    setPos(prevSlot,   'active', false);
    setPos(nextSlot,   'prev',   false);

    currentIndex = newActiveIdx;
    slots    = { prev: nextSlot,  active: prevSlot,  next: activeSlot };
    slotImgs = { prev: nextImg,   active: prevImg,   next: activeImg  };

    renderInfo(currentIndex, true, 'back');
    setTimeout(() => { window._projectsAnimating = false; }, 1400);
  }

  // ── Entrance animation ──────────────────────────
  const WATERMARK_DELAY    = 600;
  const WATERMARK_DURATION = 1000;
  const CONTENT_START      = WATERMARK_DELAY + WATERMARK_DURATION + 100;

  function playEntrance() {
    if (sessionStorage.getItem('anim-projects-done')) {
      const main = document.querySelector('main');
      if (main) main.classList.add('skip-transitions');
      watermark.classList.add('is-visible');
      initCarousel();
      infoEl.classList.add('is-visible');
      requestAnimationFrame(() => {
        if (main) main.classList.remove('skip-transitions');
        document.documentElement.classList.remove('js-skip-intro');
      });
      return;
    }

    sessionStorage.setItem('anim-projects-done', '1');

    setImg(slotImgs.prev,   prevIdx(currentIndex));
    setImg(slotImgs.active, currentIndex);
    setImg(slotImgs.next,   nextIdx(currentIndex));
    renderInfo(currentIndex, false);

    // Prev stays invisible off upper-left
    setPos(slots.prev, 'prev', true);

    // Active: set data-pos but keep transition:none inline so CSS transition
    // never fires early. Inline transform/opacity hold the start position.
    const activeEl = slots.active;
    activeEl.style.transition = 'none';
    activeEl.style.transform  = 'translateX(-420px) translateY(600px) scale(0.12)';
    activeEl.style.filter     = 'blur(14px)';
    activeEl.style.opacity    = '0';
    activeEl.setAttribute('data-pos', 'active');

    // Ghost: same approach, starts further down the arc
    const ghostEl = slots.next;
    ghostEl.style.transition = 'none';
    ghostEl.style.transform  = 'translateX(-500px) translateY(750px) scale(0.08)';
    ghostEl.style.filter     = 'blur(16px)';
    ghostEl.style.opacity    = '0';
    ghostEl.setAttribute('data-pos', 'next');

    // Commit start positions before any timeouts
    void activeEl.offsetWidth;

    setTimeout(() => watermark.classList.add('is-visible'), WATERMARK_DELAY);

    // Active phone launches along the arc to its final position
    const ACTIVE_START = CONTENT_START;
    setTimeout(() => {
      infoEl.classList.add('is-visible');

      void activeEl.offsetWidth; // ensure start state is committed in this frame
      activeEl.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.35, 0.64, 1), filter 1.2s ease, opacity 1.1s cubic-bezier(0.34, 1.35, 0.64, 1)';
      activeEl.style.transform  = '';
      activeEl.style.filter     = '';
      activeEl.style.opacity    = '';

      setTimeout(() => { activeEl.style.transition = ''; }, 1050);
    }, ACTIVE_START);

    // Ghost phone follows 350ms after active, travels same arc, stops at ghost position
    const GHOST_START = ACTIVE_START + 350;
    setTimeout(() => {
      void ghostEl.offsetWidth;
      ghostEl.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.35, 0.64, 1), filter 1.2s ease, opacity 1.1s cubic-bezier(0.34, 1.35, 0.64, 1)';
      ghostEl.style.transform  = '';
      ghostEl.style.filter     = '';
      ghostEl.style.opacity    = '';

      setTimeout(() => { ghostEl.style.transition = ''; }, 1050);
    }, GHOST_START);
  }

  // ── Scroll navigation ────────────────────────────
  function handleWheel(e) {
    e.preventDefault();
    if (e.deltaY > 0) navigateNext();
    else if (e.deltaY < 0) navigateBack();
  }

  // ── Touch navigation ─────────────────────────────
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 30) {
      if (diff > 0) navigateNext();
      else navigateBack();
    }
  }

  const section = document.querySelector('.projects-view');

  if (window._projectsWheel)      section.removeEventListener('wheel',      window._projectsWheel);
  if (window._projectsTouchStart) section.removeEventListener('touchstart', window._projectsTouchStart);
  if (window._projectsTouchEnd)   section.removeEventListener('touchend',   window._projectsTouchEnd);

  window._projectsWheel      = handleWheel;
  window._projectsTouchStart = handleTouchStart;
  window._projectsTouchEnd   = handleTouchEnd;

  section.addEventListener('wheel',      handleWheel,      { passive: false });
  section.addEventListener('touchstart', handleTouchStart, { passive: true  });
  section.addEventListener('touchend',   handleTouchEnd,   { passive: true  });

  // ── Keyboard navigation ──────────────────────────
  if (window._projectsKeydown) document.removeEventListener('keydown', window._projectsKeydown);

  function handleKeydown(e) {
    if (!document.getElementById('projectsWatermark')) {
      document.removeEventListener('keydown', handleKeydown);
      return;
    }
    // Keyboard bypasses the animation lock — clear it so key presses are always instant.
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft'  || e.key === 'ArrowUp') {
      window._projectsAnimating = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigateBack();
  }

  window._projectsKeydown = handleKeydown;
  document.addEventListener('keydown', handleKeydown);

  // ── Init ────────────────────────────────────────
  playEntrance();
};

document.addEventListener('DOMContentLoaded', window.initProjects);
