import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../../api.js';

export default function AppHome(){
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markersRef = useRef([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(()=>{
    // Initialize Leaflet map once
    if (mapRef.current && window.L) {
      const L = window.L;
      const map = L.map(mapRef.current).setView([30.7333, 76.7794], 17); // Chandigarh
      // Esri satellite tiles to match legacy look
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri, Maxar'
      }).addTo(map);
      mapObj.current = map;
    }
  },[]);

  useEffect(()=>{
    // Load posts and render markers
    (async ()=>{
      if (!mapObj.current || !window.L) return;
      try{
        setLoadingPosts(true);
        const data = await Api.getPosts ? await Api.getPosts({}) : [];
        // Clear existing
        markersRef.current.forEach(m=> mapObj.current.removeLayer(m));
        markersRef.current = [];
        const L = window.L;
        (data || []).forEach(post => {
          let lat, lng;
          if (post.location && post.location.coordinates) {
            [lng, lat] = post.location.coordinates;
          } else { lat = post.lat; lng = post.lng; }
          if (typeof lat !== 'number' || typeof lng !== 'number') return;
          const color = post.type === 'lost' ? '#dc2626' : '#16a34a';
          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${color};color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"><i class="fas ${post.type==='lost'?'fa-exclamation-triangle':'fa-check'}" style="font-size:14px;"></i></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })
          }).addTo(mapObj.current);
          markersRef.current.push(marker);
        });
      } finally { setLoadingPosts(false); }
    })();
  }, [mapObj.current]);

  return (
    <div className="auth-page">
      <main className="page-content">
        <div className="home-container">
          {/* Action Panel */}
          <div className="action-panel">
            <h3>Report Item</h3>
            <button className="action-btn" type="button">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Lost Item</span>
            </button>
            <button className="action-btn" type="button">
              <i className="fas fa-check-circle"></i>
              <span>Found Item</span>
            </button>
          </div>

          {/* Map */}
          <div className="map-container">
            <div id="map" ref={mapRef} />
            {loadingPosts && (
              <div style={{position:'absolute', top:10, right:10, background:'rgba(3,0,39,.75)', color:'#fff', padding:'6px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,.2)'}}>
                Loading posts...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
