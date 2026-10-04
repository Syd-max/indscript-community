import { supabase } from './supabase.js';
import { requireAdmin, signOut } from './auth.js';

function formatWIB(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';
}

let currentEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Authenticate user
  const user = await requireAdmin();
  if (!user) return;

  // 2. Setup logout
    const logoutHandler = async () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      await signOut();
      window.location.href = '/pages/admin/login.html';
    }
  };
  const mainLogout = document.getElementById('logoutBtn');
  if (mainLogout) mainLogout.addEventListener('click', logoutHandler);
  
  const mobileLogout = document.getElementById('mobileLogoutBtn');
  if (mobileLogout) mobileLogout.addEventListener('click', logoutHandler);

  // 3. Setup sidebar navigation
  const sidebarLinks = document.querySelectorAll('.admin-sidebar__link');
  const sections = document.querySelectorAll('.admin-section');
  const adminSidebar = document.querySelector('.admin-sidebar');
  const menuToggle = document.getElementById('adminMenuToggle');
  const overlay = document.getElementById('adminSidebarOverlay');

  if (menuToggle && adminSidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      adminSidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-active');
    });
    overlay.addEventListener('click', () => {
      adminSidebar.classList.remove('is-open');
      overlay.classList.remove('is-active');
    });
  }
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebarLinks.forEach(l => l.classList.remove('is-active'));
      sections.forEach(s => s.classList.remove('is-active'));
      
      link.classList.add('is-active');
      const targetId = link.getAttribute('data-target');
      document.getElementById(targetId).classList.add('is-active');
      
      // Close sidebar on mobile after clicking
      if (adminSidebar) adminSidebar.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-active');

      loadTabData(targetId);
    });
  });

  // Load initial tab
  loadTabData('dashboard');
  setupEventHandlers();
});

async function loadTabData(tab) {
  try {
    switch (tab) {
      case 'dashboard':
        await loadDashboardStats();
        break;
      case 'events':
        await loadEvents();
        break;
      case 'registrations':
        await loadRegistrationEvents();
        break;
      case 'members':
        await loadMembers();
        break;
      case 'collaborations':
        await loadCollaborations();
        break;
      case 'communities':
        await loadCommunities();
        break;
      case 'sponsorships':
        await loadSponsorships();
        break;
    }
  } catch (err) {
    console.error(`Error loading ${tab}:`, err);
  }
}

// ---------------------------
// Dashboard Overview
// ---------------------------
async function loadDashboardStats() {
  const [eventsRes, regsRes, membersRes, collabsRes, sponsorsRes, communitiesRes] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }).is('community_name', null),
    supabase.from('members').select('id', { count: 'exact', head: true }).not('community_name', 'is', null),
    supabase.from('collaborations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sponsorships').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  document.getElementById('stat-events').textContent = eventsRes.count || 0;
  document.getElementById('stat-registrations').textContent = regsRes.count || 0;
  document.getElementById('stat-members').textContent = membersRes.count || 0;
  const statComm = document.getElementById('stat-communities'); if(statComm) statComm.textContent = communitiesRes.count || 0;
  document.getElementById('stat-collaborations').textContent = collabsRes.count || 0;
  document.getElementById('stat-sponsorships').textContent = sponsorsRes.count || 0;
}

// ---------------------------
// Events Management
// ---------------------------

window.switchPosterTab = function(tab) {
  const uploadPanel = document.getElementById('poster-panel-upload');
  const urlPanel = document.getElementById('poster-panel-url');
  const tabUpload = document.getElementById('tab-upload');
  const tabUrl = document.getElementById('tab-url');
  if (tab === 'upload') {
    uploadPanel.style.display = 'block';
    urlPanel.style.display = 'none';
    tabUpload.style.background = '#C1272D';
    tabUpload.style.color = '#fff';
    tabUpload.style.borderColor = '#C1272D';
    tabUrl.style.background = '#fff';
    tabUrl.style.color = '#555';
    tabUrl.style.borderColor = '#ccc';
  } else {
    uploadPanel.style.display = 'none';
    urlPanel.style.display = 'block';
    tabUpload.style.background = '#fff';
    tabUpload.style.color = '#555';
    tabUpload.style.borderColor = '#ccc';
    tabUrl.style.background = '#C1272D';
    tabUrl.style.color = '#fff';
    tabUrl.style.borderColor = '#C1272D';
  }
};

window.previewPoster = function(url) {
  const preview = document.getElementById('poster-preview');
  const img = document.getElementById('poster-preview-img');
  const err = document.getElementById('poster-error');
  const finalField = document.getElementById('event-poster-url-final');
  if (url && url.startsWith('http')) {
    if (preview) preview.style.display = 'block';
    if (img) img.src = url;
    if (err) err.style.display = 'none';
    if (finalField) finalField.value = url;
  } else {
    if (preview) preview.style.display = 'none';
    if (finalField) finalField.value = '';
  }
};

