// assets/js/app.js
import { Api } from './api.js';

async function requireAuth() {
  try {
    const me = await Api.getMe();
    if (!me || me.error) throw new Error('unauth');
    return me;
  } catch {
    window.location.href = '../forms/register.html';
  }
}

function h(tag, cls, html){ const el = document.createElement(tag); if (cls) el.className = cls; if (html) el.innerHTML = html; return el; }

function renderEmpty(show){
  const empty = document.getElementById('emptyState');
  if (empty) empty.style.display = show ? 'block' : 'none';
}

function renderPosts(posts){
  const feed = document.getElementById('feed');
  feed.innerHTML = '';
  if (!posts || !posts.length){ renderEmpty(true); return; }
  renderEmpty(false);
  for (const p of posts){
    const col = h('div','col-md-6 col-lg-4 mb-3');
    const card = h('div','card h-100');
    const body = h('div','card-body');
    body.append(
      h('div','d-flex justify-content-between align-items-center mb-1',
        `<span class="badge badge-${p.type==='lost'?'danger':'success'} text-uppercase">${p.type}</span>
         <small class="text-muted">${p.campus || 'My Campus'}</small>`
      ),
      h('h5','card-title mb-1', p.title || 'Untitled'),
      h('p','card-text small text-muted', p.description || '')
    );
    const footer = h('div','card-footer bg-white border-0 pt-0');
    footer.append(h('button','btn btn-sm btn-outline-dark','View'));
    card.append(body, footer);
    col.append(card);
    feed.append(col);
  }
}

async function main(){
  const me = await requireAuth();
  if (!me) return;
  const name = me.profile?.name || me.name || 'User';
  document.getElementById('meName').textContent = `Welcome, ${name}`;
  document.getElementById('meCampus').textContent = me.profile?.campusId ? 'Your campus' : 'Select campus';

  // Temporary placeholder data until backend posts exist
  const defaultPosts = [
    { type:'lost', title:'Lost ID Card', description:'Blue strap near cafeteria', campus:'My Campus' },
    { type:'found', title:'Found Earbuds', description:'Found in library, black case', campus:'My Campus' },
  ];
  renderPosts(defaultPosts);

  // Tab handlers (placeholder)
  document.getElementById('tabLost').addEventListener('click', ()=>{
    document.getElementById('tabLost').classList.add('active');
    document.getElementById('tabFound').classList.remove('active');
    renderPosts(defaultPosts.filter(p=>p.type==='lost'));
  });
  document.getElementById('tabFound').addEventListener('click', ()=>{
    document.getElementById('tabFound').classList.add('active');
    document.getElementById('tabLost').classList.remove('active');
    renderPosts(defaultPosts.filter(p=>p.type==='found'));
  });
}

main();
