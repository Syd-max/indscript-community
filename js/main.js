import { loadEvents } from './events.js';
import { initForms } from './forms.js';

function initNavbar() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen.toString());
  });

    menu.querySelectorAll('.navbar__link, .navbar__cta').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

    document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -60% 0px' }
  );

  sections.forEach(section => observer.observe(section));
}

async function init() {
  initNavbar();
  initScrollSpy();
  initForms();

    await Promise.allSettled([
    loadEvents()
  ]);

  initCarousel();
}

function initCarousel() {
  const grid = document.querySelector('.events__grid');
  if (!grid) return;

  setInterval(() => {
    // If user is hovering over the grid, pause auto-scroll
    if (grid.matches(':hover')) return;

    const maxScroll = grid.scrollWidth - grid.clientWidth;
    
    // If scrolled to the end, snap back to start
    if (grid.scrollLeft >= maxScroll - 10) {
      grid.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Find a card to determine width, fallback to 300px
      const firstCard = grid.querySelector('.event-card');
      const cardWidth = firstCard ? firstCard.offsetWidth + 32 : 332; // adding gap
      grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  }, 6000); // Scroll every 6 seconds as requested
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
