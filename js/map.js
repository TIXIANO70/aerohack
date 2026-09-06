/**
 * @file map.js
 * @description Integración y renderizado lazy del mapa interactivo de Villa Santa Rita con Leaflet.js.
 */

const VILLA_SANTA_RITA_COORDS = [-34.6168, -58.4830];
const MAP_INITIAL_ZOOM = 15;
const MAP_MAX_ZOOM = 18;

// Puntos de interés y zonas críticas basados en la bitácora del proyecto
const MAP_LOCATIONS = [
  {
    coords: [-34.6163, -58.4812],
    title: 'Cuadra Piloto: Terrero y J.A. García',
    desc: 'Propuesta de intervención integral: jardines de lluvia en esquinas, veredas permeables y terraza demostrativa.',
    tag: 'Intervención Piloto',
    isPrimary: true,
  },
  {
    coords: [-34.6135, -58.4860],
    title: 'Av. Álvarez Jonte y Cuenca',
    desc: 'Punto crítico de saturación y anegamiento superficial reportado durante temporales extremos (Oct. 2025).',
    tag: 'Zona Crítica de Anegamiento',
    isPrimary: false,
  },
  {
    coords: [-34.6190, -58.4802],
    title: 'Av. Nazca y Elpidio González',
    desc: 'Eje de alta impermeabilización con escurrimiento acelerado hacia desagües pluviales saturados.',
    tag: 'Escorrentía Severa',
    isPrimary: false,
  },
  {
    coords: [-34.6180, -58.4852],
    title: 'Plaza de Villa Santa Rita',
    desc: 'Espacio verde barrial existente. Evidencia el déficit estructural (apenas 0,01 m² de verde por habitante).',
    tag: 'Espacio Verde Existente',
    isPrimary: false,
  },
];

/**
 * Crea un icono SVG personalizado para Leaflet.
 * @param {boolean} isPrimary
 */
function createCustomPin(isPrimary) {
  const pinColor = isPrimary ? '#2dd4bf' : '#38bdf8';
  const glowColor = isPrimary ? 'rgba(45, 212, 191, 0.4)' : 'rgba(56, 189, 248, 0.25)';

  const innerSvg = isPrimary
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pinColor}" stroke-width="2.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="${pinColor}"/></svg>`
    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="${pinColor}"><circle cx="12" cy="12" r="6"/></svg>`;

  const html = `
    <div style="
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #0c111d;
      border: 2px solid ${pinColor};
      box-shadow: 0 0 12px ${glowColor};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${innerSvg}
    </div>
  `;

  return window.L.divIcon({
    className: 'custom-map-pin',
    html: html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

/**
 * Inicializa la instancia del mapa Leaflet.
 */
function buildMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || !window.L) return;

  const map = window.L.map('map-container', {
    scrollWheelZoom: false, // Evita atrapar el scroll de página accidentalmente
  }).setView(VILLA_SANTA_RITA_COORDS, MAP_INITIAL_ZOOM);

  // Tiles de CartoDB Dark Matter (open source, oscuros y sin requerir API key)
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: MAP_MAX_ZOOM,
  }).addTo(map);

  // Añadir marcadores
  MAP_LOCATIONS.forEach((item) => {
    const icon = createCustomPin(item.isPrimary);
    const popupContent = `
      <div class="custom-popup">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <span class="popup-tag">${item.tag}</span>
      </div>
    `;

    const marker = window.L.marker(item.coords, { icon: icon }).addTo(map);
    marker.bindPopup(popupContent);

    // Abrir por defecto el popup de la cuadra piloto
    if (item.isPrimary) {
      marker.openPopup();
    }
  });
}

/**
 * Configura la carga diferida (lazy load) del mapa mediante IntersectionObserver.
 */
export function initMap() {
  const mapSection = document.getElementById('mapa');
  if (!mapSection) return;

  const mapObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          buildMap();
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '150px' }
  );

  mapObserver.observe(mapSection);
}
