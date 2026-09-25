import { supabase } from './supabase.js';

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  return `${h}.${m} WIB`;
}

function getStatusBadge(event) {
  if (event.status === 'completed') return { cls: 'badge--completed', label: 'Completed' };
  if (event.status === 'closed') return { cls: 'badge--closed', label: 'Closed' };
  if (event.status === 'ongoing') return { cls: 'badge--open', label: 'Ongoing' };
  if (event.registration_open) return { cls: 'badge--open', label: 'Open Registration' };
  return { cls: 'badge--upcoming', label: 'Coming Soon' };
}

const ICON_CALENDAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const ICON_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const ICON_LOCATION = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

function renderEventCard(event) {
  const badge = getStatusBadge(event);
  const canRegister = event.registration_open && event.status === 'upcoming';
  const posterHtml = event.poster_url
    ? `<img class="event-card__poster" src="${event.poster_url}" alt="${event.title}" loading="lazy">`
    : `<div class="event-card__poster event-card__poster--placeholder">Poster Event</div>`;

  return `
    <article class="card event-card">
      ${posterHtml}
      <div class="event-card__body">
        <div class="event-card__meta">
          <span class="event-card__date">${ICON_CALENDAR} ${formatDate(event.event_date)}</span>
          <span class="event-card__time">${ICON_CLOCK} ${formatTime(event.event_time)}</span>
        </div>
        <h3 class="event-card__title">${event.title}</h3>
        <p class="event-card__desc">${event.description}</p>
        <div class="event-card__footer">
          <span class="event-card__location">${ICON_LOCATION} ${event.location}</span>
          <span class="badge ${badge.cls}">${badge.label}</span>
        </div>
        <div style="margin-top: var(--sp-md);">
          <a href="/pages/event-detail.html?slug=${event.slug}" class="btn ${canRegister ? 'btn--primary' : 'btn--secondary'} btn--sm" style="width:100%;">
            ${canRegister ? 'Daftar Event' : 'Lihat Detail'}
          </a>
        </div>
      </div>
    </article>`;
}

export async function loadEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(6);

    if (error) throw error;

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p class="empty-state__text">Belum ada event yang tersedia saat ini.</p>
        </div>`;
      return;
    }

    container.innerHTML = events.map(renderEventCard).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p class="empty-state__text">Tidak dapat memuat event. Silakan coba lagi nanti.</p>
      </div>`;
  }
}
