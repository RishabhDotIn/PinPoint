// assets/js/nav.js
// Swap Login with Profile icon when authenticated, across pages
import { Api } from './api.js';

function resolveProfileHref() {
  const p = location.pathname;
  if (p.includes('/forms/')) return '../forms/profile.html';
  if (p.includes('/app/')) return '../forms/profile.html';
  return 'forms/profile.html';
}

function resolveRegisterHref() {
  const p = location.pathname;
  if (p.includes('/forms/')) return '../forms/register.html';
  if (p.includes('/app/')) return '../forms/register.html';
  return 'forms/register.html';
}

export async function initNav() {
  try {
    const me = await Api.getMe();
    if (!me || me.error) return; // unauthenticated -> keep Login

    const profileHref = resolveProfileHref();
    // Replace any Login links pointing to register.html with a Profile link/icon
    const links = Array.from(document.querySelectorAll('a[href$="forms/register.html"], a[href*="forms/register.html"], a[href$="../forms/register.html"], a[href*="../forms/register.html"]'));
    links.forEach((a) => {
      a.href = profileHref;
      a.innerHTML = '<i class="fas fa-user-circle mr-1"></i> Profile';
      a.classList.add('grow');
      a.title = me.name ? `Profile · ${me.name}` : 'Profile';
    });

    // Update landing CTA to Dive In
    const cta = document.getElementById('ctaMain');
    if (cta) {
      cta.textContent = 'Dive In';
      cta.href = 'app/home.html'; // placeholder app home route
    }
  } catch {
    // On any failure, ensure we are logged out in UI and token is cleared
    try { Api.clearAccessToken(); } catch {}
    const links = Array.from(document.querySelectorAll('a[href$="forms/register.html"], a[href*="forms/register.html"], a[href$="../forms/register.html"], a[href*="../forms/register.html"]'));
    links.forEach((a) => {
      a.href = resolveRegisterHref();
      a.innerHTML = '<i class="fas fa-user mr-1"></i> Login';
    });
    const cta = document.getElementById('ctaMain');
    if (cta) {
      cta.textContent = 'Register Now';
      cta.href = 'forms/register.html';
    }
  }
}

// Auto-init if loaded directly without explicit import call
if (typeof window !== 'undefined') {
  // Defer to allow DOM to be ready in simple pages
  window.requestAnimationFrame(() => initNav());
}
