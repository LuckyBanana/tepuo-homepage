/**
 * Supabase Client Module
 *
 * This module provides a client for interacting with the Supabase REST API.
 * It handles all data fetching operations for collections, jewelry items,
 * and sales points with built-in error handling and sessionStorage caching.
 *
 * Requirements: 3.5, 5.3, 9.3, 8.1 (Performance)
 */

import { CONFIG } from './config.js';

// Request timeout in milliseconds (15 seconds)
const REQUEST_TIMEOUT = 15000;

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
    this.cacheTTL = CONFIG.cache.ttl;
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

      if (now - timestamp < this.cacheTTL) {
        return data;
      }

      sessionStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      // Silently ignore cache clearing errors
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

    const headers = {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Supabase API error: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        );
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Failed to fetch: la requête a expiré. Veuillez réessayer.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
