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
  requestBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Enter email');
    await Api.requestOtp(email);
    otpSection.style.display = 'block';
    requestBtn.disabled = true;
  });

  verifyBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    if (!otp) return alert('Enter OTP');
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
  });
}