window.handlePosterUpload = async function(input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById('poster-upload-status');
  const preview = document.getElementById('poster-preview');
  const img = document.getElementById('poster-preview-img');
  const finalField = document.getElementById('event-poster-url-final');

  statusEl.innerHTML = '<span style="color:#888;">? Mengupload...</span>';

  const ext = file.name.split('.').pop();
  const fileName = 'event-posters/' + Date.now() + '.' + ext;

  const { data, error } = await supabase.storage
    .from('community-assets')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (error) {
    statusEl.innerHTML = '<span style="color:red;">? Upload gagal: ' + error.message + '</span>';
    return;
  }

  const { data: urlData } = supabase.storage.from('community-assets').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  if (finalField) finalField.value = publicUrl;
  if (preview) preview.style.display = 'block';
  if (img) img.src = publicUrl;
  statusEl.innerHTML = '<span style="color:green;">? Upload berhasil!</span>';
};

function setupEventHandlers() {
  const form = document.getElementById('event-form');
  const btnCreate = document.getElementById('btn-create-event');
  const btnCancel = document.getElementById('btn-cancel-event');
  const titleInput = document.getElementById('event-title');
  const slugInput = document.getElementById('event-slug');

  btnCreate.addEventListener('click', () => {
    form.reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-form-title').textContent = 'Create Event';
    form.style.display = 'block';
    
    const eventsTable = document.querySelector('#events .admin-table-wrapper');
    if (eventsTable) eventsTable.style.display = 'none';
  });

  btnCancel.addEventListener('click', () => {
    form.style.display = 'none';
    const eventsTable = document.querySelector('#events .admin-table-wrapper');
    if (eventsTable) eventsTable.style.display = 'block';
  });

  titleInput.addEventListener('input', () => {
    if (!document.getElementById('event-id').value) { 
      slugInput.value = titleInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    
    const data = {
      title: titleInput.value,
      slug: slugInput.value,
      description: document.getElementById('event-description').value,
      event_date: document.getElementById('event-date').value,
      event_time: document.getElementById('event-time').value,
      location: document.getElementById('event-location').value,
      status: document.getElementById('event-status').value,
      registration_open: document.getElementById('event-registration-open').checked,
      poster_url: document.getElementById('event-poster-url-final') && document.getElementById('event-poster-url-final').value ? document.getElementById('event-poster-url-final').value : (document.getElementById('event-poster') ? document.getElementById('event-poster').value : '')
    };

    try {
      if (id) {
        await supabase.from('events').update(data).eq('id', id);
      } else {
        await supabase.from('events').insert([data]);
      }
      form.style.display = 'none';
      const eventsTable = document.querySelector('#events .admin-table-wrapper');
      if (eventsTable) eventsTable.style.display = 'block';
      await loadEvents();
    } catch (err) {
        console.error('Error saving event:', err);
        alert('Error saving event: ' + err.message);
      }
    });

    const commSearch = document.getElementById('community-search');
    if (commSearch) commSearch.addEventListener('input', () => loadCommunities());

    const commStatus = document.getElementById('community-filter-status');
    if (commStatus) commStatus.addEventListener('change', () => loadCommunities());

    const commCat = document.getElementById('community-filter-category');
    if (commCat) commCat.addEventListener('change', () => loadCommunities());
  }

async function loadEvents() {
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  currentEvents = data;
  
  const tbody = document.getElementById('events-tbody');
  tbody.innerHTML = data.map(ev => `
    <tr>
      <td data-label="Title">${ev.title}</td>
      <td data-label="Date">${ev.event_date || '-'}</td>
      <td data-label="Status"><span style="background: ${ev.status === 'upcoming' || ev.status === 'ongoing' ? '#C1272D' : '#757575'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${ev.status}</span></td>
      <td data-label="Registration">${ev.registration_open ? 'Open' : 'Closed'}</td>
      <td data-label="Actions">
        <div class="admin-actions" style="flex-wrap: nowrap; gap: 4px;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="event.stopPropagation(); window.showRowDetails(this)">Detail</button>
          <button class="btn btn--sm" style="background: #ffc107; color: black; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.editEvent('${ev.id}')">Edit</button>
          <button class="btn btn--sm" style="background: #da3633; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.deleteEvent('${ev.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.editEvent = (id) => {
  const ev = currentEvents.find(e => e.id === id);
  if (!ev) return;
  
  document.getElementById('event-id').value = ev.id;
  document.getElementById('event-title').value = ev.title;
  document.getElementById('event-slug').value = ev.slug;
  document.getElementById('event-description').value = ev.description || '';
  document.getElementById('event-date').value = ev.event_date || '';
  document.getElementById('event-time').value = ev.event_time || '';
  document.getElementById('event-location').value = ev.location || '';
  document.getElementById('event-status').value = ev.status || 'upcoming';
  document.getElementById('event-registration-open').checked = ev.registration_open || false;
  document.getElementById('event-poster-url-final').value = ev.poster_url || '';
  if (ev.poster_url) {
    // Switch to URL tab and show current
    window.switchPosterTab('url');
    const el = document.getElementById('event-poster');
    if (el) el.value = ev.poster_url;
    window.previewPoster(ev.poster_url);
  }
  
  document.getElementById('event-form-title').textContent = 'Edit Event';
  document.getElementById('event-form').style.display = 'block';
  
  const eventsTable = document.querySelector('#events .admin-table-wrapper');
  if (eventsTable) eventsTable.style.display = 'none';
  
  document.getElementById('event-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteEvent = async (id) => {
  if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    try {
      await supabase.from('events').delete().eq('id', id);
      await loadEvents();
    } catch(err) {
      alert("Could not delete event.");
    }
  }
};

// ---------------------------
// Registrations
// ---------------------------
async function loadRegistrationEvents() {
  const { data, error } = await supabase.from('events').select('id, title').order('created_at', { ascending: false });
  if (error) throw error;
  
  const select = document.getElementById('filter-event');
  select.innerHTML = '<option value="">Select Event...</option>' + data.map(ev => `
    <option value="${ev.id}">${ev.title}</option>
  `).join('');
  
  select.onchange = () => {
    if (select.value) loadRegistrations(select.value);
    else document.getElementById('registrations-tbody').innerHTML = '';
  };
}

let _currentRegsData = [];
let _currentRegsEventId = '';

async function loadRegistrations(eventId) {
  const { data, error } = await supabase.from('event_registrations').select('*').eq('event_id', eventId).order('registered_at', { ascending: false });
  if (error) throw error;

  _currentRegsData = data;
  _currentRegsEventId = eventId;

  const searchEl = document.getElementById('reg-search');
  if (searchEl) searchEl.value = '';

  renderRegistrations(data, eventId, '');
}

function hlText(text, query) {
  if (!query) return String(text || '');
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text || '').replace(new RegExp('(' + safe + ')', 'gi'), '<mark style="background:#FFE082;border-radius:3px;padding:0 2px;">$1</mark>');
}

function renderRegistrations(data, eventId, query) {
  const q = (query || '').toLowerCase().trim();
  const allData = _currentRegsData || data;
  const checkedIn = allData.filter(r => r.checked_in).length;
  const total = allData.length;

  const countEl = document.getElementById('reg-counts');
  if (q) {
    const found = data.filter(r =>
      (r.name||'').toLowerCase().includes(q) ||
      (r.email||'').toLowerCase().includes(q) ||
      (r.phone||'').toLowerCase().includes(q) ||
      (r.institution||'').toLowerCase().includes(q)
    ).length;
    countEl.textContent = `Total: ${total} | Checked In: ${checkedIn} | Ditemukan: ${found}`;
  } else {
    countEl.textContent = `Total: ${total} | Checked In: ${checkedIn}`;
  }

  const tbody = document.getElementById('registrations-tbody');
  tbody.innerHTML = data.map(reg => {
    const isMatch = q && (
      (reg.name||'').toLowerCase().includes(q) ||
      (reg.email||'').toLowerCase().includes(q) ||
      (reg.phone||'').toLowerCase().includes(q) ||
      (reg.institution||'').toLowerCase().includes(q)
    );
    const rowStyle = isMatch
      ? 'background:#FFF8E1; outline:2px solid #FFB300;'
      : (q ? 'opacity:0.4;' : '');
    return `
    <tr style="${rowStyle}">
      <td data-label="Name">${hlText(reg.name, query)}</td>
      <td data-label="Email">${hlText(reg.email, query)}</td>
      <td data-label="Phone">${hlText(reg.phone || '-', query)}</td>
      <td data-label="Institution">${hlText(reg.institution || '-', query)}</td>
      <td data-label="Registered At">${formatWIB(reg.registered_at)}</td>
      <td data-label="Checked In">${reg.checked_in ? 'Yes' : 'No'}</td>
      <td data-label="Actions">
        <div class="admin-actions" style="flex-wrap: nowrap; gap: 4px;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="event.stopPropagation(); window.showRowDetails(this)">Detail</button>
          ${!reg.checked_in
            ? `<button class="btn btn--sm" style="background: #007bff; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.checkIn('${reg.id}', '${eventId}')">Check In</button>`
            : `<span style="color:green; font-size:0.85rem; font-weight:500;">Checked In</span>`}
        </div>
      </td>
    </tr>`;
  }).join('');
}

window.checkIn = async (regId, eventId) => {
  if (confirm('Confirm participant check-in?')) {
    await supabase.from('event_registrations').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', regId);
    await loadRegistrations(eventId);
  }
};

async function loadMembers() {
  const { data, error } = await supabase.from('members').select('*').is('community_name', null).order('created_at', { ascending: false });
  if (error) throw error;
  
  const tbody = document.getElementById('members-tbody');
  tbody.innerHTML = data.map(m => `
    <tr>
      <td data-label="Name">${m.name}</td>
      <td data-label="Email">${m.email}</td>
      <td data-label="Phone">${m.phone}</td>
      <td data-label="Domicile">${m.domicile}</td>
      <td data-label="Occupation">${m.occupation}</td>
      <td data-label="Interest" class="hide-col">${m.interest || '-'}</td>
      <td data-label="Reason" class="hide-col">${m.reason || '-'}</td>
      <td data-label="Date">${formatWIB(m.created_at)}</td>
      <td data-label="Status">
        <select onchange="window.updateStatus('members', '${m.id}', this.value)" style="padding:4px;">
          <option value="pending" ${m.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="approved" ${m.status === 'approved' ? 'selected' : ''}>Approved</option>
          <option value="rejected" ${m.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td data-label="Actions">
        <div class="admin-actions" style="flex-wrap: nowrap; gap: 4px;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="event.stopPropagation(); window.showRowDetails(this)">Detail</button>
          <button class="btn btn--sm" style="background: #da3633; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.deleteRecord('members', '${m.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadCollaborations() {
  const { data, error } = await supabase.from('collaborations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  
  const tbody = document.getElementById('collaborations-tbody');
  tbody.innerHTML = data.map(c => `
    <tr>
      <td data-label="Name">${c.name}</td>
      <td data-label="Organization">${c.organization}</td>
      <td data-label="Type">${c.collaboration_type}</td>
      <td data-label="Email">${c.email}</td>
      <td data-label="WhatsApp" class="hide-col">${c.phone || '-'}</td>
      <td data-label="Description" class="hide-col">${c.description || '-'}</td>
      <td data-label="Link" class="hide-col">${c.proposal_url ? `<a href="${c.proposal_url}" target="_blank" style="color:var(--c-primary);text-decoration:underline;">View Link</a>` : '-'}</td>
      <td data-label="Date">${formatWIB(c.created_at)}</td>
      <td data-label="Status">
        <select onchange="window.updateStatus('collaborations', '${c.id}', this.value)" style="padding:4px;">
          <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="reviewed" ${c.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="accepted" ${c.status === 'accepted' ? 'selected' : ''}>Accepted</option>
          <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td data-label="Actions">
        <div class="admin-actions" style="flex-wrap: nowrap; gap: 4px;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="event.stopPropagation(); window.showRowDetails(this)">Detail</button>
          <button class="btn btn--sm" style="background: #da3633; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.deleteRecord('collaborations', '${c.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadSponsorships() {
  const { data, error } = await supabase.from('sponsorships').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  
  const tbody = document.getElementById('sponsorships-tbody');
  tbody.innerHTML = data.map(s => `
    <tr>
      <td data-label="PIC Name">${s.pic_name}</td>
      <td data-label="Company">${s.company}</td>
      <td data-label="Type">${s.sponsorship_type}</td>
      <td data-label="Email">${s.email}</td>
      <td data-label="WhatsApp" class="hide-col">${s.phone || '-'}</td>
      <td data-label="Message" class="hide-col">${s.message || '-'}</td>
      <td data-label="Link" class="hide-col">${s.proposal_url ? `<a href="${s.proposal_url}" target="_blank" style="color:var(--c-primary);text-decoration:underline;">View Link</a>` : '-'}</td>
      <td data-label="Date">${formatWIB(s.created_at)}</td>
      <td data-label="Status">
        <select onchange="window.updateStatus('sponsorships', '${s.id}', this.value)" style="padding:4px;">
          <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="reviewed" ${s.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="accepted" ${s.status === 'accepted' ? 'selected' : ''}>Accepted</option>
          <option value="rejected" ${s.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td data-label="Actions">
        <div class="admin-actions" style="flex-wrap: nowrap; gap: 4px;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="event.stopPropagation(); window.showRowDetails(this)">Detail</button>
          <button class="btn btn--sm" style="background: #da3633; color: white; border: none; padding: 4px 8px; font-weight: 500;" onclick="window.deleteRecord('sponsorships', '${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.updateStatus = async (table, id, newStatus) => {
    if (confirm(`Update status to ${newStatus}?`)) {
      try {
        const { error: updateError } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
          if (updateError) throw new Error('Update failed: ' + updateError.message);
        
        // If accepting collab/sponsor, automatically insert to ecosystem (members)
        if (newStatus === 'accepted' && (table === 'collaborations' || table === 'sponsorships')) {
          const { data: sourceData } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
          if (sourceData) {
            const memberPayload = {
              status: 'approved',
              community_name: table === 'collaborations' ? sourceData.organization : sourceData.company,
              name: table === 'collaborations' ? sourceData.name : sourceData.pic_name,
              email: sourceData.email,
              phone: sourceData.phone,
                domicile: '-',
                occupation: '-',
                interest: '-',
                reason: '-',
                relationship_type: table === 'collaborations' ? 'collaboration_partner' : 'strategic_partner'
            };
            
            if (memberPayload.community_name) {
              const { data: existing } = await supabase.from('members')
                .select('id')
                .eq('community_name', memberPayload.community_name)
                .maybeSingle();
                
              if (!existing) {
                  const res = await supabase.from('members').insert([memberPayload]);
                  if (res.error) {
                    console.error("Insert error:", res.error);
                    alert("Gagal memindahkan data ke ecosystem: " + res.error.message);
                  } else {
                    alert("Berhasil! Data otomatis dimasukkan ke Community Ecosystem.");
                    await loadCommunities();
                  }
                }
            }
          }
        }
        
        if (table === 'members') await loadMembers();
      else if (table === 'communities') await loadCommunities();
      else if (table === 'collaborations') await loadCollaborations();
      else if (table === 'sponsorships') await loadSponsorships();
      
      if (typeof loadDashboardStats === 'function') await loadDashboardStats();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  } else {
    // Revert visual change on cancel
    if (table === 'members') await loadMembers();
      else if (table === 'communities') await loadCommunities();
    else if (table === 'collaborations') await loadCollaborations();
    else if (table === 'sponsorships') await loadSponsorships();
  }
};

window.deleteRecord = async (table, id) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        const dbTable = table === 'communities' ? 'members' : table;
        const { data, error } = await supabase.from(dbTable).delete().eq('id', id);
        if (error) {
          console.error(error);
          alert("Failed to delete from database: " + error.message);
          return;
        }
        if (table === 'members') await loadMembers();
        else if (table === 'communities') await loadCommunities();
        else if (table === 'collaborations') await loadCollaborations();
        else if (table === 'sponsorships') await loadSponsorships();
        
        if (typeof loadDashboardStats === 'function') await loadDashboardStats();
      } catch (err) {
        alert("Error deleting record: " + err.message);
      }
    }
  };
window.filterRegistrations = function() {
    const query = document.getElementById('reg-search')?.value || '';
    renderRegistrations(_currentRegsData, _currentRegsEventId, query);
  };

  window.showRowDetails = function(btn) {
    const tr = btn.closest('tr');
    const tds = tr.querySelectorAll('td');
    let html = '';
    let title = 'Detail Data';
    
    tds.forEach((td, index) => {
      const label = td.getAttribute('data-label');
      // Skip actions since they are already in the card
      if (!label || label === 'Actions') return;
      
      // Use the first column as the modal title
      if (index === 0) {
        title = td.textContent;
      }
      
      // Preserve HTML for status badges/selects and links, otherwise use text
      const val = (label === 'Status' || label === 'Checked In' || label === 'Registration' || label === 'Link') 
                  ? td.innerHTML 
                  : td.textContent;
                  
      html += `
        <div class="modal-detail-row">
          <div class="modal-detail-label">${label}</div>
          <div class="modal-detail-value">${val}</div>
        </div>
      `;
    });
    
    document.getElementById('detailModalTitle').textContent = title;
    document.getElementById('detailModalBody').innerHTML = html;
    document.getElementById('detailModal').style.display = 'flex';
  };

window.exportToCSV = async (table) => {
    try {
      const sortCol = table === 'event_registrations' ? 'registered_at' : 'created_at';
        const { data, error } = await supabase.from(table).select('*').order(sortCol, { ascending: false });
      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
      }
      
      const headers = Object.keys(data[0]);
      
      let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      html += '<head><meta charset="utf-8"></head><body>';
      html += '<table border="1"><thead><tr>';
      
            headers.forEach(header => {
        html += '<th style="background-color: #C1272D; color: white; font-weight: bold; padding: 8px;">' + header.toUpperCase() + '</th>';
      });
      html += '</tr></thead><tbody>';
      
            data.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
          let val = row[header];
            if ((header === 'created_at' || header === 'registered_at' || header === 'updated_at') && val) {
              val = formatWIB(val);
            } else {
              val = val === null || val === undefined ? '' : String(val);
            }
          html += '<td style="padding: 4px;">' + val + '</td>';
        });
        html += '</tr>';
      });
      
      html += '</tbody></table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", table + '_export_' + new Date().toISOString().split('T')[0] + '.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error exporting data: " + err.message);
    }
  };


async function loadCommunities() {
  const searchTerm = document.getElementById('community-search')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('community-filter-status')?.value || '';
  const catFilter = document.getElementById('community-filter-category')?.value || '';

  // Get ALL data first to populate the category dropdown dynamically
  const { data, error } = await supabase.from('members').select('*').not('community_name', 'is', null).order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading communities:', error);
    return;
  }
  
  // Populate category filter dropdown dynamically if it's currently empty (or has only "All Categories")
  const catSelect = document.getElementById('community-filter-category');
  if (catSelect && catSelect.options.length <= 1) {
    const uniqueCategories = [...new Set(data.map(c => c.category).filter(Boolean))].sort();
    uniqueCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      catSelect.appendChild(option);
    });
  }

  const filteredData = data.filter(c => {
    // 1. Filter by Search
    const matchSearch = !searchTerm || (c.community_name && c.community_name.toLowerCase().includes(searchTerm)) || (c.category && c.category.toLowerCase().includes(searchTerm));
    // 2. Filter by Status
    const matchStatus = !statusFilter || c.status === statusFilter;
    // 3. Filter by Category
    const matchCategory = !catFilter || c.category === catFilter;
    
    return matchSearch && matchStatus && matchCategory;
  });

  const tbody = document.getElementById('communities-tbody');
  if(!tbody) return;
  tbody.innerHTML = filteredData.map(c => `
    <tr>
      <td>${c.logo_url ? `<img src="${c.logo_url}" style="height:32px; border-radius:4px;">` : '-'}</td>
      <td>
        <div style="font-weight: 600;">${c.community_name || '-'}</div>
        <div style="font-size: 0.75rem; color: #666;">${c.domicile || '-'}</div>
      </td>
      <td>${c.category || '-'}</td>
      <td>${c.name || '-'}</td>
      <td>${c.relationship_type === 'community_under_indscript' ? 'Under Indscript' : c.relationship_type === 'strategic_partner' ? 'Strategic' : 'Collaboration'}</td>
      <td>
        <input type="checkbox" onchange="window.toggleHighlight('${c.id}', this.checked)" ${c.is_highlighted ? 'checked' : ''}>
      </td>
      <td>
        <select onchange="window.updateStatus('members', '${c.id}', this.value)" style="padding:4px;">
          <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="approved" ${c.status === 'approved' ? 'selected' : ''}>Approved</option>
          <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn--sm" style="background: #2ea043; color: white; border: none; padding: 4px 8px;" onclick="window.editCommunity('${c.id}')">Edit</button>
          <button class="btn btn--sm" style="background: #da3633; color: white; border: none; padding: 4px 8px;" onclick="window.deleteRecord('communities', '${c.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.toggleHighlight = async (id, isHighlighted) => {
  const { error } = await supabase.from('members').update({ is_highlighted: isHighlighted }).eq('id', id);
  if (error) alert('Error updating highlight');
  else await loadCommunities();
};

window.editCommunity = async (id) => {
  const { data, error } = await supabase.from('members').select('*').eq('id', id).maybeSingle();
  if (error || !data) return alert('Error fetching data');
  
  const formHtml = `
    <input type="hidden" id="edit-comm-id" value="${data.id}">
    <div><label>Community Name</label><input type="text" id="edit-comm-name" value="${data.community_name || ''}" class="form-input"></div>
    <div><label>Category</label><input type="text" id="edit-comm-category" value="${data.category || ''}" class="form-input"></div>
    <div><label>Profile</label><textarea id="edit-comm-profile" class="form-input">${data.profile || ''}</textarea></div>
    <div><label>Leader/Management (Name)</label><input type="text" id="edit-comm-leader" value="${data.name || ''}" class="form-input"></div>
    <div><label>Member Count</label><input type="text" id="edit-comm-count" value="${data.member_count || ''}" class="form-input"></div>
    <div><label>Region</label><input type="text" id="edit-comm-region" value="${data.domicile || ''}" class="form-input"></div>
    
    <div style="margin-top: 1rem; border: 1px solid #eee; padding: 1rem; border-radius: 8px;">
      <label style="font-weight: bold; margin-bottom: 0.5rem; display: block;">Logo</label>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <input type="text" id="edit-comm-logo" value="${data.logo_url || ''}" class="form-input" placeholder="Masukkan Logo URL / Base64">
      </div>
      <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">Atau upload file (Otomatis Base64):</p>
      <input type="file" id="edit-comm-logo-file" accept="image/*" class="form-input" style="padding: 0.25rem;">
    </div>

    <div style="margin-top: 1rem; border: 1px solid #eee; padding: 1rem; border-radius: 8px;">
      <label style="font-weight: bold; margin-bottom: 0.5rem; display: block;">Social Media Links</label>
      
      <input type="hidden" id="edit-comm-ig" value="${data.instagram_url || ''}">
      <input type="hidden" id="edit-comm-fb" value="${data.facebook_url || ''}">
      <input type="hidden" id="edit-comm-yt" value="${data.youtube_url || ''}">
      <input type="hidden" id="edit-comm-li" value="${data.linkedin_url || ''}">
      <input type="hidden" id="edit-comm-tt" value="${data.tiktok_url || ''}">
      <input type="hidden" id="edit-comm-tw" value="${data.twitter_url || ''}">
      <input type="hidden" id="edit-comm-web" value="${data.website_url || ''}">
      
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <select id="socmed-selector" class="form-input" style="width: 120px;">
          <option value="ig">Instagram</option>
          <option value="fb">Facebook</option>
          <option value="yt">YouTube</option>
          <option value="li">LinkedIn</option>
          <option value="tt">TikTok</option>
          <option value="tw">Twitter</option>
          <option value="web">Website</option>
        </select>
        <input type="text" id="socmed-input" class="form-input" placeholder="Masukkan URL disini...">
        <button type="button" id="socmed-add-btn" class="btn btn--primary btn--sm">Add</button>
      </div>
      <div id="socmed-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
      </div>
    </div>
  `;
  document.getElementById('community-modal-form').innerHTML = formHtml;
  document.getElementById('community-modal').style.display = 'flex';

  setTimeout(() => {
    const fileInput = document.getElementById('edit-comm-logo-file');
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => { document.getElementById('edit-comm-logo').value = e.target.result; };
          reader.readAsDataURL(file);
        }
      });
    }

    window.renderSocmeds = () => {
      const list = document.getElementById('socmed-list');
      if (!list) return;
      const platforms = {
        ig: { label: 'Instagram', color: '#E1306C' }, fb: { label: 'Facebook', color: '#1877F2' },
        yt: { label: 'YouTube', color: '#FF0000' }, li: { label: 'LinkedIn', color: '#0077B5' },
        tt: { label: 'TikTok', color: '#000000' }, tw: { label: 'Twitter', color: '#1DA1F2' },
        web: { label: 'Website', color: 'var(--c-primary)' }
      };
      
      let html = '';
      Object.keys(platforms).forEach(key => {
        const inputEl = document.getElementById('edit-comm-' + key);
        if (inputEl && inputEl.value) {
          html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee;">
              <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                <span style="background: ${platforms[key].color}; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; width: 80px; text-align: center;">${platforms[key].label}</span>
                <span style="font-size: 0.8rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${inputEl.value}</span>
              </div>
              <button type="button" class="socmed-remove-btn" onclick="document.getElementById('edit-comm-${key}').value=''; window.renderSocmeds();" style="background: none; border: none; color: #dc2626; cursor: pointer; font-weight: bold;">✕</button>
            </div>
          `;
        }
      });
      list.innerHTML = html;
    };
    
    const addBtn = document.getElementById('socmed-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const sel = document.getElementById('socmed-selector').value;
        const inp = document.getElementById('socmed-input').value;
        if (inp) {
          document.getElementById('edit-comm-' + sel).value = inp;
          document.getElementById('socmed-input').value = '';
          window.renderSocmeds();
        }
      });
    }
    
    window.renderSocmeds();
  }, 100);
};

