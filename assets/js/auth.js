// assets/js/auth.js
// Phase 2: Implement OTP login and JWT handling here.
console.log('auth.js loaded');

import { Api } from './api.js';

export async function requireAuthOrRedirect(loginPath = '/forms/register.html') {
  try {
    const me = await Api.getMe();
    if (!me || me.error) throw new Error('unauth');
    return me;
  } catch (e) {
    window.location.href = loginPath;
  }
}

export async function handleLoginForm(emailInput, requestBtn, otpSection, otpInput, verifyBtn) {
  const noteEl = document.getElementById('emailDomainNote');
  const loader = document.getElementById('authLoading');
  const loaderMsg = document.getElementById('authLoadingMsg');

  // Clear error state as user types
  emailInput.addEventListener('input', () => {
    if (noteEl) noteEl.style.display = 'none';
    emailInput.classList.remove('error');
    emailInput.removeAttribute('aria-invalid');
  });

  requestBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Enter email');
    // Enforce domain restriction
    const allowedDomain = '@chitkara.edu.in';
    if (!email.toLowerCase().endsWith(allowedDomain)) {
      if (noteEl) {
        noteEl.style.display = 'block';
        noteEl.textContent = 'Only Chitkara University email is allowed.';
      }
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.focus();
      return;
    }
    requestBtn.disabled = true;
    emailInput.disabled = true;
    if (loader) {
      loader.style.display = 'flex';
      if (loaderMsg) loaderMsg.textContent = `Sending OTP to ${email}...`;
    }
    try {
      const res = await Api.requestOtp(email);
      if (res && res.ok === false) throw new Error(res?.error?.message || 'Failed to request OTP');
      otpSection.style.display = 'block';
    } catch (err) {
      console.error('Request OTP failed:', err);
      alert(`Could not request OTP. Please try again.\n${err?.message || ''}`);
    } finally {
      requestBtn.disabled = false;
      emailInput.disabled = false;
      if (loader) loader.style.display = 'none';
    }
  });

  // Press Enter in email field triggers Request OTP (only before OTP is shown)
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && otpSection && otpSection.style.display !== 'block') {
      e.preventDefault();
      requestBtn.click();
    }
  });

  verifyBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    if (!otp) return alert('Enter OTP');
    try {
      const res = await Api.verifyOtp(email, otp);
      if (res && res.accessToken) {
        // Decide where to go after login
        try {
          const me = await Api.getMe();
          if (!me.name) return (window.location.href = '/forms/profile.html');
          if (!me.campusId) return (window.location.href = '/forms/campus-select.html');
          window.location.href = '/index.html';
        } catch {
          window.location.href = '/forms/profile.html';
        }
      } else {
        alert(res?.error?.message || 'Failed to verify');
      }
    } catch (err) {
      console.error('Verify OTP failed:', err);
      alert(`Could not verify OTP. Please try again.\n${err?.message || ''}`);
    }
  });
}
