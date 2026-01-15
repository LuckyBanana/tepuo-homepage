/**
 * Bijoux Page Logic Module
 * 
 * This module handles the dynamic loading and rendering of jewelry collections
 * on the bijoux.html page. It fetches data from Supabase, groups jewelry by
 * collection, and renders the HTML dynamically.
 * 
 * Requirements: 3.3, 4.1, 4.2, 4.3, 9.4
 */

import { CONFIG } from './config.js';
import { SupabaseClient } from './supabase-client.js';

// Initialize Supabase client
const supabase = new SupabaseClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

/**
 * Fetch all collections from Supabase
 * 
 * @returns {Promise<Array>} Array of collection objects
 * @throws {Error} If the fetch operation fails
 */
async function fetchCollections() {
  return await supabase.fetchCollections();
}

/**
 * Fetch all jewelry items from Supabase
 * 
 * @returns {Promise<Array>} Array of jewelry objects
 * @throws {Error} If the fetch operation fails
 */
async function fetchJewelry() {
  return await supabase.fetchJewelry();
}

/**
 * Group jewelry items by their collection
 * 
 * This function takes arrays of jewelry and collections and creates a Map
 * where each collection is a key and the value is an array of jewelry items
 * belonging to that collection. Collections with no jewelry items are excluded.
 * 
 * @param {Array} jewelry - Array of jewelry objects with collection_id property
 * @param {Array} collections - Array of collection objects with id property
 * @returns {Map<Object, Array>} Map of collections to their jewelry items
 */
function groupJewelryByCollection(jewelry, collections) {
  // Create a Map to store the grouped data
  const groupedData = new Map();
  
  // Create a lookup map for collections by ID for efficient access
  const collectionsById = new Map();
  collections.forEach(collection => {
    collectionsById.set(collection.id, collection);
  });
  
  // Group jewelry items by collection
  jewelry.forEach(item => {
    // Skip items without a collection_id
    if (!item.collection_id) {
      return;
    }
    
    // Find the collection for this jewelry item
    const collection = collectionsById.get(item.collection_id);
    
    // Skip if collection doesn't exist
    if (!collection) {
      return;
    }
    
    // Add the jewelry item to the collection's array
    if (!groupedData.has(collection)) {
      groupedData.set(collection, []);
    }
    groupedData.get(collection).push(item);
  });
  
  return groupedData;
}

/**
 * Render collections and their jewelry items as HTML
 * 
 * This function takes the grouped data and generates HTML elements to display
 * the collections and their jewelry items. It creates collection sections with
 * jewelry cards for each item.
 * 
 * @param {Map<Object, Array>} groupedData - Map of collections to jewelry items
 * @returns {void}
 */
function renderCollections(groupedData) {
  const container = document.getElementById('collections-container');
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Check if there are any collections to display
  if (groupedData.size === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">Aucune collection disponible pour le moment.</p>
        <p class="empty-state-subtext">Revenez bientôt pour découvrir nos créations.</p>
      </div>
    `;
    return;
  }
  
  // Render each collection and its jewelry items
  groupedData.forEach((jewelryItems, collection) => {
    // Create collection section
    const collectionSection = document.createElement('section');
    collectionSection.className = 'collection-section';
    collectionSection.setAttribute('data-collection-id', collection.id);
    
    // Create collection header
    const collectionHeader = document.createElement('div');
    collectionHeader.className = 'collection-header';
    
    const collectionTitle = document.createElement('h2');
    collectionTitle.className = 'collection-title';
    collectionTitle.textContent = collection.name;
    
    collectionHeader.appendChild(collectionTitle);
    
    // Add collection description if available
    if (collection.description) {
      const collectionDescription = document.createElement('p');
      collectionDescription.className = 'collection-description';
      collectionDescription.textContent = collection.description;
      collectionHeader.appendChild(collectionDescription);
    }
    
    collectionSection.appendChild(collectionHeader);
    
    // Create jewelry grid
    const jewelryGrid = document.createElement('div');
    jewelryGrid.className = 'jewelry-grid';
    
    // Render each jewelry item
    jewelryItems.forEach(item => {
      const jewelryCard = createJewelryCard(item);
      jewelryGrid.appendChild(jewelryCard);
    });
    
    collectionSection.appendChild(jewelryGrid);
    container.appendChild(collectionSection);
  });
}

/**
 * Create a jewelry card element
 * 
 * @private
 * @param {Object} jewelry - Jewelry object with name, description, image_url
 * @returns {HTMLElement} The jewelry card element
 */
function createJewelryCard(jewelry) {
  const card = document.createElement('article');
  card.className = 'jewelry-card';
  card.setAttribute('data-jewelry-id', jewelry.id);
  
  // Create image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'jewelry-image-container';
  
  const image = document.createElement('img');
  image.className = 'jewelry-image';
  image.src = jewelry.image_url;
  image.alt = jewelry.name || 'Bijou artisanal Te Puo';
  image.loading = 'lazy'; // Enable lazy loading for performance
  
  // Add error handling for broken images
  image.onerror = function() {
    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23C4A57B" width="400" height="400"/%3E%3Ctext fill="%235D4E37" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
    this.alt = 'Image non disponible';
  };
  
  imageContainer.appendChild(image);
  card.appendChild(imageContainer);
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'jewelry-content';
  
  // Add jewelry name
  const name = document.createElement('h3');
  name.className = 'jewelry-name';
  name.textContent = jewelry.name || 'Sans nom';
  content.appendChild(name);
  
  // Add jewelry description if available
  if (jewelry.description) {
    const description = document.createElement('p');
    description.className = 'jewelry-description';
    description.textContent = jewelry.description;
    content.appendChild(description);
  }
  
  card.appendChild(content);
  
  return card;
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
  
  // Hide loading state
  if (loadingState) {
    loadingState.style.display = 'none';
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
 * Initialize the bijoux page
 * 
 * This is the main orchestration function that:
 * 1. Fetches collections and jewelry from Supabase
 * 2. Groups jewelry by collection
 * 3. Renders the collections on the page
 * 4. Handles errors gracefully
 * 
 * @returns {Promise<void>}
 */
async function initBijouxPage() {
  try {
    // Fetch data from Supabase
    const [collections, jewelry] = await Promise.all([
      fetchCollections(),
      fetchJewelry()
    ]);
    
    // Group jewelry by collection
    const groupedData = groupJewelryByCollection(jewelry, collections);
    
    // Hide loading state
    hideLoadingState();
    
    // Render the collections
    renderCollections(groupedData);
    
  } catch (error) {
    console.error('Error initializing bijoux page:', error);
    
    // Determine user-friendly error message based on error type
    let userMessage = 'Impossible de charger les collections. Veuillez réessayer plus tard.';
    
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
    document.addEventListener('DOMContentLoaded', initBijouxPage);
  } else {
    // DOM is already ready
    initBijouxPage();
  }
}

// Export functions for testing
export {
  fetchCollections,
  fetchJewelry,
  groupJewelryByCollection,
  renderCollections,
  initBijouxPage
};
