// assets/js/home.js
import { Api } from './api.js';

const ITEMS = [
  { key:'id', label:'ID Card', icon:'far fa-id-card', namePlaceholder:'e.g., Student ID, Staff ID', detailsPlaceholder:'Name on card, ID number, any details' },
  { key:'pen', label:'Pen', icon:'fas fa-pen', namePlaceholder:'e.g., Parker, Pilot, Bic', detailsPlaceholder:'Color, brand, any identifying marks' },
  { key:'notebook', label:'Notebook', icon:'fas fa-book', namePlaceholder:'e.g., Classmate, Navneet', detailsPlaceholder:'Color, size, subject written on it' },
  { key:'laptop', label:'Laptop', icon:'fas fa-laptop', namePlaceholder:'e.g., MacBook Pro, Dell XPS', detailsPlaceholder:'Model, color, any stickers or marks' },
  { key:'phone', label:'Phone', icon:'fas fa-mobile-alt', namePlaceholder:'e.g., iPhone 13, Samsung Galaxy', detailsPlaceholder:'Model, color, case color, any marks' },
  { key:'earbuds', label:'Earbuds', icon:'fas fa-headphones', namePlaceholder:'e.g., AirPods, Galaxy Buds', detailsPlaceholder:'Color, case color, any marks' },
  { key:'charger', label:'Charger', icon:'fas fa-plug', namePlaceholder:'e.g., iPhone charger, USB-C', detailsPlaceholder:'Type, cable length, any marks' },
  { key:'powerbank', label:'Power Bank', icon:'fas fa-battery-full', namePlaceholder:'e.g., Mi Power Bank, Anker', detailsPlaceholder:'Capacity, color, any marks' },
  { key:'bag', label:'Bag', icon:'fas fa-briefcase', namePlaceholder:'e.g., Backpack, Laptop Bag', detailsPlaceholder:'Color, brand, size, any marks' },
  { key:'keys', label:'Keys', icon:'fas fa-key', namePlaceholder:'e.g., Car keys, Room keys', detailsPlaceholder:'Number of keys, keychain description' },
  { key:'wallet', label:'Wallet', icon:'fas fa-wallet', namePlaceholder:'e.g., Leather wallet, Card holder', detailsPlaceholder:'Color, brand, any cards visible' },
  { key:'calc', label:'Calculator', icon:'fas fa-calculator', namePlaceholder:'e.g., Casio, Scientific', detailsPlaceholder:'Model, color, any marks' },
  { key:'glasses', label:'Glasses', icon:'fas fa-glasses', namePlaceholder:'e.g., Reading glasses, Sunglasses', detailsPlaceholder:'Frame color, prescription details' },
  { key:'usb', label:'USB Drive', icon:'fas fa-usb', namePlaceholder:'e.g., SanDisk, Kingston', detailsPlaceholder:'Capacity, color, any labels' },
  { key:'watch', label:'Watch', icon:'fas fa-clock', namePlaceholder:'e.g., Apple Watch, Casio', detailsPlaceholder:'Model, color, band type' },
  { key:'bottle', label:'Bottle', icon:'fas fa-wine-bottle', namePlaceholder:'e.g., Water bottle, Thermos', detailsPlaceholder:'Color, brand, size, any stickers' }
];

let map = null;
let pinningMap = null; // Separate map for pinning modal
let currentType = 'lost'; // 'lost' or 'found'
let selectedItem = null;
let currentPin = null; // { lat, lng } when user clicks map
let tempPinningMarker = null; // Marker in pinning map
let markers = []; // All markers on map
let posts = []; // All posts (loaded from localStorage)
let mapClickEnabled = false; // Enable map clicks when modal is open and item selected

async function requireAuth() {
  try {
    const me = await Api.getMe();
    if (!me || me.error) throw new Error('unauth');
    return me;
  } catch {
    window.location.href = '../forms/register.html';
  }
}

function makeDivIcon(item, type, zoom = 17) {
  const color = type === 'lost' ? '#dc2626' : '#16a34a';
  const itemData = ITEMS.find(i => i.key === item.key) || { icon: 'fas fa-question' };
  
  // Scale icon size based on zoom level
  // Zoom 16 = larger (40px), Zoom 18 = smaller (28px)
  const baseSize = 36;
  const zoomFactor = (zoom - 17) * -4; // -4px per zoom level above 17
  const iconSize = Math.max(24, Math.min(40, baseSize + zoomFactor));
  const iconFontSize = Math.max(14, Math.min(20, 18 + zoomFactor * 0.5));
  const borderWidth = zoom >= 17 ? 2 : 3;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${iconSize}px;height:${iconSize}px;border-radius:50%;background:${color};color:#fff;border:${borderWidth}px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"><i class="${itemData.icon}" style="font-size:${iconFontSize}px;"></i></div>`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  });
}

