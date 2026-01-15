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
 * @returns {L.Map} The initialized Leaflet map instance
 */
function initMap() {
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
    // Validate coordinates
    if (!salesPoint.latitude || !salesPoint.longitude) {
      console.warn('Sales point missing coordinates:', salesPoint);
      return;
    }

    const coordinates = [salesPoint.latitude, salesPoint.longitude];
    markerCoordinates.push(coordinates);

    // Create marker with custom icon (optional)
    const marker = L.marker(coordinates);

    // Create and bind popup
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
 * Create HTML content for a marker popup
 * 
 * Formats the sales point information into HTML for display in the
 * marker popup. Includes the name and address (if available).
 * 
 * @param {Object} salesPoint - Sales point object with name, address, etc.
 * @returns {string} HTML string for the popup content
 */
function createMarkerPopup(salesPoint) {
  let popupHtml = `
    <div class="marker-popup">
      <h3 class="popup-title">${salesPoint.name}</h3>
  `;

  // Add address if available
  if (salesPoint.address) {
    popupHtml += `
      <p class="popup-address">${salesPoint.address}</p>
    `;
  }

  popupHtml += `</div>`;

  return popupHtml;
}

/**
 * Render the sales points list below the map
 * 
 * Creates a list of sales points with their information for users
 * who prefer a list view or need additional accessibility.
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

  // Create list items for each sales point
  salesPoints.forEach(salesPoint => {
    const listItem = document.createElement('article');
    listItem.className = 'sales-point-item';
    listItem.setAttribute('data-sales-point-id', salesPoint.id);

    // Create content
    let itemHtml = `
      <h3 class="sales-point-name">${salesPoint.name}</h3>
    `;

    if (salesPoint.address) {
      itemHtml += `
        <p class="sales-point-address">${salesPoint.address}</p>
      `;
    }

    if (salesPoint.latitude && salesPoint.longitude) {
      itemHtml += `
        <button class="locate-button" data-lat="${salesPoint.latitude}" data-lng="${salesPoint.longitude}">
          Voir sur la carte
        </button>
      `;
    }

    listItem.innerHTML = itemHtml;
    listContainer.appendChild(listItem);
  });

  // Add click handlers for "Voir sur la carte" buttons
  const locateButtons = listContainer.querySelectorAll('.locate-button');
  locateButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lat = parseFloat(button.getAttribute('data-lat'));
      const lng = parseFloat(button.getAttribute('data-lng'));
      
      if (mapInstance && lat && lng) {
        mapInstance.setView([lat, lng], 15);
        
        // Scroll to map
        document.getElementById('map-container').scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Display an error message to the user
 * 
 * @param {string} message - The error message to display
 * @returns {void}
 */
function displayErrorMessage(message) {
  const loadingState = document.getElementById('loading-state');
  const errorContainer = document.getElementById('error-container');
  const mapContainer = document.getElementById('map-container');
  const salesPointsList = document.getElementById('sales-points-list');

  // Hide loading state
  if (loadingState) {
    loadingState.style.display = 'none';
  }

  // Hide map and list
  if (mapContainer) {
    mapContainer.style.display = 'none';
  }
  if (salesPointsList) {
    salesPointsList.style.display = 'none';
  }

  // Show error message
  if (errorContainer) {
    const errorText = errorContainer.querySelector('.error-text');
    if (errorText) {
      errorText.textContent = message;
    }
    errorContainer.style.display = 'block';
  }
}

/**
 * Hide the loading state
 * 
 * @returns {void}
 */
function hideLoadingState() {
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.style.display = 'none';
  }
}

/**
 * Initialize the points de vente page
 * 
 * This is the main orchestration function that:
 * 1. Initializes the Leaflet map
 * 2. Fetches sales points from Supabase
 * 3. Adds markers to the map
 * 4. Renders the sales points list
 * 5. Handles errors gracefully
 * 
 * @returns {Promise<void>}
 */
async function initPointsVentePage() {
  try {
    // Initialize the map first
    mapInstance = initMap();

    // Fetch sales points from Supabase
    const salesPoints = await fetchSalesPoints();

    // Hide loading state
    hideLoadingState();

    // Check if we have any sales points
    if (!salesPoints || salesPoints.length === 0) {
      console.warn('No sales points found');
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

    // Determine user-friendly error message based on error type
    let userMessage = 'Impossible de charger la carte des points de vente. Veuillez réessayer plus tard.';

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      userMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    } else if (error.message.includes('Supabase API error')) {
      userMessage = 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.';
    } else if (error.message.includes('requires both supabaseUrl and anonKey')) {
      userMessage = 'Erreur de configuration. Veuillez contacter le support.';
    }

    // Display error message to user
    displayErrorMessage(userMessage);
  }
}

// Initialize the page when DOM is ready (only in browser environment)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPointsVentePage);
  } else {
    // DOM is already ready
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
