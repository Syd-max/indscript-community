import { supabase } from './supabase.js';
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
  
  const highlightContainer = document.getElementById('highlight-container');
  
  

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .not('community_name', 'is', null)
      .eq('status', 'approved')
      .order('community_name', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      if (marquee) marquee.parentElement.style.display = 'none';
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

    

        // Marquee (Swiper)
    if (marquee) {
      if (data.length > 0) {
        marquee.parentElement.style.display = 'block';
        
        const logosHtml = data.map(c => {
          const inner = c.logo_url 
            ? `<img src="${c.logo_url}" alt="${c.community_name}" style="width: 100%; height: 100%; object-fit: contain; padding: 1.5rem;">`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: var(--c-primary); font-family: var(--ff-heading);">${c.community_name.charAt(0)}</div>`;
            
          return `
            <div class="swiper-slide" onclick="openEcoModal('${c.id}')" title="${c.community_name}" style="width: 280px; height: 160px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(0,0,0,0.03); overflow: hidden;">
              ${inner}
            </div>
          `;
        }).join('');
        
        marquee.innerHTML = logosHtml;
        
        // Initialize Swiper
        new Swiper('.ecosystem-swiper', {
          effect: 'coverflow',
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          loop: true,
          coverflowEffect: {
            rotate: 0,
            stretch: 50,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          },
          autoplay: {
            delay: 2500,
            disableOnInteraction: false,
          }
        });
        
      } else {
        marquee.parentElement.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Error loading ecosystem:', err);
    
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
    </div>
    
    <div style="border-top: 1px solid var(--c-gray-200); padding-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      ${c.website_url ? `<a href="${c.website_url}" target="_blank" style="padding: 0.5rem 1rem; background: var(--c-primary); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Website</a>` : ''}
      ${c.instagram_url ? `<a href="${c.instagram_url}" target="_blank" style="padding: 0.5rem 1rem; background: #E1306C; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram</a>` : ''}
      ${c.facebook_url ? `<a href="${c.facebook_url}" target="_blank" style="padding: 0.5rem 1rem; background: #1877F2; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> Facebook</a>` : ''}
      ${c.linkedin_url ? `<a href="${c.linkedin_url}" target="_blank" style="padding: 0.5rem 1rem; background: #0077B5; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn</a>` : ''}
      ${c.youtube_url ? `<a href="${c.youtube_url}" target="_blank" style="padding: 0.5rem 1rem; background: #FF0000; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> YouTube</a>` : ''}
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