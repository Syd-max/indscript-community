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
    await signOut();
    window.location.href = '/pages/admin/login.html';
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
  const [eventsRes, regsRes, membersRes, collabsRes, sponsorsRes] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('collaborations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sponsorships').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  document.getElementById('stat-events').textContent = eventsRes.count || 0;
  document.getElementById('stat-registrations').textContent = regsRes.count || 0;
  document.getElementById('stat-members').textContent = membersRes.count || 0;
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
  });

  btnCancel.addEventListener('click', () => {
    form.style.display = 'none';
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
      await loadEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Error saving event: ' + err.message);
    }
  });
}

async function loadEvents() {
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  currentEvents = data;
  
  const tbody = document.getElementById('events-tbody');
  tbody.innerHTML = data.map(ev => `
    <tr>
      <td>${ev.title}</td>
      <td>${ev.event_date || '-'}</td>
      <td><span style="background: ${ev.status === 'upcoming' || ev.status === 'ongoing' ? '#C1272D' : '#757575'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${ev.status}</span></td>
      <td>${ev.registration_open ? 'Open' : 'Closed'}</td>
      <td>
        <div class="admin-actions">
          <button class="btn btn--outline btn--sm" onclick="window.editEvent('${ev.id}')">Edit</button>
          <button class="btn btn--outline btn--sm" style="color: red; border-color: red;" onclick="window.deleteEvent('${ev.id}')">Delete</button>
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
      <td>${hlText(reg.name, query)}</td>
      <td>${hlText(reg.email, query)}</td>
      <td>${hlText(reg.phone || '-', query)}</td>
      <td>${hlText(reg.institution || '-', query)}</td>
      <td>${formatWIB(reg.registered_at)}</td>
      <td>${reg.checked_in ? 'Yes' : 'No'}</td>
      <td>
        ${!reg.checked_in
          ? `<button class="btn btn--primary btn--sm" onclick="window.checkIn('${reg.id}', '${eventId}')">Check In</button>`
          : `<span style="color:green; font-size:0.85rem; font-weight:500;">Checked In</span>`}
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
  const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  
  const tbody = document.getElementById('members-tbody');
  tbody.innerHTML = data.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.domicile}</td>
      <td>${m.occupation}</td>
      <td>${formatWIB(m.created_at)}</td>
      <td>
        <select onchange="window.updateStatus('members', '${m.id}', this.value)" style="padding:4px;">
          <option value="pending" ${m.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="approved" ${m.status === 'approved' ? 'selected' : ''}>Approved</option>
          <option value="rejected" ${m.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
        <td>
          <button class="btn btn--outline btn--sm" style="color: red; border-color: red;" onclick="window.deleteRecord('members', '${m.id}')">Delete</button>
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
      <td>${c.name}</td>
      <td>${c.organization}</td>
      <td>${c.collaboration_type}</td>
      <td>${c.email}</td>
      <td>${formatWIB(c.created_at)}</td>
      <td>
        <select onchange="window.updateStatus('collaborations', '${c.id}', this.value)" style="padding:4px;">
          <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="reviewed" ${c.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="accepted" ${c.status === 'accepted' ? 'selected' : ''}>Accepted</option>
          <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
        <td>
          <button class="btn btn--outline btn--sm" style="color: red; border-color: red;" onclick="window.deleteRecord('collaborations', '${c.id}')">Delete</button>
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
      <td>${s.pic_name}</td>
      <td>${s.company}</td>
      <td>${s.sponsorship_type}</td>
      <td>${s.email}</td>
      <td>${formatWIB(s.created_at)}</td>
      <td>
        <select onchange="window.updateStatus('sponsorships', '${s.id}', this.value)" style="padding:4px;">
          <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="reviewed" ${s.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="accepted" ${s.status === 'accepted' ? 'selected' : ''}>Accepted</option>
          <option value="rejected" ${s.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
        <td>
          <button class="btn btn--outline btn--sm" style="color: red; border-color: red;" onclick="window.deleteRecord('sponsorships', '${s.id}')">Delete</button>
        </td>
      </tr>
  `).join('');
}

window.updateStatus = async (table, id, newStatus) => {
  if (confirm(`Update status to ${newStatus}?`)) {
    await supabase.from(table).update({ status: newStatus }).eq('id', id);
  }
};

window.deleteRecord = async (table, id) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        const { data, error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
          console.error(error);
          alert("Failed to delete from database: " + error.message);
          return;
        }
        if (table === 'members') await loadMembers();
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
