/**
 * Points de Vente Page Logic Module
 *
 * This module handles the interactive map display of sales points on the
 * points-vente.html page. It fetches sales points from Supabase, initializes
 * a Leaflet map, and adds markers with popups for each location.
 *
 * Requirements: 5.2, 6.2, 6.3, 6.4, 9.4
 */

import { CONFIG } from './config.js';
import { SupabaseClient } from './supabase-client.js';
import { displayErrorMessage, hideLoadingState, classifyError, initReloadButtons } from './ui-utils.js';

// Initialize Supabase client
const supabase = new SupabaseClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

// Store map instance globally for access across functions
let mapInstance = null;

/**
 * Fetch all sales points from Supabase
 *
 * @returns {Promise<Array>} Array of sales point objects
 * @throws {Error} If the fetch operation fails
 */
async function fetchSalesPoints() {
  return await supabase.fetchSalesPoints();
}

/**
 * Initialize the Leaflet map
 *
 * Creates a new Leaflet map instance centered on the default location
 * with OpenStreetMap tiles. The map supports zooming and panning.
 *
 * @returns {L.Map|null} The initialized Leaflet map instance, or null if Leaflet is unavailable
 */
function initMap() {
  if (typeof L === 'undefined') {
    displayErrorMessage(
      'La carte ne peut pas être chargée. Veuillez vérifier votre connexion internet et réessayer.',
      { hideIds: ['map-container'] }
    );
    return null;
  }

  // Create map instance centered on default location
  const map = L.map('map').setView(
    CONFIG.map.defaultCenter,
    CONFIG.map.defaultZoom
  );

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 3
  }).addTo(map);

  return map;
}

/**
 * Add markers to the map for each sales point
 *
 * Creates a marker for each sales point at its coordinates and adds
 * a popup with the sales point information. If there are multiple
 * sales points, the map will automatically adjust to show all markers.
 *
 * @param {L.Map} map - The Leaflet map instance
 * @param {Array} salesPoints - Array of sales point objects
 * @returns {void}
 */
function addMarkers(map, salesPoints) {
  if (!salesPoints || salesPoints.length === 0) {
    return;
  }

  // Array to store all marker coordinates for bounds calculation
  const markerCoordinates = [];

  // Create a marker for each sales point
  salesPoints.forEach(salesPoint => {
    // Validate coordinates (explicit null check to allow 0 as valid)
    if (salesPoint.latitude == null || salesPoint.longitude == null) {
      return;
    }

    const lat = parseFloat(salesPoint.latitude);
    const lng = parseFloat(salesPoint.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    const coordinates = [lat, lng];
    markerCoordinates.push(coordinates);

    // Create marker
    const marker = L.marker(coordinates);

    // Create and bind popup using DOM construction (safe from XSS)
    const popupContent = createMarkerPopup(salesPoint);
    marker.bindPopup(popupContent);

    // Add marker to map
    marker.addTo(map);
  });

  // Adjust map bounds to show all markers if there are multiple points
  if (markerCoordinates.length > 1) {
    const bounds = L.latLngBounds(markerCoordinates);
    map.fitBounds(bounds, {
      padding: [50, 50], // Add padding around the bounds
      maxZoom: 12 // Don't zoom in too much
    });
  } else if (markerCoordinates.length === 1) {
    // Center on single marker with appropriate zoom
    map.setView(markerCoordinates[0], 13);
  }
}

/**
 * Create DOM content for a marker popup (XSS-safe)
 *
 * @param {Object} salesPoint - Sales point object with name, address, etc.
 * @returns {HTMLElement} DOM element for the popup content
 */
function createMarkerPopup(salesPoint) {
  const container = document.createElement('div');
  container.className = 'marker-popup';

  const title = document.createElement('h3');
  title.className = 'popup-title';
  title.textContent = salesPoint.name;
  container.appendChild(title);

  if (salesPoint.address) {
    const address = document.createElement('p');
    address.className = 'popup-address';
    address.textContent = salesPoint.address;
    container.appendChild(address);
  }

  return container;
}

/**
 * Render the sales points list below the map (XSS-safe DOM construction)
 *
 * @param {Array} salesPoints - Array of sales point objects
 * @returns {void}
 */
function renderSalesPointsList(salesPoints) {
  const listContainer = document.getElementById('sales-points-items');

  if (!listContainer) {
    return;
  }

  // Clear existing content
  listContainer.innerHTML = '';

  // Check if there are any sales points
  if (!salesPoints || salesPoints.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">Aucun point de vente disponible pour le moment.</p>
      </div>
    `;
    return;
  }

  // Create list items for each sales point using DOM construction
  salesPoints.forEach(salesPoint => {
    const listItem = document.createElement('article');
    listItem.className = 'sales-point-card';
    listItem.setAttribute('data-sales-point-id', salesPoint.id);

    const nameEl = document.createElement('h3');
    nameEl.className = 'sales-point-name';
    nameEl.textContent = salesPoint.name;
    listItem.appendChild(nameEl);

    if (salesPoint.address) {
      const addressEl = document.createElement('p');
      addressEl.className = 'sales-point-address';
      addressEl.textContent = salesPoint.address;
      listItem.appendChild(addressEl);
    }

    if (salesPoint.latitude != null && salesPoint.longitude != null) {
      const lat = parseFloat(salesPoint.latitude);
      const lng = parseFloat(salesPoint.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const button = document.createElement('button');
        button.className = 'locate-button';
        button.textContent = 'Voir sur la carte';
        button.addEventListener('click', () => {
          if (mapInstance) {
            mapInstance.setView([lat, lng], 15);

            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
              mapContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
        });
        listItem.appendChild(button);
      }
    }

    listContainer.appendChild(listItem);
  });
}

/**
 * Initialize the points de vente page
 *
 * @returns {Promise<void>}
 */
async function initPointsVentePage() {
  try {
    // Initialize the map first
    mapInstance = initMap();

    if (!mapInstance) {
      return;
    }

    // Fetch sales points from Supabase
    const salesPoints = await fetchSalesPoints();

    // Hide loading state
    hideLoadingState();

    // Check if we have any sales points
    if (!salesPoints || salesPoints.length === 0) {
      // Still show the map, just without markers
      renderSalesPointsList([]);
      return;
    }

    // Add markers to the map
    addMarkers(mapInstance, salesPoints);

    // Render the sales points list
    renderSalesPointsList(salesPoints);

  } catch (error) {
    console.error('Error initializing points de vente page:', error);

    const userMessage = classifyError(
      error,
      'Impossible de charger la carte des points de vente. Veuillez réessayer plus tard.'
    );

    displayErrorMessage(userMessage, { hideIds: ['map-container', 'sales-points-list'] });
  }
}

// Initialize the page when DOM is ready (only in browser environment)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReloadButtons();
      initPointsVentePage();
    });
  } else {
    initReloadButtons();
    initPointsVentePage();
  }
}

// Export functions for testing
export {
  fetchSalesPoints,
  initMap,
  addMarkers,
  createMarkerPopup,
  renderSalesPointsList,
  initPointsVentePage
};
