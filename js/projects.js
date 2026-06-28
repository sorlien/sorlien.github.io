/**
 * projects.js
 *
 * Spinning-wheel carousel + mechanical text transitions for the Projects
 * section of the one-pager.
 *
 * - Three slots (A/B/C) cycle roles: prev, active, next
 * - Project number and title roll up/down like an odometer; description fades
 * - NON-INFINITE: navigation clamps at the first/last project. Scroll past the
 *   ends is released by the ScrollOrchestrator so the page flows to the
 *   neighbouring section (Hero above, About below).
 * - Desktop: registers a capture adapter with the orchestrator (pinned, wheel/
 *   touch spin). Mobile: native page scroll + horizontal swipe to change project.
 *
 * Projects are defined in projects-data.js.
 */

window.initProjects = function () {
  const watermark = document.getElementById('projectsWatermark');
  if (!watermark) return;

  // ── State ───────────────────────────────────────
  const N = projects.length;
  // Open on a specific project when arriving via a case study's "back to projects"
  // link (index.html?p=<id>#projects) — otherwise start at the first.
  let currentIndex = 0;
  try {
    const pid = new URLSearchParams(window.location.search).get('p');
    if (pid) {
      const idx = projects.findIndex((p) => p.id === pid);
      if (idx >= 0) currentIndex = idx;
    }
  } catch (e) {}
  window._projectsAnimating = false;

  // ── DOM references ──────────────────────────────
  const section    = document.querySelector('.projects-view');  // the sticky pin
  const infoEl     = document.getElementById('projectInfo');
  const descEl     = document.getElementById('projectDescription');
  const readMoreEl = document.getElementById('readMoreBtn');

  const digitA = document.getElementById('projectNumberA');
  const digitB = document.getElementById('projectNumberB');
  const titleA = document.getElementById('projectTitleA');
  const titleB = document.getElementById('projectTitleB');

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
  function extractNum(numberStr) { return numberStr.split(' ')[1]; }

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
      setTimeout(() => rollTitle(p.title, direction), 75);
      fadeDesc(p.description);
    } else {
      initNumber(extractNum(p.number));
      initTitle(p.title);
      initDesc(p.description);
    }

    readMoreEl.href = p.readMoreLink;
    document.getElementById('projectCarousel').setAttribute('data-project', p.id);
    updateEdgeGhosts();
  }

  // Hide the incoming ghost when there is no further project that direction,
  // so the wheel/orbital can't appear to loop at the boundaries.
  function updateEdgeGhosts() {
    if (slots.next) slots.next.style.visibility = currentIndex === N - 1 ? 'hidden' : '';
    if (slots.prev) slots.prev.style.visibility = currentIndex === 0     ? 'hidden' : '';
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

  // ── Navigate next (only called when currentIndex < N-1) ──
  function navigateNext() {
    if (window._projectsAnimating) return;
    window._projectsAnimating = true;

    const newActiveIdx = nextIdx(currentIndex);
    const newNextIdx   = nextIdx(newActiveIdx);

    const prevSlot = slots.prev, activeSlot = slots.active, nextSlot = slots.next;
    const prevImg  = slotImgs.prev, activeImg = slotImgs.active, nextImg = slotImgs.next;

    setImg(prevImg, newNextIdx);
    setPos(prevSlot, 'exit-right', true);

    setPos(activeSlot, 'prev',   false);
    setPos(nextSlot,   'active', false);
    setPos(prevSlot,   'next',   false);

    currentIndex = newActiveIdx;
    slots    = { prev: activeSlot, active: nextSlot,  next: prevSlot  };
    slotImgs = { prev: activeImg,  active: nextImg,   next: prevImg   };

    renderInfo(currentIndex, true, 'next');
    setTimeout(() => { window._projectsAnimating = false; }, window.innerWidth < 768 ? 850 : 1050);
  }

  // ── Navigate back (only called when currentIndex > 0) ──
  function navigateBack() {
    if (window._projectsAnimating) return;
    window._projectsAnimating = true;

    const newActiveIdx = prevIdx(currentIndex);
    const newPrevIdx   = prevIdx(newActiveIdx);

    const prevSlot = slots.prev, activeSlot = slots.active, nextSlot = slots.next;
    const prevImg  = slotImgs.prev, activeImg = slotImgs.active, nextImg = slotImgs.next;

    setImg(nextImg, newPrevIdx);
    setPos(nextSlot, 'exit-left', true);

    setPos(activeSlot, 'next',   false);
    setPos(prevSlot,   'active', false);
    setPos(nextSlot,   'prev',   false);

    currentIndex = newActiveIdx;
    slots    = { prev: nextSlot,  active: prevSlot,  next: activeSlot };
    slotImgs = { prev: nextImg,   active: prevImg,   next: activeImg  };

    renderInfo(currentIndex, true, 'back');
    setTimeout(() => { window._projectsAnimating = false; }, window.innerWidth < 768 ? 850 : 1050);
  }

  // ── Initial resting state + scroll-in reveal ─────
  initCarousel();
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        watermark.classList.add('is-visible');
        infoEl.classList.add('is-visible');
        revealIO.disconnect();
      }
    });
  }, { threshold: 0.2 });
  revealIO.observe(section);

  // ── Register capture adapter (desktop AND mobile — scroll drives the carousel) ──
  if (window.ScrollOrchestrator) {
    window.ScrollOrchestrator.register({
      el:      section,
      atStart: () => currentIndex === 0,
      atEnd:   () => currentIndex === N - 1,
      step:    (d) => {
        if (d > 0 && currentIndex < N - 1) navigateNext();
        else if (d < 0 && currentIndex > 0) navigateBack();
      },
      isBusy:  () => window._projectsAnimating,
    });

    // Keyboard navigation while the section is the active (pinned) one.
    document.addEventListener('keydown', (e) => {
      const a = window.ScrollOrchestrator.active;
      if (!a || a.el !== section) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIndex < N - 1) { e.preventDefault(); window._projectsAnimating = false; navigateNext(); }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIndex > 0) { e.preventDefault(); window._projectsAnimating = false; navigateBack(); }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', window.initProjects);