document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'save-community-btn') {
      const id = document.getElementById('edit-comm-id').value;
      const payload = {
        community_name: document.getElementById('edit-comm-name').value,
        category: document.getElementById('edit-comm-category').value,
        profile: document.getElementById('edit-comm-profile').value,
        name: document.getElementById('edit-comm-leader').value,
        member_count: document.getElementById('edit-comm-count').value,
        domicile: document.getElementById('edit-comm-region').value,
        logo_url: document.getElementById('edit-comm-logo').value,
        instagram_url: document.getElementById('edit-comm-ig').value,
        facebook_url: document.getElementById('edit-comm-fb').value,
        youtube_url: document.getElementById('edit-comm-yt').value,
        linkedin_url: document.getElementById('edit-comm-li').value,
        tiktok_url: document.getElementById('edit-comm-tt').value,
        twitter_url: document.getElementById('edit-comm-tw').value,
        website_url: document.getElementById('edit-comm-web').value,
        updated_at: new Date().toISOString()
      };
      
      let error;
      if (id && id !== 'new') {
        const res = await supabase.from('members').update(payload).eq('id', id);
        error = res.error;
      } else {
        payload.status = 'approved'; 
          payload.relationship_type = 'strategic_partner';
          if (!payload.domicile) payload.domicile = '-';
          payload.email = '-';
          payload.phone = '-';
          payload.occupation = '-';
          payload.interest = '-';
          payload.reason = '-';
          const res = await supabase.from('members').insert([payload]);
        error = res.error;
      }
      
      if (error) alert('Failed to save community: ' + error.message);
      else {
        document.getElementById('community-modal').style.display = 'none';
        await loadCommunities();
      }
    }
});

