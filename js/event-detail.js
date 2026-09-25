import { supabase } from './supabase.js';
import { showToast, initEventRegistrationForm } from './forms.js';

/**
 * Format date to localized string: "20 Oktober 2026"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time string: "10:00" → "10.00 WIB"
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  return `${h}.${m} WIB`;
}

/**
 * Get badge class and label for event status
 */
function getStatusBadge(event) {
  if (event.status === 'completed') return { cls: 'badge--completed', label: 'Completed' };
  if (event.status === 'closed') return { cls: 'badge--closed', label: 'Closed' };
  if (event.status === 'ongoing') return { cls: 'badge--open', label: 'Ongoing' };
  if (event.registration_open) return { cls: 'badge--open', label: 'Open Registration' };
  return { cls: 'badge--upcoming', label: 'Coming Soon' };
}

/**
 * Initialize mobile navbar toggle
 */
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

/**
 * Render event data into the page
 */
function renderEvent(event) {
  document.title = `${event.title} — INDSCRIPT COMMUNITY`;

  // Poster
  const posterEl = document.getElementById('event-poster');
  if (event.poster_url) {
    posterEl.innerHTML = `<img src="${event.poster_url}" alt="${event.title}">`;
  } else {
    posterEl.outerHTML = `<div class="ed__poster--placeholder">Poster Event</div>`;
  }

  // Title
  document.getElementById('event-title').textContent = event.title;

  // Meta
  document.querySelector('#event-date span').textContent = formatDate(event.event_date);
  document.querySelector('#event-time span').textContent = formatTime(event.event_time);
  document.querySelector('#event-location span').textContent = event.location || '—';

  // Badge
  const badge = getStatusBadge(event);
  const badgeEl = document.getElementById('event-badge');
  badgeEl.className = `badge ${badge.cls}`;
  badgeEl.textContent = badge.label;

  // Description
  document.getElementById('event-description').textContent = event.description || '';

  // Speaker
  if (event.speaker) {
    const speakerSection = document.getElementById('event-speaker');
    speakerSection.style.display = '';
    document.getElementById('event-speaker-text').textContent = event.speaker;
  }

  // Registration form hidden field
  const eventIdField = document.getElementById('reg-event-id');
  if (eventIdField) {
    eventIdField.value = event.id;
  }

  // Handle registration visibility
  const form = document.getElementById('registration-form');
  const closedNotice = document.getElementById('registration-closed');
  const canRegister = event.registration_open && event.status !== 'completed' && event.status !== 'closed';

  if (canRegister) {
    form.style.display = '';
    closedNotice.style.display = 'none';
  } else {
    form.style.display = 'none';
    closedNotice.style.display = '';
  }
}

/**
 * Load registration stats for this event
 */
async function loadEventStats(slug) {
  const el = document.getElementById('stat-registered-count');
  if (!el) return;

  try {
    const { data, error } = await supabase
      .rpc('get_event_stats', { p_slug: slug })
      .single();

    if (error || !data) {
      el.textContent = '0';
      return;
    }

    el.textContent = data.registered_count > 0 ? `${data.registered_count}` : '0';
  } catch {
    el.textContent = '0';
  }
}

/**
 * Main initialization
 */
async function init() {
  initNavbar();

  const slug = new URLSearchParams(window.location.search).get('slug');

  const loadingEl = document.getElementById('event-loading');
  const contentEl = document.getElementById('event-content');
  const notFoundEl = document.getElementById('event-not-found');
  const errorEl = document.getElementById('event-error');

  if (!slug) {
    loadingEl.style.display = 'none';
    notFoundEl.style.display = '';
    return;
  }

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    loadingEl.style.display = 'none';

    if (error || !event) {
      notFoundEl.style.display = '';
      return;
    }

    renderEvent(event);
    contentEl.style.display = '';

    // Init registration form
    initEventRegistrationForm();
  } catch {
    loadingEl.style.display = 'none';
    errorEl.style.display = '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