// Store posts in memory (loaded from API)
let currentPostId = null; // Track which post is currently open in modal

function renderPosts() {
  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const currentZoom = map ? map.getZoom() : 17;

  // Render all posts as markers
  posts.forEach(post => {
    // Extract coordinates from GeoJSON format [lng, lat] or legacy format
    let lat, lng;
    if (post.location && post.location.coordinates) {
      [lng, lat] = post.location.coordinates; // GeoJSON format
    } else {
      lat = post.lat;
      lng = post.lng;
    }

    const marker = L.marker([lat, lng], {
      icon: makeDivIcon(post.item, post.type, currentZoom)
    }).addTo(map);

    // Simple popup - clicking will open full modal
    const itemData = ITEMS.find(i => i.key === post.item?.key) || { icon: 'fas fa-question' };
    const popupContent = `
      <div style="min-width:200px;">
        <h6 style="margin:0 0 8px 0;color:${post.type === 'lost' ? '#dc2626' : '#16a34a'};">
          <i class="${itemData.icon}"></i>
          ${post.type.toUpperCase()}: ${post.item?.label || 'Item'}
        </h6>
        <p style="margin:4px 0;font-weight:600;">${post.itemName || 'N/A'}</p>
        ${post.description ? `<p style="margin:4px 0;font-size:0.9rem;color:#666;">${post.description}</p>` : ''}
        <button class="btn btn-sm btn-primary mt-2" onclick="window.showPostDetails('${post._id}')" style="width:100%; background:#caac00; border-color:#caac00; color:#030027;">
          View Details & Chat
        </button>
      </div>
    `;
    marker.bindPopup(popupContent);
    
    // Also handle click on marker itself
    marker.on('click', () => {
      showPostDetails(post._id);
    });
    
    markers.push(marker);
  });
}