window.openAddCommunityModal = () => {
    // Generate an empty data object
    const data = { id: 'new', community_name: '', category: '', profile: '', name: '', member_count: '', domicile: '', logo_url: '', instagram_url: '', facebook_url: '', youtube_url: '', linkedin_url: '', tiktok_url: '', twitter_url: '', website_url: '' };
    
    // We can literally just call editCommunity but with a mock id?
    // No, editCommunity fetches from DB. We need to duplicate the HTML generation.
    const formHtml = `
      <input type="hidden" id="edit-comm-id" value="new">
      <div><label>Community Name</label><input type="text" id="edit-comm-name" value="" class="form-input"></div>
      <div><label>Category</label><input type="text" id="edit-comm-category" value="" class="form-input"></div>
      <div><label>Profile</label><textarea id="edit-comm-profile" class="form-input"></textarea></div>
      <div><label>Leader/Management (Name)</label><input type="text" id="edit-comm-leader" value="" class="form-input"></div>
      <div><label>Member Count</label><input type="text" id="edit-comm-count" value="" class="form-input"></div>
      <div><label>Region</label><input type="text" id="edit-comm-region" value="" class="form-input"></div>
      
      <div style="margin-top: 1rem; border: 1px solid #eee; padding: 1rem; border-radius: 8px;">
        <label style="font-weight: bold; margin-bottom: 0.5rem; display: block;">Logo</label>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <input type="text" id="edit-comm-logo" value="" class="form-input" placeholder="Masukkan Logo URL / Base64">
        </div>
        <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.5rem;">Atau upload file (Otomatis Base64):</p>
        <input type="file" id="edit-comm-logo-file" accept="image/*" class="form-input" style="padding: 0.25rem;">
      </div>
  
      <div style="margin-top: 1rem; border: 1px solid #eee; padding: 1rem; border-radius: 8px;">
        <label style="font-weight: bold; margin-bottom: 0.5rem; display: block;">Social Media Links</label>
        
        <input type="hidden" id="edit-comm-ig" value="">
        <input type="hidden" id="edit-comm-fb" value="">
        <input type="hidden" id="edit-comm-yt" value="">
        <input type="hidden" id="edit-comm-li" value="">
        <input type="hidden" id="edit-comm-tt" value="">
        <input type="hidden" id="edit-comm-tw" value="">
        <input type="hidden" id="edit-comm-web" value="">
        
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <select id="socmed-selector" class="form-input" style="width: 120px;">
            <option value="ig">Instagram</option>
            <option value="fb">Facebook</option>
            <option value="yt">YouTube</option>
            <option value="li">LinkedIn</option>
            <option value="tt">TikTok</option>
            <option value="tw">Twitter</option>
            <option value="web">Website</option>
          </select>
          <input type="text" id="socmed-input" class="form-input" placeholder="Masukkan URL disini...">
          <button type="button" id="socmed-add-btn" class="btn btn--primary btn--sm">Add</button>
        </div>
        <div id="socmed-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
        </div>
      </div>
    `;
    
    document.getElementById('community-modal-form').innerHTML = formHtml;
    document.getElementById('community-modal').style.display = 'flex';
  
    setTimeout(() => {
      const fileInput = document.getElementById('edit-comm-logo-file');
      if (fileInput) {
        fileInput.addEventListener('change', function() {
          const file = this.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { document.getElementById('edit-comm-logo').value = e.target.result; };
            reader.readAsDataURL(file);
          }
        });
      }
  
      window.renderSocmeds = () => {
        const list = document.getElementById('socmed-list');
        if (!list) return;
        const platforms = {
          ig: { label: 'Instagram', color: '#E1306C' }, fb: { label: 'Facebook', color: '#1877F2' },
          yt: { label: 'YouTube', color: '#FF0000' }, li: { label: 'LinkedIn', color: '#0077B5' },
          tt: { label: 'TikTok', color: '#000000' }, tw: { label: 'Twitter', color: '#1DA1F2' },
          web: { label: 'Website', color: 'var(--c-primary)' }
        };
        
        let html = '';
        Object.keys(platforms).forEach(key => {
          const inputEl = document.getElementById('edit-comm-' + key);
          if (inputEl && inputEl.value) {
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee;">
                <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                  <span style="background: ${platforms[key].color}; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; width: 80px; text-align: center;">${platforms[key].label}</span>
                  <span style="font-size: 0.8rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${inputEl.value}</span>
                </div>
                <button type="button" class="socmed-remove-btn" onclick="document.getElementById('edit-comm-${key}').value=''; window.renderSocmeds();" style="background: none; border: none; color: #dc2626; cursor: pointer; font-weight: bold;">❌</button>
              </div>
            `;
          }
        });
        list.innerHTML = html;
      };
      
      const addBtn = document.getElementById('socmed-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const sel = document.getElementById('socmed-selector').value;
          const inp = document.getElementById('socmed-input').value;
          if (inp) {
            document.getElementById('edit-comm-' + sel).value = inp;
            document.getElementById('socmed-input').value = '';
            window.renderSocmeds();
          }
        });
      }
      
      window.renderSocmeds();
    }, 100);
};

