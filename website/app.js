
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { firebaseConfig } from './config.js';


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Inicializuoti žemėlapį (centras - Vilnius)
const map = L.map('map').setView([54.6872, 25.2797], 13);

// Pridėti OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);


let markers = [];
let leafletMarkers = [];
let activeMarkerId = null;

// Gauti marker spalvą pagal būklę
function getMarkerColor(condition) {
  if (condition.includes('Slidus') || condition.includes('Ledas')) return '#f44336';
  if (condition.includes('Sausas')) return '#4CAF50';
  if (condition.includes('Šlapias')) return '#2196F3';
  if (condition.includes('Sninga')) return '#607D8B';
  if (condition.includes('Rūkas')) return '#9E9E9E';
  if (condition.includes('darbai')) return '#FF9800';
  if (condition.includes('Avarija')) return '#E91E63';
  return '#2196F3';
}

// Sukurti custom marker ikoną
function createCustomIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
}

// Sukurti popup turinį
function createPopupContent(marker) {
  return `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 10px 0; color: ${getMarkerColor(marker.roadCondition)};">
        ${marker.roadCondition}
      </h3>
      ${marker.customMessage ? `
        <div style="background: #f5f5f5; padding: 8px; border-radius: 5px; margin: 10px 0; font-style: italic;">
          📝 ${marker.customMessage}
        </div>
      ` : ''}
      <p style="margin: 5px 0;"><strong>🌡️ Temperatūra:</strong> ${marker.temperature}°C</p>
      <p style="margin: 5px 0;"><strong>☁️ Oras:</strong> ${marker.weather}</p>
      ${marker.pressure ? `<p style="margin: 5px 0;"><strong>📊 Slėgis:</strong> ${marker.pressure} hPa</p>` : ''}
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
        📍 ${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}
      </p>
      <button onclick="deleteMarker('${marker.id}')" style="
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        font-weight: bold;
      ">🗑️ Ištrinti žymą</button>
    </div>
  `;
}


function updateMarkerList(markersData) {
  const listContainer = document.getElementById('marker-list');
  
  if (markersData.length === 0) {
    listContainer.innerHTML = '<div class="loading"><p>Žymų nerasta</p></div>';
    return;
  }

  listContainer.innerHTML = markersData.map(marker => `
    <div class="marker-item" data-id="${marker.id}">
      <div onclick="focusMarker('${marker.id}')" style="cursor: pointer;">
        <div class="marker-condition" style="color: ${getMarkerColor(marker.roadCondition)};">
          <span>${getEmoji(marker.roadCondition)}</span>
          <span>${marker.roadCondition}</span>
        </div>
        ${marker.customMessage ? `
          <div class="marker-message">
            ${marker.customMessage}
          </div>
        ` : ''}
        <div class="marker-info">
          <div class="marker-info-item">🌡️ ${marker.temperature}°C</div>
          <div class="marker-info-item">☁️ ${marker.weather}</div>
          ${marker.pressure ? `<div class="marker-info-item">📊 ${marker.pressure} hPa</div>` : ''}
        </div>
      </div>
      <button class="delete-btn" onclick="deleteMarker('${marker.id}')">🗑️ Ištrinti</button>
    </div>
  `).join('');
}

// Gauti emoji pagal būklę
function getEmoji(condition) {
  if (condition.includes('Slidus')) return '⚠️';
  if (condition.includes('Sausas')) return '✅';
  if (condition.includes('Šlapias')) return '💧';
  if (condition.includes('Sninga')) return '❄️';
  if (condition.includes('Rūkas')) return '🌫️';
  if (condition.includes('Ledas')) return '🧊';
  if (condition.includes('darbai')) return '🚧';
  if (condition.includes('Avarija')) return '🚗';
  return '📍';
}

// Fokusuoti į konkretų marker
window.focusMarker = function(markerId) {
  const marker = markers.find(m => m.id === markerId);
  if (!marker) return;

  
  document.querySelectorAll('.marker-item').forEach(item => {
    item.classList.remove('active');
  });

  
  document.querySelector(`[data-id="${markerId}"]`).classList.add('active');

  // Centruoti žemėlapį ir atidaryti popup
  map.setView([marker.lat, marker.lon], 15);
  
  const leafletMarker = leafletMarkers.find(m => m.options.markerId === markerId);
  if (leafletMarker) {
    leafletMarker.openPopup();
  }

  activeMarkerId = markerId;
};

// Ištrinti žymą
window.deleteMarker = async function(markerId) {
  if (!confirm('Ar tikrai norite ištrinti šią žymą?')) {
    return;
  }

  try {
    console.log(' Trinamas marker:', markerId);
    const markerRef = ref(database, `markers/${markerId}`);
    await remove(markerRef);
    console.log(' Marker ištrintas');
    
    // Uždaryti visus popup
    map.closePopup();
  } catch (error) {
    console.error(' Klaida trinant marker:', error);
    alert('Klaida trinant žymą: ' + error.message);
  }
};

// Klausytis Firebase Realtime Database pokyčių
const markersRef = ref(database, 'markers');
onValue(markersRef, (snapshot) => {
  console.log('📡 Gaunami duomenys iš Realtime DB...');
  
  // Išvalyti senus markers
  leafletMarkers.forEach(marker => marker.remove());
  leafletMarkers = [];

  const data = snapshot.val();
  
  if (!data) {
    console.log('⚠️ Duomenų nėra');
    markers = [];
    document.getElementById('marker-count').textContent = 'Žymų nėra';
    updateMarkerList([]);
    return;
  }

  
  markers = Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));

  console.log(' Gauta žymų:', markers.length);

  // Atnaujinti statistiką
  document.getElementById('marker-count').textContent = 
    `Viso žymų: ${markers.length}`;

  // Pridėti markers į žemėlapį
  markers.forEach(marker => {
    const leafletMarker = L.marker(
      [marker.lat, marker.lon],
      { 
        icon: createCustomIcon(getMarkerColor(marker.roadCondition)),
        markerId: marker.id
      }
    )
    .bindPopup(createPopupContent(marker))
    .addTo(map);

    leafletMarkers.push(leafletMarker);

    // Jei buvo aktyvus, atidaryti popup
    if (activeMarkerId === marker.id) {
      leafletMarker.openPopup();
    }
  });

  // Atnaujinti sąrašą
  updateMarkerList(markers);

  // Jei yra žymų, centruoti žemėlapį į jas
  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}, (error) => {
  console.error('❌ Realtime DB klaida:', error);
  document.getElementById('marker-list').innerHTML = 
    '<div class="loading"><p style="color: #f44336;">Klaida: ' + error.message + '</p></div>';
});