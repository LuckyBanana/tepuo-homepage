/**
 * Shared UI Utilities Module
 *
 * Common UI functions used across bijoux.js and points-vente.js.
 * Centralizes error display, loading state management, and error classification.
 */

/**
 * Display an error message to the user
 *
 * @param {string} message - The error message to display
 * @param {Object} [options] - Optional elements to hide
 * @param {string[]} [options.hideIds] - IDs of elements to hide when showing error
 */
export function displayErrorMessage(message, options = {}) {
  const loadingState = document.getElementById('loading-state');
  const errorContainer = document.getElementById('error-container');

  if (loadingState) {
    loadingState.style.display = 'none';
  }

  // Hide additional elements if specified
  if (options.hideIds) {
    options.hideIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
      }
    });
  }

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
 */
export function hideLoadingState() {
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.style.display = 'none';
  }
}

/**
 * Classify an error into a user-friendly message
 *
 * @param {Error} error - The error to classify
 * @param {string} defaultMessage - Default message if no specific match
 * @returns {string} User-friendly error message
 */
export function classifyError(error, defaultMessage) {
  if (error instanceof TypeError || (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')))) {
    return 'Problème de connexion. Vérifiez votre connexion internet.';
  }
  if (error.message && error.message.includes('Supabase API error')) {
    return 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.';
  }
  if (error.message && error.message.includes('requires both supabaseUrl and anonKey')) {
    return 'Erreur de configuration. Veuillez contacter le support.';
  }
  return defaultMessage;
}

/**
 * Initialize reload buttons (replaces inline onclick="location.reload()")
 * Buttons with data-action="reload" will reload the page on click.
 */
export function initReloadButtons() {
  document.querySelectorAll('[data-action="reload"]').forEach(button => {
    button.addEventListener('click', () => location.reload());
  });
}