async function initMap() {
  await requireAuth();

  // Chitkara University, Punjab - Campus bounds
  const CAMPUS_CENTER = [30.5161, 76.6590];
  const CAMPUS_BOUNDS = L.latLngBounds(
    [30.5120, 76.6540], // Southwest corner
    [30.5205, 76.6645]  // Northeast corner
  );

  // Initialize map with strict bounds - MUST restrict to campus only
  map = L.map('map', {
    center: CAMPUS_CENTER,
    zoom: 17,
    minZoom: 16,
    maxZoom: 18,
    maxBounds: CAMPUS_BOUNDS,
    maxBoundsViscosity: 1.0, // Strict - prevents panning outside bounds
    worldCopyJump: false,
    zoomControl: true,
    attributionControl: true,
    crs: L.CRS.EPSG3857 // Ensure we're using Web Mercator
  });
  
  // Immediately restrict view to campus bounds
  map.setMaxBounds(CAMPUS_BOUNDS);

  // Satellite base layer - Esri World Imagery (supports up to zoom 19, but we'll limit to 18)
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxNativeZoom: 19,
    maxZoom: 18, // Match map maxZoom
    minZoom: 0,
    noWrap: false
  });

  // Optional MapTiler Satellite
  const mtKey = window.MAPTILER_KEY || '';
  const maptiler = mtKey
    ? L.tileLayer(`https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${mtKey}`, {
        attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
        maxNativeZoom: 20,
        maxZoom: 18, // Match map maxZoom
        minZoom: 0,
        noWrap: false
      })
    : null;

  // Add default layer
  esri.addTo(map);
  
  // Layer control
  const baseLayers = { 'Esri Satellite': esri };
  if (maptiler) baseLayers['MapTiler Satellite'] = maptiler;
  L.control.layers(baseLayers, {}, { position: 'topright', collapsed: true }).addTo(map);

  // Force initial view to campus - CRITICAL
  map.setView(CAMPUS_CENTER, 17);
  map.fitBounds(CAMPUS_BOUNDS, { 
    padding: [20, 20],
    maxZoom: 17
  });
  
  // Enforce bounds immediately and continuously
  map.setMaxBounds(CAMPUS_BOUNDS);

  // Prevent zooming out too far - enforce min zoom
  map.on('zoomend', () => {
    const currentZoom = map.getZoom();
    const center = map.getCenter();
    
    // Force zoom limits
    if (currentZoom < 16) {
      map.setZoom(16);
    }
    if (currentZoom > 18) {
      map.setZoom(18);
    }
    
    // Update all marker icons to match new zoom level
    markers.forEach((marker, index) => {
      const post = posts[index];
      if (post) {
        marker.setIcon(makeDivIcon(post.item, post.type, currentZoom));
      }
    });
    
    // Update temp marker if it exists
    if (window.tempMarker) {
      const tempZoom = currentZoom;
      const tempSize = Math.max(24, Math.min(40, 32 + (tempZoom - 17) * -4));
      const tempFontSize = Math.max(12, Math.min(18, 16 + (tempZoom - 17) * -2));
      window.tempMarker.setIcon(L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:${tempSize}px;height:${tempSize}px;border-radius:50%;background:#caac00;color:#030027;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);animation:pulse 1s infinite;"><i class="fas fa-map-pin" style="font-size:${tempFontSize}px;"></i></div>`,
        iconSize: [tempSize, tempSize],
        iconAnchor: [tempSize / 2, tempSize]
      }));
    }
    
    // Force center back to campus if outside bounds
    if (!CAMPUS_BOUNDS.contains(center)) {
      const clampedLat = Math.max(CAMPUS_BOUNDS.getSouth(), Math.min(CAMPUS_BOUNDS.getNorth(), center.lat));
      const clampedLng = Math.max(CAMPUS_BOUNDS.getWest(), Math.min(CAMPUS_BOUNDS.getEast(), center.lng));
      map.setView([clampedLat, clampedLng], map.getZoom());
    }
  });

  // Prevent panning outside bounds - enforce on every move
  map.on('move', () => {
    const center = map.getCenter();
    if (!CAMPUS_BOUNDS.contains(center)) {
      const clampedLat = Math.max(CAMPUS_BOUNDS.getSouth(), Math.min(CAMPUS_BOUNDS.getNorth(), center.lat));
      const clampedLng = Math.max(CAMPUS_BOUNDS.getWest(), Math.min(CAMPUS_BOUNDS.getEast(), center.lng));
      map.setView([clampedLat, clampedLng], map.getZoom(), { animate: false });
    }
  });

  // Also enforce on moveend as backup
  map.on('moveend', () => {
    const center = map.getCenter();
    if (!CAMPUS_BOUNDS.contains(center)) {
      const clampedLat = Math.max(CAMPUS_BOUNDS.getSouth(), Math.min(CAMPUS_BOUNDS.getNorth(), center.lat));
      const clampedLng = Math.max(CAMPUS_BOUNDS.getWest(), Math.min(CAMPUS_BOUNDS.getEast(), center.lng));
      map.setView([clampedLat, clampedLng], map.getZoom());
    }
  });
  
  // Prevent any attempts to show world view
  map.on('zoomstart', () => {
    if (map.getZoom() < 16) {
      map.setZoom(16);
    }
  });

  // Handle tile loading errors
  map.on('tileerror', (error, tile) => {
    console.warn('Tile loading error:', error);
    // Don't show error to user, just log it
  });

  // Load posts from API
  loadPostsFromAPI();

  // Main map clicks are now only for viewing posts, not for pinning
  // Pinning is handled in the separate pinning modal

  // Map selection button handler - opens separate pinning modal
  const enableMapBtn = document.getElementById('enableMapSelect');
  const confirmBtn = document.getElementById('confirmLocation');
  
  if (enableMapBtn) {
    enableMapBtn.addEventListener('click', () => {
      if (!selectedItem) {
        const note = document.getElementById('locationNote');
        if (note) {
          note.textContent = 'Please select an item first';
          note.classList.add('show');
          note.style.color = '#ef4444';
        }
        return;
      }
      
      // Open the map pinning modal
      $('#mapPinningModal').modal('show');
    });
  }
  
  // Initialize pinning map when modal is shown
  $('#mapPinningModal').on('shown.bs.modal', () => {
    // Small delay to ensure modal is fully rendered
    setTimeout(() => {
      initPinningMap();
    }, 100);
  });
  
  // Initialize pinning map (separate fullscreen map for location selection)
  function initPinningMap() {
    const pinningMapEl = document.getElementById('pinningMap');
    if (!pinningMapEl) return;
    
    // Clear existing map if any
    if (pinningMap) {
      pinningMap.remove();
    }
    
    // Chitkara University, Punjab - Campus bounds
    const CAMPUS_CENTER = [30.5161, 76.6590];
    const CAMPUS_BOUNDS = L.latLngBounds(
      [30.5120, 76.6540], // Southwest corner
      [30.5205, 76.6645]  // Northeast corner
    );
    
    // Create new map for pinning
    pinningMap = L.map('pinningMap', {
      center: CAMPUS_CENTER,
      zoom: 17,
      minZoom: 16,
      maxZoom: 18,
      maxBounds: CAMPUS_BOUNDS,
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
      zoomControl: true,
      attributionControl: true
    });
    
    pinningMap.setMaxBounds(CAMPUS_BOUNDS);
    
    // Add satellite layer
    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
      maxNativeZoom: 19,
      maxZoom: 18,
      minZoom: 0,
      noWrap: false
    });
    
    esri.addTo(pinningMap);
    pinningMap.fitBounds(CAMPUS_BOUNDS, { padding: [20, 20], maxZoom: 17 });
    
    // Handle clicks on pinning map
    pinningMap.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Remove previous marker
      if (tempPinningMarker) {
        pinningMap.removeLayer(tempPinningMarker);
      }
      
      // Add new marker
      const currentZoom = pinningMap.getZoom();
      const tempSize = Math.max(24, Math.min(40, 32 + (currentZoom - 17) * -4));
      const tempFontSize = Math.max(12, Math.min(18, 16 + (currentZoom - 17) * -2));
      
      tempPinningMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="display:flex;align-items:center;justify-content:center;width:${tempSize}px;height:${tempSize}px;border-radius:50%;background:#caac00;color:#030027;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);animation:pulse 1s infinite;"><i class="fas fa-map-pin" style="font-size:${tempFontSize}px;"></i></div>`,
          iconSize: [tempSize, tempSize],
          iconAnchor: [tempSize / 2, tempSize]
        })
      }).addTo(pinningMap);
      
      // Store location
      currentPin = { lat, lng };
      
      // Show note
      const note = document.getElementById('pinningMapNote');
      if (note) {
        note.textContent = `Location selected! Click "Confirm This Location" below.`;
        note.style.display = 'block';
      }
      
      // Enable confirm button
      const confirmBtn = document.getElementById('confirmMapPin');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
      }
    });
    
    // Update marker size on zoom
    pinningMap.on('zoomend', () => {
      if (tempPinningMarker && currentPin) {
        const currentZoom = pinningMap.getZoom();
        const tempSize = Math.max(24, Math.min(40, 32 + (currentZoom - 17) * -4));
        const tempFontSize = Math.max(12, Math.min(18, 16 + (currentZoom - 17) * -2));
        
        pinningMap.removeLayer(tempPinningMarker);
        tempPinningMarker = L.marker([currentPin.lat, currentPin.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="display:flex;align-items:center;justify-content:center;width:${tempSize}px;height:${tempSize}px;border-radius:50%;background:#caac00;color:#030027;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);animation:pulse 1s infinite;"><i class="fas fa-map-pin" style="font-size:${tempFontSize}px;"></i></div>`,
            iconSize: [tempSize, tempSize],
            iconAnchor: [tempSize / 2, tempSize]
          })
        }).addTo(pinningMap);
      }
    });
    
    // Initially disable confirm button
    const confirmBtn = document.getElementById('confirmMapPin');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
    }
  }
  
  // Confirm pin location handler
  const confirmMapPinBtn = document.getElementById('confirmMapPin');
  const closeMapPinningBtn = document.getElementById('closeMapPinning');
  
  if (confirmMapPinBtn) {
    confirmMapPinBtn.addEventListener('click', () => {
      if (!currentPin || !currentPin.lat || !currentPin.lng) {
        const note = document.getElementById('pinningMapNote');
        if (note) {
          note.textContent = 'Please click on the map first to select a location';
          note.style.display = 'block';
          note.style.background = 'rgba(239,68,68,0.9)';
          note.style.color = '#fff';
        }
        return;
      }
      
      // Update location note in main modal
      const locationNote = document.getElementById('locationNote');
      if (locationNote) {
        locationNote.textContent = `✓ Location confirmed! You can now submit.`;
        locationNote.classList.add('show');
        locationNote.style.color = '#16a34a';
      }
      
      // Show confirm button in main modal
      if (confirmBtn) {
        confirmBtn.style.display = 'flex';
        confirmBtn.dataset.lat = currentPin.lat;
        confirmBtn.dataset.lng = currentPin.lng;
        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Location Confirmed ✓</span>';
        confirmBtn.style.background = '#16a34a';
        confirmBtn.style.borderColor = '#16a34a';
      }
      
      // Hide enable button
      if (enableMapBtn) {
        enableMapBtn.style.display = 'none';
      }
      
      // Close pinning modal and return to main modal
      $('#mapPinningModal').modal('hide');
      
      // Ensure main modal is still open
      setTimeout(() => {
        const mainModal = document.getElementById('itemModal');
        if (mainModal && !mainModal.classList.contains('show')) {
          $('#itemModal').modal('show');
        }
        
        // Ensure item details is visible
        const itemDetails = document.getElementById('itemDetails');
        if (itemDetails && selectedItem) {
          itemDetails.style.display = 'block';
        }
      }, 300);
    });
  }
  
  if (closeMapPinningBtn) {
    closeMapPinningBtn.addEventListener('click', () => {
      // Close pinning modal
      $('#mapPinningModal').modal('hide');
      
      // Return to main modal
      setTimeout(() => {
        const mainModal = document.getElementById('itemModal');
        if (mainModal && !mainModal.classList.contains('show')) {
          $('#itemModal').modal('show');
        }
      }, 300);
    });
  }
  
  // Clean up pinning map when modal closes
  $('#mapPinningModal').on('hidden.bs.modal', () => {
    if (pinningMap) {
      pinningMap.remove();
      pinningMap = null;
    }
    tempPinningMarker = null;
    const note = document.getElementById('pinningMapNote');
    if (note) {
      note.style.display = 'none';
      note.style.background = 'rgba(202,172,0,0.9)';
      note.style.color = '#030027';
    }
  });

  // Confirm location button handler (in main modal - already set from pinning modal)
  // This button just shows confirmation status, location is already confirmed
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      // Location is already confirmed from pinning modal
      // This button just shows confirmation status
      const note = document.getElementById('locationNote');
      if (note) {
        note.textContent = '✓ Location confirmed! You can now submit.';
        note.classList.add('show');
        note.style.color = '#16a34a';
      }
    });
  }

  // Reset when modal closes
  const modal = document.getElementById('itemModal');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', () => {
      mapClickEnabled = false;
      if (window.tempMarker) {
        map.removeLayer(window.tempMarker);
        window.tempMarker = null;
      }
      currentPin = null;
      selectedItem = null;
      document.getElementById('itemGrid').querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
      document.getElementById('itemDetails').style.display = 'none';
      document.getElementById('itemName').value = '';
      document.getElementById('itemDescription').value = '';
      document.getElementById('locationNote').textContent = '';
      document.getElementById('locationNote').classList.remove('show');
      if (enableMapBtn) {
        enableMapBtn.style.display = 'flex';
        enableMapBtn.classList.remove('active');
        enableMapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>Click to Select Location on Map</span>';
      }
      if (confirmBtn) {
        confirmBtn.style.display = 'none';
      }
    });
  }

}

