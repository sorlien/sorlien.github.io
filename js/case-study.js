/**
 * case-study.js
 *
 * Shared logic for all case study pages. Handles:
 *   1. Hero entrance animation (title + phones rise from below)
 *   2. Scroll-triggered section animations
 *   3. "View other projects" — renders the next 3 projects
 *      in circular order from projects-data.js
 *
 * Each case study page must:
 *   - Load projects-data.js before this file
 *   - Set data-project-id on <main> matching the id in projects-data.js
 *   - Include a <div id="otherProjectsGrid"> where cards will be injected
 */

(function () {

  // ── Hero entrance animation ─────────────────────
  function playHeroEntrance() {
    const title    = document.getElementById('csTitle');
    const desc     = document.getElementById('csDescription');
    const phones   = document.getElementById('csPhones');

    if (!title || !desc || !phones) return;

    setTimeout(() => title.classList.add('is-visible'),  200);
    setTimeout(() => desc.classList.add('is-visible'),   400);
    setTimeout(() => phones.classList.add('is-visible'), 550);
  }

  // ── Scroll animations ───────────────────────────
  // Observes elements with .scroll-reveal and adds .is-visible
  // when they enter the viewport.
  function initScrollAnimations() {
    const targets = document.querySelectorAll('.scroll-reveal');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, {
      threshold: 0.15,   // Trigger when 15% of element is visible
    });

    targets.forEach(el => observer.observe(el));
  }

  // ── View other projects ─────────────────────────
  /**
   * Finds the current project by id, then picks the next 3
   * in circular order from the projects array.
   *
   * Example with 6 projects, current = index 4:
   *   shows indices 5, 0, 1
   */
  function getOtherProjects(currentId) {
    const currentIndex = projects.findIndex(p => p.id === currentId);
    if (currentIndex === -1) return [];

    const others = [];
    for (let i = 1; i <= 3; i++) {
      const index = (currentIndex + i) % projects.length;
      others.push(projects[index]);
    }
    return others;
  }

  function buildProjectCard(project) {
    return `
      <a href="../${project.readMoreLink}" class="project-card" data-project-id="${project.id}">
        <div class="project-card__visual">
          <div class="project-card__circle"
               style="background-color: ${project.cardCircleColor}">
          </div>
          <img class="project-card__image"
               src="../${project.cardImage}"
               alt="${project.title}">
        </div>
        <p class="project-card__title">${project.title}</p>
        <p class="project-card__subtitle">${project.cardSubtitle}</p>
      </a>
    `;
  }

  function renderOtherProjects(currentId) {
    const grid = document.getElementById('otherProjectsGrid');
    if (!grid) return;

    const others = getOtherProjects(currentId);
    grid.innerHTML = others.map(buildProjectCard).join('');
  }

  // ── Init ────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const main      = document.querySelector('main[data-project-id]');
    const projectId = main ? main.getAttribute('data-project-id') : null;

    playHeroEntrance();
    initScrollAnimations();

    if (projectId) renderOtherProjects(projectId);
  });

})();
