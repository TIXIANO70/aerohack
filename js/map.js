/**
 * @file map.js
 * @description Integración y renderizado lazy del mapa interactivo de Villa Santa Rita con Leaflet.js.
 */

const VILLA_SANTA_RITA_COORDS = [-34.6168, -58.4830];
const MAP_INITIAL_ZOOM = 15;
const MAP_MAX_ZOOM = 18;

// Polígono oficial del perímetro de Villa Santa Rita (CABA)
// Delimitado por: Av. Álvarez Jonte, Condarco, Av. Gaona, Miranda y Joaquín V. González (~2,2 km²)
const VILLA_SANTA_RITA_POLYGON = [
  [-34.615007, -58.494789], [-34.615857, -58.49372], [-34.616719, -58.492642], [-34.617581, -58.491572],
  [-34.618343, -58.490612], [-34.618437, -58.490494], [-34.619215, -58.489524], [-34.619299, -58.489419],
  [-34.620063, -58.488456], [-34.620166, -58.488326], [-34.621005, -58.487266], [-34.62187, -58.486183],
  [-34.622728, -58.485112], [-34.623583, -58.484043], [-34.623959, -58.483572], [-34.624058, -58.483446],
  [-34.624104, -58.483388], [-34.624153, -58.483324], [-34.624527, -58.482862], [-34.624566, -58.482826],
  [-34.624599, -58.482804], [-34.624636, -58.482784], [-34.624595, -58.482687], [-34.624558, -58.482598],
  [-34.624223, -58.481792], [-34.623809, -58.48078], [-34.623371, -58.479747], [-34.623192, -58.479384],
  [-34.623145, -58.479293], [-34.62313, -58.479259], [-34.623068, -58.479133], [-34.622901, -58.478816],
  [-34.622436, -58.477921], [-34.621834, -58.476777], [-34.621699, -58.476514], [-34.621304, -58.475749],
  [-34.621161, -58.475472], [-34.620499, -58.47422], [-34.620334, -58.473899], [-34.620214, -58.473669],
  [-34.620066, -58.473385], [-34.619854, -58.472964], [-34.61915, -58.471673], [-34.619039, -58.471737],
  [-34.618108, -58.472473], [-34.617101, -58.473274], [-34.616136, -58.474039], [-34.616077, -58.474083],
  [-34.616023, -58.474125], [-34.615095, -58.474882], [-34.614098, -58.475669], [-34.613071, -58.476459],
  [-34.613001, -58.476514], [-34.612088, -58.477232], [-34.611092, -58.478043], [-34.610082, -58.478864],
  [-34.609572, -58.479263], [-34.60906, -58.479667], [-34.60893, -58.479772], [-34.608886, -58.479807],
  [-34.608573, -58.480054], [-34.608126, -58.480413], [-34.608146, -58.480525], [-34.608496, -58.481966],
  [-34.608812, -58.483198], [-34.608865, -58.483449], [-34.609017, -58.484053], [-34.609092, -58.484355],
  [-34.609165, -58.484643], [-34.609262, -58.484991], [-34.609351, -58.485375], [-34.609434, -58.485731],
  [-34.609514, -58.486072], [-34.609611, -58.486474], [-34.609933, -58.487773], [-34.609968, -58.487974],
  [-34.610065, -58.488447], [-34.610074, -58.48849], [-34.610081, -58.48852], [-34.610099, -58.488584],
  [-34.610129, -58.488657], [-34.610166, -58.488728], [-34.610202, -58.488783], [-34.610289, -58.488904],
  [-34.610591, -58.489272], [-34.611122, -58.489955], [-34.611245, -58.490118], [-34.611685, -58.490717],
  [-34.612079, -58.491231], [-34.612434, -58.491711], [-34.612736, -58.492115], [-34.61286, -58.492277],
  [-34.613318, -58.492839], [-34.613397, -58.492932], [-34.613423, -58.492959], [-34.613746, -58.493336],
  [-34.614423, -58.494063], [-34.615007, -58.494789]
];

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

// Clave pública para basemaps oscuros de CARTO
const DEFAULT_CARTO_API_KEY = 'cb1_2yk5_1_df335013d3ba1683ed6841b5';

/**
 * Inicializa la instancia del mapa Leaflet.
 */
async function buildMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || !window.L) return;

  // Carga defensiva de la API key desde config.js con fallback garantizado
  let apiKey = DEFAULT_CARTO_API_KEY;
  try {
    const config = await import('./config.js');
    if (config.CARTO_API_KEY && config.CARTO_API_KEY !== 'TU_API_KEY_AQUI') {
      apiKey = config.CARTO_API_KEY.trim();
    }
  } catch {
    // Si config.js no carga (ej. CORS en file://), mantiene la clave por defecto
  }

  const map = window.L.map('map-container', {
    scrollWheelZoom: false, // Evita atrapar el scroll de página accidentalmente
  }).setView(VILLA_SANTA_RITA_COORDS, MAP_INITIAL_ZOOM);

  const tileUrl = apiKey
    ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${apiKey}`
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';

  window.L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: MAP_MAX_ZOOM,
  }).addTo(map);

  // 1. Capa Poligonal: Perímetro de Sellado y Déficit Verde de Villa Santa Rita
  const districtPolygon = window.L.polygon(VILLA_SANTA_RITA_POLYGON, {
    color: '#f43f5e',
    weight: 2,
    dashArray: '6, 6',
    fillColor: '#f43f5e',
    fillOpacity: 0.08,
  }).addTo(map);

  districtPolygon.bindTooltip(`
    <div class="map-district-tooltip">
      <div class="tooltip-title">Perímetro de Villa Santa Rita</div>
      <div class="tooltip-metric"><span class="accent-danger">Déficit verde:</span> 0,01 m²/hab <small>(OMS: 9 m²)</small></div>
      <div class="tooltip-metric"><span class="accent-warning">Suelo impermeable:</span> > 95% asfalto y hormigón</div>
    </div>
  `, { sticky: true });

  // 2. Resaltado de Espacio Verde Existente (Contraste visual de escala 0,01 m²/hab)
  window.L.circle([-34.6180, -58.4852], {
    radius: 40,
    color: '#10b981',
    fillColor: '#10b981',
    fillOpacity: 0.75,
    weight: 2,
  }).addTo(map);

  // 3. Añadir marcadores
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

  // 4. Leyenda Interactiva Flotante (Glassmorphism)
  const legend = window.L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = window.L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="map-legend__header">Diagnóstico Territorial</div>
      <div class="map-legend__item">
        <span class="map-legend__swatch map-legend__swatch--sealed"></span>
        <span>Zona de Sellado (&gt;95% asfalto)</span>
      </div>
      <div class="map-legend__item">
        <span class="map-legend__swatch map-legend__swatch--green"></span>
        <span>Espacio Verde (0,01 m²/hab)</span>
      </div>
      <div class="map-legend__item">
        <span class="map-legend__swatch map-legend__swatch--primary"></span>
        <span>Cuadra Piloto (Santa Rita Verde)</span>
      </div>
      <div class="map-legend__item">
        <span class="map-legend__swatch map-legend__swatch--flood"></span>
        <span>Puntos Críticos de Anegamiento</span>
      </div>
    `;
    return div;
  };
  legend.addTo(map);
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
