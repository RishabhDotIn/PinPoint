// assets/js/found-modal.js
import { Api } from './api.js';

const ITEMS = [
  { key:'id', label:'ID Card', icon:'far fa-id-card' },
  { key:'pen', label:'Pen', icon:'fas fa-pen' },
  { key:'notebook', label:'Notebook', icon:'fas fa-book' },
  { key:'laptop', label:'Laptop', icon:'fas fa-laptop' },
  { key:'phone', label:'Phone', icon:'fas fa-mobile-alt' },
  { key:'earbuds', label:'Earbuds', icon:'fas fa-headphones' },
  { key:'charger', label:'Charger', icon:'fas fa-plug' },
  { key:'powerbank', label:'Power Bank', icon:'fas fa-battery-full' },
  { key:'bag', label:'Bag', icon:'fas fa-briefcase' },
  { key:'keys', label:'Keys', icon:'fas fa-key' },
  { key:'wallet', label:'Wallet', icon:'fas fa-wallet' },
  { key:'calc', label:'Calculator', icon:'fas fa-calculator' },
  { key:'glasses', label:'Glasses', icon:'fas fa-glasses' },
  { key:'usb', label:'USB Drive', icon:'fas fa-usb' },
  { key:'watch', label:'Watch', icon:'fas fa-clock' },
  { key:'bottle', label:'Bottle', icon:'fas fa-wine-bottle' }
];

function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }

function renderItems(){
  const grid = document.getElementById('fmItemGrid');
  if (!grid) return;
  grid.innerHTML='';
  ITEMS.forEach(item=>{
    const card = el('div','item-card');
    card.innerHTML = `<i class="${item.icon}"></i><div class="small">${item.label}</div>`;
    card.setAttribute('data-key', item.key);
    card.setAttribute('data-label', item.label);
    card.addEventListener('click', ()=>{
      grid.querySelectorAll('.item-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      const note = document.getElementById('fmItemNote'); if(note){ note.style.display='none'; note.textContent=''; }
    });
    grid.appendChild(card);
  });
}

function getSelected(){
  const ac = document.querySelector('#fmItemGrid .item-card.active');
  return ac ? { key: ac.getAttribute('data-key'), label: ac.getAttribute('data-label') } : null;
}

function showError(id, msg){ const n=document.getElementById(id); if(n){ n.style.display='block'; n.textContent=msg; } }
function clearError(id){ const n=document.getElementById(id); if(n){ n.style.display='none'; n.textContent=''; } }

async function ensureAuth(){ try{ const me=await Api.getMe(); if(me&& !me.error) return me; }catch{} window.location.href='../forms/register.html'; }

function getCurrentMapPin(){ return window.ppLastPin || null; }

function useMyLocation(cb){
  if (!('geolocation' in navigator)) return cb(new Error('Geolocation not available'));
  navigator.geolocation.getCurrentPosition(pos=> cb(null, { lat: pos.coords.latitude, lng: pos.coords.longitude }), ()=> cb(new Error('Unable to get location')), { enableHighAccuracy:true, timeout:5000 });
}

function saveLocalPost(post){
  const key='pp_found_posts';
  const list = JSON.parse(localStorage.getItem(key)||'[]');
  list.push(post); localStorage.setItem(key, JSON.stringify(list));
}

function initHandlers(){
  const btnMap = document.getElementById('fmUseMapPin');
  const btnLoc = document.getElementById('fmUseMyLoc');
  const postBtn = document.getElementById('fmPost');

  if (btnMap) btnMap.addEventListener('click', ()=>{
    clearError('fmLocNote');
    const pin = getCurrentMapPin();
    if (!pin) return showError('fmLocNote','Drop a pin on the map (right side) first.');
    btnMap.dataset.lat = pin.lat; btnMap.dataset.lng = pin.lng;
    showError('fmLocNote','Using current map pin.');
  });

  if (btnLoc) btnLoc.addEventListener('click', ()=>{
    clearError('fmLocNote');
    useMyLocation((err, loc)=>{
      if (err) return showError('fmLocNote', err.message);
      btnMap.dataset.lat = loc.lat; btnMap.dataset.lng = loc.lng;
      showError('fmLocNote','Using current device location.');
    });
  });

  if (postBtn) postBtn.addEventListener('click', async ()=>{
    clearError('fmItemNote'); clearError('fmBrandNote'); clearError('fmLocNote');
    const sel = getSelected();
    const brand = (document.getElementById('fmBrand').value||'').trim();
    const details = (document.getElementById('fmDetails').value||'').trim();
    const lat = btnMap.dataset.lat ? parseFloat(btnMap.dataset.lat) : NaN;
    const lng = btnMap.dataset.lng ? parseFloat(btnMap.dataset.lng) : NaN;

    if (!sel) return showError('fmItemNote','Select an item');
    if (!brand) return showError('fmBrandNote','Enter brand/name');
    if (!isFinite(lat) || !isFinite(lng)) return showError('fmLocNote','Choose a location');

    const me = await ensureAuth();
    const post = {
      type: 'found',
      item: sel,
      brand, details,
      lat, lng,
      campusId: me.profile?.campusId || me.campusId || null,
      ts: Date.now()
    };

    // TODO: Switch to backend POST /v1/posts
    saveLocalPost(post);

    // Feedback + close modal
    showError('fmLocNote', 'Posted (temporarily saved locally).');
    setTimeout(()=>{ try{ $('#foundModal').modal('hide'); }catch{} }, 800);
  });
}

function init(){ renderItems(); initHandlers(); }

document.addEventListener('DOMContentLoaded', init);
