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
      if (!me || me.error || !me.profileCompleted) return (window.location.href = '/forms/profile.html');
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
      if (noteEl) {
        noteEl.style.display = 'block';
        noteEl.textContent = err?.message || 'Operation failed';
      }
      // Mark password/email as error for visibility
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
      passwordInput.classList.add('error');
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
      const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
      if (!strong) {
        if (noteEl) {
          noteEl.style.display = 'block';
          noteEl.textContent = 'Password must be at least 8 characters and include letters and numbers';
        }
        passwordInput.focus();
        return;
      }
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
    // hide the Continue button once we know the mode
    if (continueBtn) continueBtn.style.display = 'none';
    // lock email to avoid confusion after step 1
    emailInput.disabled = true;
    if (mode === 'login') {
      loginBtn.style.display = 'inline-block';
      registerBtn.style.display = 'none';
      passwordInput.focus();
    } else {
      registerBtn.style.display = 'inline-block';
      loginBtn.style.display = 'none';
      passwordInput.focus();
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
      if (noteEl) {
        noteEl.style.display = 'block';
        noteEl.textContent = 'Failed to check email. Please try again.';
      }
      emailInput.classList.add('error');
      emailInput.setAttribute('aria-invalid', 'true');
    } finally {
      continueBtn.disabled = false;
      emailInput.disabled = false;
      if (loader) loader.style.display = 'none';
    }
  });

  // Wire login/register buttons
  handlePasswordAuth({ emailInput, passwordInput, loginBtn, registerBtn });

  // Enter on password triggers the visible action
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (loginBtn && loginBtn.style.display !== 'none') loginBtn.click();
      else if (registerBtn && registerBtn.style.display !== 'none') registerBtn.click();
    }
  });
}
