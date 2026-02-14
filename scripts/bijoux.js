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
import { displayErrorMessage, hideLoadingState, classifyError, initReloadButtons } from './ui-utils.js';

// Initialize Supabase client
const supabase = new SupabaseClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

/**
 * Group jewelry items by their collection
 *
 * @param {Array} jewelry - Array of jewelry objects with collection_id property
 * @param {Array} collections - Array of collection objects with id property
 * @returns {Map<Object, Array>} Map of collections to their jewelry items
 */
function groupJewelryByCollection(jewelry, collections) {
  const groupedData = new Map();

  const collectionsById = new Map();
  collections.forEach(collection => {
    collectionsById.set(collection.id, collection);
  });

  jewelry.forEach(item => {
    if (!item.collection_id) {
      return;
    }

    const collection = collectionsById.get(item.collection_id);

    if (!collection) {
      return;
    }

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
 * @param {Map<Object, Array>} groupedData - Map of collections to jewelry items
 * @returns {void}
 */
function renderCollections(groupedData) {
  const container = document.getElementById('collections-container');

  if (!container) {
    return;
  }

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
    const collectionSection = document.createElement('section');
    collectionSection.className = 'collection-section';
    collectionSection.setAttribute('data-collection-id', collection.id);

    const collectionHeader = document.createElement('div');
    collectionHeader.className = 'collection-header';

    const collectionTitle = document.createElement('h2');
    collectionTitle.className = 'collection-title';
    collectionTitle.textContent = collection.name;

    collectionHeader.appendChild(collectionTitle);

    if (collection.description) {
      const collectionDescription = document.createElement('p');
      collectionDescription.className = 'collection-description';
      collectionDescription.textContent = collection.description;
      collectionHeader.appendChild(collectionDescription);
    }

    collectionSection.appendChild(collectionHeader);

    const jewelryGrid = document.createElement('div');
    jewelryGrid.className = 'jewelry-grid';

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

  const imageContainer = document.createElement('div');
  imageContainer.className = 'jewelry-image-container';

  const image = document.createElement('img');
  image.className = 'jewelry-image';
  image.src = jewelry.image_url;
  image.alt = jewelry.name || 'Bijou artisanal Tē Pūō';
  image.loading = 'lazy';

  // Add error handling for broken images (self-nullify to prevent loop)
  image.onerror = function() {
    this.onerror = null;
    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23C4A57B" width="400" height="400"/%3E%3Ctext fill="%235D4E37" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
    this.alt = 'Image non disponible';
  };

  imageContainer.appendChild(image);
  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'jewelry-content';

  const name = document.createElement('h3');
  name.className = 'jewelry-name';
  name.textContent = jewelry.name || 'Sans nom';
  content.appendChild(name);

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
 * Initialize the bijoux page
 *
 * @returns {Promise<void>}
 */
async function initBijouxPage() {
  try {
    const [collections, jewelry] = await Promise.all([
      supabase.fetchCollections(),
      supabase.fetchJewelry()
    ]);

    const groupedData = groupJewelryByCollection(jewelry, collections);

    hideLoadingState();

    renderCollections(groupedData);

  } catch (error) {
    console.error('Error initializing bijoux page:', error);

    const userMessage = classifyError(
      error,
      'Impossible de charger les collections. Veuillez réessayer plus tard.'
    );

    displayErrorMessage(userMessage);
  }
}

// Initialize the page when DOM is ready (only in browser environment)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReloadButtons();
      initBijouxPage();
    });
  } else {
    initReloadButtons();
    initBijouxPage();
  }
}

// Export functions for testing
export {
  groupJewelryByCollection,
  renderCollections,
  initBijouxPage
};
