// assets/js/auth.js
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

export function handlePasswordAuth({ emailInput, passwordInput, loginBtn, registerBtn }) {
  const noteEl = document.getElementById('emailDomainNote');
  const loader = document.getElementById('authLoading');
  const loaderMsg = document.getElementById('authLoadingMsg');

  const validate = () => {
    const email = (emailInput.value || '').trim();
    const allowedDomain = '@chitkara.edu.in';
    if (!email) return 'Enter email';
    if (!email.toLowerCase().endsWith(allowedDomain)) return 'Only Chitkara University email is allowed.';
    if (!passwordInput.value) return 'Enter password';
    return null;
  };

  const onDone = async () => {
    try {
      const me = await Api.getMe();
      if (!me.name) return (window.location.href = '/forms/profile.html');
      if (!me.campusId) return (window.location.href = '/forms/campus-select.html');
      window.location.href = '/index.html';
    } catch {
      window.location.href = '/forms/profile.html';
    }
  };

  const withUi = async (fn, msg) => {
    loginBtn.disabled = true;
    registerBtn && (registerBtn.disabled = true);
    emailInput.disabled = true;
    passwordInput.disabled = true;
    if (loader) {
      loader.style.display = 'flex';
      if (loaderMsg) loaderMsg.textContent = msg;
    }
    try {
      await fn();
      await onDone();
    } catch (err) {
      alert(err?.message || 'Operation failed');
    } finally {
      loginBtn.disabled = false;
      registerBtn && (registerBtn.disabled = false);
      emailInput.disabled = false;
      passwordInput.disabled = false;
      if (loader) loader.style.display = 'none';
    }
  };

  const clearError = () => {
    if (noteEl) noteEl.style.display = 'none';
    emailInput.classList.remove('error');
    emailInput.removeAttribute('aria-invalid');
  };
  emailInput.addEventListener('input', clearError);

  loginBtn.addEventListener('click', async () => {
    const err = validate();
    if (err) {
      if (noteEl) {
        noteEl.style.display = 'block';
        noteEl.textContent = err;
      }
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.focus();
      return;
    }
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    await withUi(async () => {
      const res = await Api.login(email, password);
      if (!res || !res.accessToken) throw new Error(res?.error?.message || 'Login failed');
    }, 'Signing you in...');
  });

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const err = validate();
      if (err) {
        if (noteEl) {
          noteEl.style.display = 'block';
          noteEl.textContent = err;
        }
        emailInput.classList.add('error');
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
        return;
      }
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      await withUi(async () => {
        const res = await Api.register(email, password);
        if (!res || !res.accessToken) throw new Error(res?.error?.message || 'Registration failed');
      }, 'Creating your account...');
    });
  }
}

export function handleEmailFirstAuth({ emailInput, continueBtn, passwordRow, passwordInput, loginBtn, registerBtn }) {
  const noteEl = document.getElementById('emailDomainNote');
  const loader = document.getElementById('authLoading');
  const loaderMsg = document.getElementById('authLoadingMsg');

  const validateEmail = () => {
    const email = (emailInput.value || '').trim();
    const allowedDomain = '@chitkara.edu.in';
    if (!email) return 'Enter email';
    if (!email.toLowerCase().endsWith(allowedDomain)) return 'Only Chitkara University email is allowed.';
    return null;
  };

  const clearError = () => {
    if (noteEl) noteEl.style.display = 'none';
    emailInput.classList.remove('error');
    emailInput.removeAttribute('aria-invalid');
  };
  emailInput.addEventListener('input', clearError);

  const showPasswordFor = (mode) => {
    passwordRow.style.display = 'block';
    if (mode === 'login') {
      loginBtn.style.display = 'inline-block';
      registerBtn.style.display = 'none';
      loginBtn.focus();
    } else {
      registerBtn.style.display = 'inline-block';
      loginBtn.style.display = 'none';
      registerBtn.focus();
    }
  };

  continueBtn.addEventListener('click', async () => {
    const err = validateEmail();
    if (err) {
      if (noteEl) {
        noteEl.style.display = 'block';
        noteEl.textContent = err;
      }
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
      emailInput.focus();
      return;
    }
    const email = emailInput.value.trim();
    continueBtn.disabled = true;
    emailInput.disabled = true;
    if (loader) {
      loader.style.display = 'flex';
      if (loaderMsg) loaderMsg.textContent = 'Checking email...';
    }
    try {
      const res = await Api.checkEmail(email);
      if (res?.exists && res?.hasPassword) {
        showPasswordFor('login');
      } else {
        showPasswordFor('register');
      }
    } catch (e) {
      alert('Failed to check email');
    } finally {
      continueBtn.disabled = false;
      emailInput.disabled = false;
      if (loader) loader.style.display = 'none';
    }
  });

  // Wire login/register buttons
  handlePasswordAuth({ emailInput, passwordInput, loginBtn, registerBtn });
}
