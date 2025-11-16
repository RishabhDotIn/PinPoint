// assets/js/nav.js
// Swap Login with Profile icon when authenticated, across pages
import { Api } from './api.js';

function resolveProfileHref() {
  return location.pathname.includes('/forms/') ? '../forms/profile.html' : 'forms/profile.html';
}

export async function initNav() {
  try {
    const me = await Api.getMe();
    if (!me || me.error) return; // unauthenticated -> keep Login

    const profileHref = resolveProfileHref();
    // Replace any Login links pointing to register.html with a Profile link/icon
    const links = Array.from(document.querySelectorAll('a[href$="forms/register.html"], a[href*="forms/register.html"]'));
    links.forEach((a) => {
      a.href = profileHref;
      a.innerHTML = '<i class="fas fa-user-circle mr-1"></i> Profile';
      a.classList.add('grow');
      a.title = me.name ? `Profile · ${me.name}` : 'Profile';
    });
  } catch {
    // On any failure, ensure we are logged out in UI and token is cleared
    try { Api.clearAccessToken(); } catch {}
    const links = Array.from(document.querySelectorAll('a[href$="forms/register.html"], a[href*="forms/register.html"]'));
    links.forEach((a) => {
      a.href = resolveProfileHref().includes('../') ? '../forms/register.html' : 'forms/register.html';
      a.innerHTML = '<i class="fas fa-user mr-1"></i> Login';
    });
  }
}

// Auto-init if loaded directly without explicit import call
if (typeof window !== 'undefined') {
  // Defer to allow DOM to be ready in simple pages
  window.requestAnimationFrame(() => initNav());
}
