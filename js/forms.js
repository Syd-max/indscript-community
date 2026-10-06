import { supabase } from './supabase.js';

export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast toast--${type} is-visible`;

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 4000);
}

function validateField(input) {
  const value = input.value.trim();

  if (input.required && !value) {
    return 'Field ini wajib diisi.';
  }

  if (input.type === 'email' && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) return 'Format email tidak valid.';
  }

  if (input.type === 'tel' && value) {
    const phonePattern = /^[\d\s+()-]{8,20}$/;
    if (!phonePattern.test(value)) return 'Format nomor tidak valid.';
  }

  if (input.type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      return 'Format URL tidak valid.';
    }
  }

  return '';
}

function showFieldError(input, message) {
  clearFieldError(input);
  input.classList.add('form-input--error');
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  input.parentElement.appendChild(errorEl);
}

function clearFieldError(input) {
  input.classList.remove('form-input--error');
  const existing = input.parentElement.querySelector('.form-error');
  if (existing) existing.remove();
}

function validateForm(form) {
  const inputs = form.querySelectorAll('.form-input');
  let isValid = true;

  inputs.forEach(input => {
    const error = validateField(input);
    if (error) {
      showFieldError(input, error);
      isValid = false;
    } else {
      clearFieldError(input);
    }
  });

  return isValid;
}

function getFormData(form) {
  const data = {};
  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    if (input.name) {
      data[input.name] = input.value.trim();
    }
  });
  const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
  hiddenInputs.forEach(input => {
    if (input.name && input.value) {
      data[input.name] = input.value.trim();
    }
  });
  return data;
}

function setFormLoading(form, isLoading) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;

  const textEl = btn.querySelector('.btn__text');
  const spinnerEl = btn.querySelector('.btn__spinner');

  btn.disabled = isLoading;

  if (textEl) textEl.style.display = isLoading ? 'none' : '';
  if (spinnerEl) spinnerEl.style.display = isLoading ? 'inline-block' : 'none';
}

function showSuccess(form, successElId) {
  form.style.display = 'none';
  const successEl = document.getElementById(successElId);
  if (successEl) successEl.style.display = 'block';
}


const MAX_PDF_BYTES = 2 * 1024 * 1024;

function initProposalToggle(form) {
  const radios = form.querySelectorAll('input[name="proposal_mode"]');
  if (!radios.length) return;
  const urlInput = form.querySelector('input[name="proposal_url"]');
  const pdfWrap = form.querySelector('.proposal-pdf-wrap');
  const pdfInput = form.querySelector('.proposal-pdf');

  const apply = () => {
    const mode = form.querySelector('input[name="proposal_mode"]:checked').value;
    urlInput.style.display = mode === 'link' ? '' : 'none';
    pdfWrap.style.display = mode === 'pdf' ? '' : 'none';
    if (mode === 'link') { pdfInput.value = ''; clearPdfError(pdfWrap); }
    else { urlInput.value = ''; clearFieldError(urlInput); }
  };
  radios.forEach(r => r.addEventListener('change', apply));

  pdfInput.addEventListener('change', () => {
    clearPdfError(pdfWrap);
    const file = pdfInput.files[0];
    if (!file) return;
    const err = validatePdf(file);
    if (err) {
      pdfInput.value = '';
      showPdfError(pdfWrap, err);
    }
  });
  apply();
}

function validatePdf(file) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'File harus berformat PDF.';
  }
  if (file.size > MAX_PDF_BYTES) {
    return 'File terlalu besar! Ukuran maksimal PDF adalah 2MB.';
  }
  return '';
}

function showPdfError(wrap, message) {
  clearPdfError(wrap);
  const el = document.createElement('div');
  el.className = 'form-error';
  el.textContent = message;
  wrap.appendChild(el);
}

function clearPdfError(wrap) {
  const existing = wrap.querySelector('.form-error');
  if (existing) existing.remove();
}

async function resolveProposalUrl(form, data) {
  const mode = form.querySelector('input[name="proposal_mode"]:checked');
  if (!mode || mode.value !== 'pdf') return;

  const pdfWrap = form.querySelector('.proposal-pdf-wrap');
  const file = form.querySelector('.proposal-pdf').files[0];
  if (!file) {
    const e = new Error('no-file');
    e.userMessage = 'Pilih file PDF terlebih dahulu.';
    throw e;
  }
  const err = validatePdf(file);
  if (err) {
    showPdfError(pdfWrap, err);
    const e = new Error('invalid-pdf');
    e.userMessage = err;
    throw e;
  }

  const path = 'documents/proposals/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.pdf';
  const { error } = await supabase.storage
    .from('community-assets')
    .upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (error) throw error;

  data.proposal_url = supabase.storage.from('community-assets').getPublicUrl(path).data.publicUrl;
}

async function handleFormSubmit(form, tableName, successElId) {
  if (!validateForm(form)) return;

  setFormLoading(form, true);

  try {
    const data = getFormData(form);
    await resolveProposalUrl(form, data);
    const { error } = await supabase.from(tableName).insert(data);

    if (error) throw error;

    showSuccess(form, successElId);
    showToast('Data berhasil dikirim!', 'success');
  } catch (err) {
    showToast((err && err.userMessage) || 'Gagal mengirim data. Silakan coba lagi.', 'error');
  } finally {
    setFormLoading(form, false);
  }
}

export function initForms() {
    document.querySelectorAll('form').forEach(initProposalToggle);
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      const error = validateField(input);
      if (error) {
        showFieldError(input, error);
      } else {
        clearFieldError(input);
      }
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('form-input--error')) {
        clearFieldError(input);
      }
    });
  });
  const memberForm = document.getElementById('membership-form');
  if (memberForm) {
    memberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit(memberForm, 'members', 'membership-success');
    });
  }
  const collabForm = document.getElementById('collaboration-form');
  if (collabForm) {
    collabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit(collabForm, 'collaborations', 'collaboration-success');
    });
  }
  const sponsorForm = document.getElementById('sponsorship-form');
  if (sponsorForm) {
    sponsorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit(sponsorForm, 'sponsorships', 'sponsorship-success');
    });
  }
}

export function initEventRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      const error = validateField(input);
      if (error) showFieldError(input, error);
      else clearFieldError(input);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('form-input--error')) clearFieldError(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form, 'event_registrations', 'registration-success');
  });
}
