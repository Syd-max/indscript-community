import { loadEvents } from './events.js?v=2040';
import { initForms } from './forms.js';

function initNavbar() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  const closeBtn = document.getElementById('nav-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

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


// ==========================================
// COMMUNITY ECOSYSTEM
// ==========================================
async function loadCommunityEcosystem() {
  const marquee = document.getElementById('ecosystem-marquee');
  const highlights = document.getElementById('ecosystem-highlights');
  const list = document.getElementById('ecosystem-list');
  const highlightContainer = document.getElementById('highlight-container');
  
  if (!list) return;

  try {
    const { data, error } = await window.supabase
      .from('members')
      .select('*')
      .not('community_name', 'is', null)
      .eq('status', 'approved')
      .order('community_name', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      list.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: var(--c-gray-500);">Belum ada data komunitas.</div>';
      return;
    }

    // Prepare Cards
    const renderCard = (c, isHighlight = false) => {
      const logoHtml = c.logo_url 
        ? `<img src="${c.logo_url}" alt="${c.community_name}" class="ecosystem-card__logo" onerror="this.outerHTML='<div class=\\'ecosystem-card__placeholder\\'>${c.community_name.charAt(0)}</div>'">`
        : `<div class="ecosystem-card__placeholder">${c.community_name.charAt(0)}</div>`;
        
      const relLabel = c.relationship_type === 'strategic_partner' ? 'Mitra Strategis' : c.relationship_type === 'collaboration_partner' ? 'Mitra Kolaborasi' : 'Komunitas Indscript';
      
      return `
        <div class="ecosystem-card" onclick="openEcoModal('${c.id}')">
          ${logoHtml}
          <div class="ecosystem-card__category">${c.category || relLabel}</div>
          <h4 class="ecosystem-card__name">${c.community_name}</h4>
          ${c.domicile ? `<div class="ecosystem-card__region"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${c.domicile}</div>` : ''}
        </div>
      `;
    };

    // Store data globally for modal
    window.ecosystemData = data;

    // Highlights
    const highlightData = data.filter(c => c.is_highlighted);
    if (highlightData.length > 0 && highlights) {
      highlightContainer.style.display = 'block';
      highlights.innerHTML = highlightData.map(c => renderCard(c, true)).join('');
    }

    // All List
    list.innerHTML = data.map(c => renderCard(c, false)).join('');

    // Marquee
    if (marquee) {
      const marqueeData = data.filter(c => c.logo_url);
      if (marqueeData.length > 0) {
        // Duplicate for seamless infinite loop
        const logos = marqueeData.map(c => `<img src="${c.logo_url}" alt="${c.community_name}" style="height: 60px; object-fit: contain; cursor: pointer;" onclick="openEcoModal('${c.id}')" title="${c.community_name}">`).join('');
        marquee.innerHTML = logos + logos;
      } else {
        marquee.parentElement.style.display = 'none';
      }
    }

  } catch (err) {
    console.error('Error loading ecosystem:', err);
    list.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #da3633;">Gagal memuat data ekosistem.</div>';
  }
}

window.openEcoModal = (id) => {
  const c = window.ecosystemData?.find(x => x.id === id);
  if (!c) return;
  
  const relLabel = c.relationship_type === 'strategic_partner' ? 'Mitra Strategis' : c.relationship_type === 'collaboration_partner' ? 'Mitra Kolaborasi' : 'Komunitas Indscript';
  const logoHtml = c.logo_url 
    ? `<img src="${c.logo_url}" alt="${c.community_name}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 12px; margin-bottom: 1rem;">`
    : `<div style="width: 80px; height: 80px; background: var(--c-gray-100); color: var(--c-gray-400); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 1rem; font-size: 2rem;">${c.community_name.charAt(0)}</div>`;

  const html = `
    <div style="text-align: center; margin-bottom: 2rem;">
      ${logoHtml}
      <div style="font-size: 0.875rem; color: var(--c-primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">${c.category || relLabel}</div>
      <h3 style="font-family: var(--ff-heading); font-size: 1.75rem; line-height: 1.2;">${c.community_name}</h3>
    </div>
    
    <div style="background: var(--c-gray-50); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
      <p style="margin: 0; line-height: 1.6; color: var(--c-gray-700);">${c.profile || 'Tidak ada deskripsi profil.'}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
      <div>
        <div style="font-size: 0.75rem; color: var(--c-gray-500); margin-bottom: 0.25rem;">Pemimpin / Pengelola</div>
        <div style="font-weight: 600;">${c.name && c.name !== '-' ? c.name : 'Tidak tersedia'}</div>
      </div>
      <div>
        <div style="font-size: 0.75rem; color: var(--c-gray-500); margin-bottom: 0.25rem;">Jumlah Anggota</div>
        <div style="font-weight: 600;">${c.member_count || 'Tidak tersedia'}</div>
      </div>
      <div>
        <div style="font-size: 0.75rem; color: var(--c-gray-500); margin-bottom: 0.25rem;">Wilayah / Region</div>
        <div style="font-weight: 600;">${c.domicile || 'Tidak tersedia'}</div>
      </div>
      <div>
        <div style="font-size: 0.75rem; color: var(--c-gray-500); margin-bottom: 0.25rem;">Status Hubungan</div>
        <div style="font-weight: 600;">${relLabel}</div>
      </div>
    </div>
    
    <div style="display: flex; gap: 1rem; justify-content: center;">
      ${c.instagram_url ? `<a href="${c.instagram_url}" target="_blank" class="btn btn--outline btn--sm">Instagram</a>` : ''}
      ${c.website_url ? `<a href="${c.website_url}" target="_blank" class="btn btn--outline btn--sm">Website</a>` : ''}
    </div>
  `;
  
  document.getElementById('eco-modal-body').innerHTML = html;
  document.getElementById('eco-modal').style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {
  loadCommunityEcosystem();
});