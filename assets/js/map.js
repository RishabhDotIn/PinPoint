// assets/js/map.js
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

function makeDivIcon(type){
  const color = type === 'lost' ? '#dc2626' : '#16a34a';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)"><i class="fas ${type==='lost'?'fa-exclamation':'fa-check'}" style="font-size:14px;"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

function savePins(pins){
  localStorage.setItem('pp_pins', JSON.stringify(pins || []));
}
function loadPins(){
  try { return JSON.parse(localStorage.getItem('pp_pins') || '[]'); } catch { return []; }
}

async function init(){
  await requireAuth();

  // Chitkara University, Punjab (near Chandigarh–Patiala NH)
  const CAMPUS_CENTER = [30.5161, 76.6590];
  const CAMPUS_BOUNDS = L.latLngBounds(
    [30.5120, 76.6540], // SW
    [30.5205, 76.6645]  // NE
  );

  // Init map locked to campus area (cutout) with strict bounds & zoom
  const map = L.map('map', {
    maxBounds: CAMPUS_BOUNDS.pad(0.05),
    maxBoundsViscosity: 1.0,
    minZoom: 16,
    maxZoom: 18,
    worldCopyJump: false,
    inertia: false
  });

  // Base layers
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxNativeZoom: 19,
    maxZoom: 19
  });
  // Optional MapTiler Satellite (set window.MAPTILER_KEY = 'your_key' before load)
  const mtKey = window.MAPTILER_KEY || '';
  const maptiler = mtKey
    ? L.tileLayer(`https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${mtKey}`, {
        attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
        maxNativeZoom: 20,
        maxZoom: 20
      })
    : null;
  (maptiler || esri).addTo(map);
  const baseLayers = { 'Esri Satellite': esri };
  if (maptiler) baseLayers['MapTiler Satellite'] = maptiler;
  L.control.layers(baseLayers, {}, { position: 'topright', collapsed: true }).addTo(map);

  // Set default view - try geolocation, else fit campus bounds
  const setDefault = () => {
    map.fitBounds(CAMPUS_BOUNDS, { padding: [20,20] });
  };
  if ('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition((pos)=>{
      map.setView([pos.coords.latitude, pos.coords.longitude], Math.min(18, map.getMaxZoom()));
    }, setDefault, { enableHighAccuracy:true, timeout:5000 });
  } else setDefault();

  // Clamp zoom to prevent provider grey tiles
  map.on('zoomend', ()=>{ if (map.getZoom() > map.getMaxZoom()) map.setZoom(map.getMaxZoom()); });

  const pins = loadPins();
  const markers = [];
  const renderPin = (p) => {
    const m = L.marker([p.lat, p.lng], { icon: makeDivIcon(p.type) }).addTo(map);
    m.bindPopup(`<b>${p.type.toUpperCase()}</b><br>${p.title || ''}<br><small>${p.desc || ''}</small>`);
    markers.push(m);
  };
  pins.forEach(renderPin);

  // UI controls
  let selectedType = 'lost';
  const typeButtons = document.querySelectorAll('.icon-choice button');
  typeButtons.forEach(btn => btn.addEventListener('click', ()=>{
    selectedType = btn.getAttribute('data-type') || 'lost';
    typeButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }));

  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('desc');
  const noteEl = document.getElementById('mapNote');

  function addPinAt(lat, lng){
    const title = (titleEl.value || '').trim();
    const desc = (descEl.value || '').trim();
    const pin = { type: selectedType, lat, lng, title, desc, ts: Date.now() };
    pins.push(pin);
    savePins(pins);
    renderPin(pin);
    // expose last pin for other UIs (e.g., create found modal)
    window.ppLastPin = { lat, lng };
    if (noteEl){ noteEl.style.display='block'; noteEl.textContent='Pinned! (temporary local save)'; }
  }

  document.getElementById('useLocation').addEventListener('click', () => {
    if ('geolocation' in navigator){
      navigator.geolocation.getCurrentPosition((pos)=>{
        addPinAt(pos.coords.latitude, pos.coords.longitude);
      }, ()=>{
        if (noteEl){ noteEl.style.display='block'; noteEl.textContent='Unable to get your location'; }
      }, { enableHighAccuracy:true, timeout:5000 });
    }
  });

  // Also allow clicking on map to drop a pin
  map.on('click', (e)=> addPinAt(e.latlng.lat, e.latlng.lng));
}

// Load after DOM
document.addEventListener('DOMContentLoaded', init);
