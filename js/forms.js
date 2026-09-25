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

async function handleFormSubmit(form, tableName, successElId) {
  if (!validateForm(form)) return;

  setFormLoading(form, true);

  try {
    const data = getFormData(form);
    const { error } = await supabase.from(tableName).insert(data);

    if (error) throw error;

    showSuccess(form, successElId);
    showToast('Data berhasil dikirim!', 'success');
  } catch (err) {
    showToast('Gagal mengirim data. Silakan coba lagi.', 'error');
  } finally {
    setFormLoading(form, false);
  }
}

export function initForms() {
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
