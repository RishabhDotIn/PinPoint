// assets/js/campus-ui.js
// Show a "Select campus" nav item when user is logged in but has no campus yet
import { Api } from './api.js';

async function initCampusNav() {
  const el = document.getElementById('navSelectCampus');
  if (!el) return;
  try {
    const me = await Api.getMe();
    // Show when authenticated (even if campus exists) so user can revisit selection
    if (me && !me.error) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  } catch {
    // Not logged in: hide the link
    if (el) el.style.display = 'none';
  }
}

initCampusNav();
