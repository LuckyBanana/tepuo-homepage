/**
 * Supabase Client Module
 * 
 * This module provides a client for interacting with the Supabase REST API.
 * It handles all data fetching operations for collections, jewelry items,
 * and sales points with built-in error handling and sessionStorage caching.
 * 
 * Requirements: 3.5, 5.3, 9.3, 8.1 (Performance)
 */

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * SupabaseClient class for managing API interactions with Supabase
 */
export class SupabaseClient {
  /**
   * Create a new SupabaseClient instance
   * 
   * @param {string} supabaseUrl - The Supabase project URL
   * @param {string} anonKey - The Supabase anonymous/public API key
   * @param {boolean} enableCache - Enable sessionStorage caching (default: true)
   */
  constructor(supabaseUrl, anonKey, enableCache = true) {
    if (!supabaseUrl || !anonKey) {
      throw new Error('SupabaseClient requires both supabaseUrl and anonKey');
    }
    
    this.supabaseUrl = supabaseUrl;
    this.anonKey = anonKey;
    this.baseUrl = `${supabaseUrl}/rest/v1`;
    this.enableCache = enableCache;
    this.cachePrefix = 'tepuo_cache_';
  }

  /**
   * Get cached data from sessionStorage if available and not expired
   * 
   * @private
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if not found/expired
   */
  getCachedData(key) {
    if (!this.enableCache) return null;

    try {
      const cacheKey = this.cachePrefix + key;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_TTL) {
        console.log(`Cache hit for ${key}`);
        return data;
      }

      // Cache expired, remove it
      sessionStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Store data in sessionStorage cache
   * 
   * @private
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCachedData(key, data) {
    if (!this.enableCache) return;

    try {
      const cacheKey = this.cachePrefix + key;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Cached data for ${key}`);
    } catch (error) {
      console.warn('Error writing to cache:', error);
      // If sessionStorage is full or unavailable, continue without caching
    }
  }

  /**
   * Clear all cached data
   * 
   * @public
   */
  clearCache() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('Cache cleared');
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Fetch all collections from the collections table
   * 
   * @returns {Promise<Array>} Array of collection objects
   * @throws {Error} If the fetch operation fails
   */
  async fetchCollections() {
    const cacheKey = 'collections';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = await this.fetch('/collections?select=*');
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Fetch all jewelry items from the jewelry table
   * 
   * @returns {Promise<Array>} Array of jewelry objects
   * @throws {Error} If the fetch operation fails
   */
  async fetchJewelry() {
    const cacheKey = 'jewelry';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = await this.fetch('/jewelry?select=*');
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Fetch all sales points from the sales_points table
   * 
   * @returns {Promise<Array>} Array of sales point objects
   * @throws {Error} If the fetch operation fails
   */
  async fetchSalesPoints() {
    const cacheKey = 'sales_points';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = await this.fetch('/sales_points?select=*');
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Private helper method to perform fetch requests to Supabase REST API
   * 
   * @private
   * @param {string} endpoint - The API endpoint (e.g., '/collections?select=*')
   * @param {RequestInit} options - Optional fetch options
   * @returns {Promise<any>} The parsed JSON response
   * @throws {Error} If the request fails or returns an error status
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Set up headers with Supabase authentication
    const headers = {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Supabase API error: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        );
      }

      // Parse and return the JSON response
      const data = await response.json();
      return data;

    } catch (error) {
      // Handle network errors and other exceptions
      this.handleError(error);
      throw error; // Re-throw after logging
    }
  }

  /**
   * Handle and log errors from API requests
   * 
   * @private
   * @param {Error} error - The error object to handle
   */
  handleError(error) {
    // Log error for debugging
    console.error('SupabaseClient Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // In a production environment, you might want to send errors
    // to a monitoring service here
  }
}