function renderItemGrid() {
  const grid = document.getElementById('itemGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const modal = document.getElementById('itemModal');
  
  ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <i class="${item.icon}"></i>
      <div class="item-label">${item.label}</div>
    `;
    card.addEventListener('click', () => {
      grid.querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedItem = item;
      document.getElementById('itemDetails').style.display = 'block';
      document.getElementById('itemNote').classList.remove('show');
      
      // Update placeholders based on selected item
      const itemNameInput = document.getElementById('itemName');
      const itemDescInput = document.getElementById('itemDescription');
      if (itemNameInput) {
        itemNameInput.placeholder = item.namePlaceholder || 'e.g., Brand or model name';
      }
      if (itemDescInput) {
        itemDescInput.placeholder = item.detailsPlaceholder || 'Color, brand, any identifying marks, etc.';
      }
      
      // Reset map selection button
      const enableMapBtn = document.getElementById('enableMapSelect');
      const confirmBtn = document.getElementById('confirmLocation');
      if (enableMapBtn) {
        enableMapBtn.classList.remove('active');
        enableMapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>Click to Select Location on Map</span>';
        enableMapBtn.style.display = 'flex';
      }
      if (confirmBtn) {
        confirmBtn.style.display = 'none';
        confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirm This Location</span>';
        confirmBtn.style.background = '#16a34a';
        confirmBtn.style.borderColor = '#16a34a';
      }
      mapClickEnabled = false;
      currentPin = null;
    });
    grid.appendChild(card);
  });
}

function initModals() {
  const lostBtn = document.getElementById('lostBtn');
  const foundBtn = document.getElementById('foundBtn');
  const modal = document.getElementById('itemModal');
  const submitBtn = document.getElementById('submitItem');

  // Set type when button is clicked
  lostBtn.addEventListener('click', () => {
    currentType = 'lost';
    selectedItem = null;
    currentPin = null;
    mapClickEnabled = false;
    if (window.tempMarker && map) {
      map.removeLayer(window.tempMarker);
      window.tempMarker = null;
    }
    const enableMapBtn = document.getElementById('enableMapSelect');
    const confirmBtn = document.getElementById('confirmLocation');
    if (enableMapBtn) {
      enableMapBtn.classList.remove('active');
      enableMapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>Click to Select Location on Map</span>';
      enableMapBtn.style.display = 'flex';
    }
    if (confirmBtn) {
      confirmBtn.style.display = 'none';
      confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirm This Location</span>';
      confirmBtn.style.background = '#16a34a';
      confirmBtn.style.borderColor = '#16a34a';
    }
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.classList.remove('map-active');
    }
    document.getElementById('itemModalLabel').textContent = 'Report Lost Item';
    document.getElementById('itemDetails').style.display = 'none';
    document.getElementById('itemName').value = '';
    document.getElementById('itemDescription').value = '';
    renderItemGrid();
  });

  foundBtn.addEventListener('click', () => {
    currentType = 'found';
    selectedItem = null;
    currentPin = null;
    mapClickEnabled = false;
    if (window.tempMarker && map) {
      map.removeLayer(window.tempMarker);
      window.tempMarker = null;
    }
    const enableMapBtn = document.getElementById('enableMapSelect');
    const confirmBtn = document.getElementById('confirmLocation');
    if (enableMapBtn) {
      enableMapBtn.classList.remove('active');
      enableMapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>Click to Select Location on Map</span>';
      enableMapBtn.style.display = 'flex';
    }
    if (confirmBtn) {
      confirmBtn.style.display = 'none';
      confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirm This Location</span>';
      confirmBtn.style.background = '#16a34a';
      confirmBtn.style.borderColor = '#16a34a';
    }
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.classList.remove('map-active');
    }
    document.getElementById('itemModalLabel').textContent = 'Report Found Item';
    document.getElementById('itemDetails').style.display = 'none';
    document.getElementById('itemName').value = '';
    document.getElementById('itemDescription').value = '';
    renderItemGrid();
  });

  // Reset modal when closed
  modal.addEventListener('hidden.bs.modal', () => {
    selectedItem = null;
    currentPin = null;
    mapClickEnabled = false;
    document.getElementById('itemGrid').querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
    document.getElementById('itemDetails').style.display = 'none';
    document.getElementById('itemName').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemNote').classList.remove('show');
    document.getElementById('itemNameNote').classList.remove('show');
    document.getElementById('locationNote').classList.remove('show');
    const enableMapBtn = document.getElementById('enableMapSelect');
    const confirmBtn = document.getElementById('confirmLocation');
    if (enableMapBtn) {
      enableMapBtn.classList.remove('active');
      enableMapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>Click to Select Location on Map</span>';
      enableMapBtn.style.display = 'flex';
    }
    if (confirmBtn) {
      confirmBtn.style.display = 'none';
      confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Confirm This Location</span>';
      confirmBtn.style.background = '#16a34a';
      confirmBtn.style.borderColor = '#16a34a';
    }
  });

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    const itemName = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const itemNote = document.getElementById('itemNote');
    const itemNameNote = document.getElementById('itemNameNote');
    const locationNote = document.getElementById('locationNote');

    // Clear previous errors
    itemNote.classList.remove('show');
    itemNameNote.classList.remove('show');
    locationNote.classList.remove('show');

    // Validation
    if (!selectedItem) {
      itemNote.textContent = 'Please select an item';
      itemNote.classList.add('show');
      return;
    }

    if (!itemName) {
      itemNameNote.textContent = 'Please enter item name/brand';
      itemNameNote.classList.add('show');
      return;
    }

    if (!currentPin || !currentPin.lat || !currentPin.lng) {
      locationNote.textContent = 'Please click on the map to set location';
      locationNote.style.color = '#ef4444';
      locationNote.classList.add('show');
      return;
    }

    // Get user info
    const me = await requireAuth();

    // Save to backend API
    try {
      const savedPost = await Api.createPost({
        type: currentType,
        item: selectedItem,
        itemName: itemName,
        description: description,
        lat: currentPin.lat,
        lng: currentPin.lng,
        campusId: me.profile?.campusId || me.campusId || null
      });
      
      if (savedPost.error) {
        throw new Error(savedPost.error.message || 'Failed to create post');
      }
      
      // Add to local posts array
      posts.push(savedPost);

      // Add marker to map (scaled to current zoom)
      const currentZoom = map.getZoom();
      const lat = savedPost.location?.coordinates?.[1] || savedPost.lat || currentPin.lat;
      const lng = savedPost.location?.coordinates?.[0] || savedPost.lng || currentPin.lng;
      
      const marker = L.marker([lat, lng], {
        icon: makeDivIcon(savedPost.item, savedPost.type, currentZoom)
      }).addTo(map);

      const itemData = ITEMS.find(i => i.key === savedPost.item?.key) || { icon: 'fas fa-question' };
      const popupContent = `
        <div style="min-width:200px;">
          <h6 style="margin:0 0 8px 0;color:${savedPost.type === 'lost' ? '#dc2626' : '#16a34a'};">
            <i class="${itemData.icon}"></i>
            ${savedPost.type.toUpperCase()}: ${savedPost.item?.label || 'Item'}
          </h6>
          <p style="margin:4px 0;font-weight:600;">${savedPost.itemName}</p>
          ${savedPost.description ? `<p style="margin:4px 0;font-size:0.9rem;color:#666;">${savedPost.description}</p>` : ''}
          <button class="btn btn-sm btn-primary mt-2" onclick="window.showPostDetails('${savedPost._id}')" style="width:100%; background:#caac00; border-color:#caac00; color:#030027;">
            View Details & Chat
          </button>
        </div>
      `;
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        showPostDetails(savedPost._id);
      });
      markers.push(marker);
    } catch (error) {
      console.error('Error creating post:', error);
      locationNote.textContent = 'Failed to create post: ' + (error.message || 'Unknown error');
      locationNote.style.color = '#ef4444';
      locationNote.classList.add('show');
      return;
    }

    // Remove temp marker
    if (window.tempMarker && map) {
      map.removeLayer(window.tempMarker);
      window.tempMarker = null;
    }

    // Show success and close modal
    locationNote.textContent = 'Item posted successfully!';
    locationNote.style.color = '#16a34a';
    locationNote.classList.add('show');
    
    setTimeout(() => {
      $('#itemModal').modal('hide');
    }, 1000);
  });
}

// Load posts from backend API
async function loadPostsFromAPI() {
  try {
    const me = await requireAuth();
    const campusId = me.profile?.campusId || me.campusId;
    
    // Get bounds for filtering
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    const postsData = await Api.getPosts({
      status: 'active',
      campusId: campusId,
      bounds: {
        sw: { lat: sw.lat, lng: sw.lng },
        ne: { lat: ne.lat, lng: ne.lng }
      }
    });
    
    if (Array.isArray(postsData) && !postsData.error) {
      posts = postsData;
      renderPosts();
    } else {
      console.warn('Failed to load posts:', postsData);
      posts = [];
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    posts = [];
  }
}

// Show post details modal with profile and chat
async function showPostDetails(postId) {
  currentPostId = postId;
  try {
    const post = await Api.getPost(postId);
    if (post.error) {
      alert('Failed to load post details');
      return;
    }
    
    // Populate user profile
    const user = post.userId || {};
    const profile = user.profile || {};
    document.getElementById('postUserName').textContent = profile.name || user.name || 'Unknown';
    document.getElementById('postUserRoll').textContent = profile.rollNumber || '-';
    document.getElementById('postUserPhone').textContent = profile.phone || '-';
    document.getElementById('postUserEmail').textContent = user.email || '-';
    
    // Populate post details
    const itemData = ITEMS.find(i => i.key === post.item?.key) || { icon: 'fas fa-question', label: 'Item' };
    const postDetailsHtml = `
      <p><strong>Type:</strong> <span style="color:${post.type === 'lost' ? '#dc2626' : '#16a34a'};">${post.type.toUpperCase()}</span></p>
      <p><strong>Item:</strong> <i class="${itemData.icon}"></i> ${post.item?.label || 'Item'}</p>
      <p><strong>Name/Brand:</strong> ${post.itemName || 'N/A'}</p>
      ${post.description ? `<p><strong>Description:</strong> ${post.description}</p>` : ''}
      <p><strong>Posted:</strong> ${new Date(post.createdAt || post.ts).toLocaleString()}</p>
    `;
    document.getElementById('postDetailsContent').innerHTML = postDetailsHtml;
    
    // Load and display messages
    const postOwnerId = user._id || user.id;
    await loadChatMessages(postId, postOwnerId);
    
    // Set up auto-refresh for messages every 3 seconds
    if (window.messageRefreshInterval) {
      clearInterval(window.messageRefreshInterval);
    }
    window.messageRefreshInterval = setInterval(async () => {
      if (currentPostId === postId) {
        await loadChatMessages(postId, postOwnerId);
      }
    }, 3000);
    
    // Show modal
    $('#postDetailsModal').modal('show');
    
    // Clear interval when modal closes
    $('#postDetailsModal').on('hidden.bs.modal', () => {
      if (window.messageRefreshInterval) {
        clearInterval(window.messageRefreshInterval);
        window.messageRefreshInterval = null;
      }
      currentPostId = null;
    });
  } catch (error) {
    console.error('Error loading post details:', error);
    alert('Failed to load post details');
  }
}

// Load chat messages
async function loadChatMessages(postId, postOwnerId) {
  try {
    const messages = await Api.getMessages(postId);
    const chatContainer = document.getElementById('chatMessages');
    const me = await Api.getMe();
    const currentUserId = me._id || me.id;
    const postOwnerIdStr = postOwnerId?.toString() || postOwnerId;
    
    chatContainer.innerHTML = '';
    
    if (!Array.isArray(messages) || messages.length === 0) {
      chatContainer.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No messages yet. Start the conversation!</p>';
      return;
    }
    
    messages.forEach(msg => {
      const isFromMe = msg.fromUserId?._id?.toString() === currentUserId?.toString() || 
                       msg.fromUserId?.id?.toString() === currentUserId?.toString();
      const sender = msg.fromUserId || {};
      const senderName = sender.profile?.name || sender.name || 'Unknown';
      const senderIdStr = sender._id?.toString() || sender.id?.toString();
      const isPoster = senderIdStr === postOwnerIdStr;
      const messageId = msg._id || msg.id;
      
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `margin-bottom:10px; padding:10px; background:${isFromMe ? 'rgba(202,172,0,0.2)' : 'rgba(255,255,255,0.1)'}; border-radius:8px; ${isFromMe ? 'margin-left:20%;' : 'margin-right:20%;'} position:relative;`;
      messageDiv.dataset.messageId = messageId;
      
      // Build sender name with tags
      let senderLabel = senderName;
      if (isFromMe) {
        senderLabel += ' <span style="color:#caac00;">(You)</span>';
      }
      if (isPoster) {
        senderLabel += ' <span style="background:#caac00; color:#030027; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:600; margin-left:5px;"><i class="fas fa-map-pin" style="font-size:0.65rem;"></i> Pinned by</span>';
      }
      
      // Add delete button only for user's own messages
      const deleteButton = isFromMe ? `
        <button class="delete-message-btn" data-message-id="${messageId}" style="position:absolute; top:5px; right:5px; background:transparent; border:none; color:#ef4444; cursor:pointer; padding:2px 5px; opacity:0.6; transition:opacity 0.2s;" title="Delete message" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
          <i class="fas fa-trash-alt" style="font-size:0.75rem;"></i>
        </button>
      ` : '';
      
      messageDiv.innerHTML = `
        ${deleteButton}
        <div style="font-size:0.85rem; color:#caac00; margin-bottom:5px;">${senderLabel}</div>
        <div>${msg.message}</div>
        <div style="font-size:0.75rem; color:#999; margin-top:5px;">${new Date(msg.createdAt).toLocaleString()}</div>
      `;
      chatContainer.appendChild(messageDiv);
      
      // Add delete event listener if it's user's message
      if (isFromMe) {
        const deleteBtn = messageDiv.querySelector('.delete-message-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this message?')) {
              await deleteMessage(messageId, postId, postOwnerId);
            }
          });
        }
      }
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
    document.getElementById('chatMessages').innerHTML = '<p style="color:#ef4444;">Failed to load messages</p>';
  }
}

// Delete message handler
async function deleteMessage(messageId, postId, postOwnerId) {
  try {
    const result = await Api.deleteMessage(messageId);
    
    if (result.error) {
      alert('Failed to delete message: ' + (result.error.message || 'Unknown error'));
      return;
    }
    
    // Reload messages to reflect deletion
    await loadChatMessages(postId, postOwnerId);
  } catch (error) {
    console.error('Error deleting message:', error);
    alert('Failed to delete message');
  }
}

// Send message handler
async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message || !currentPostId) return;
  
  try {
    const post = await Api.getPost(currentPostId);
    if (post.error) {
      alert('Failed to send message');
      return;
    }
    
    const me = await Api.getMe();
    const postOwnerId = post.userId?._id || post.userId;
    const currentUserId = me._id?.toString() || me.id?.toString();
    const isPoster = currentUserId === (postOwnerId?.toString() || postOwnerId);
    
    // Determine who to send the message to
    let toUserId = postOwnerId;
    const messages = await Api.getMessages(currentPostId);
    
    if (Array.isArray(messages) && messages.length > 0) {
      // Find the last message that wasn't from the current user
      const lastOtherMessage = [...messages].reverse().find(msg => {
        const msgFromId = msg.fromUserId?._id?.toString() || msg.fromUserId?.id?.toString();
        return msgFromId !== currentUserId;
      });
      if (lastOtherMessage) {
        // Reply to the last person who messaged
        toUserId = lastOtherMessage.fromUserId?._id || lastOtherMessage.fromUserId?.id;
      } else if (isPoster) {
        // Poster is sending and all previous messages are from them - allow it (will be to themselves)
        toUserId = postOwnerId;
      }
      // If no lastOtherMessage and not poster, toUserId stays as postOwnerId (normal case for first message from non-poster)
    } else {
      // No messages yet
      if (isPoster) {
        // Poster sending first message - allow it (will be to themselves)
        toUserId = postOwnerId;
      }
      // If not poster, toUserId is postOwnerId (normal case)
    }
    
    const result = await Api.sendMessage({
      postId: currentPostId,
      toUserId: toUserId,
      message: message
    });
    
    if (result.error) {
      alert('Failed to send message: ' + (result.error.message || 'Unknown error'));
      return;
    }
    
    // Clear input
    chatInput.value = '';
    
    // Reload messages
    await loadChatMessages(currentPostId, postOwnerId);
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message');
  }
}

// Initialize chat handlers
function initChat() {
  const sendBtn = document.getElementById('sendMessageBtn');
  const chatInput = document.getElementById('chatInput');
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
}

// Expose to window for popup button
window.showPostDetails = showPostDetails;

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initModals();
  renderItemGrid();
  initChat();
});

