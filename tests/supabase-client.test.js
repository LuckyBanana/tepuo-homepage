/**
 * Unit tests for SupabaseClient
 * 
 * Tests the Supabase client module functionality including:
 * - Constructor validation
 * - Fetch methods for collections, jewelry, and sales points
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseClient } from '../scripts/supabase-client.js';

describe('SupabaseClient', () => {
  const mockUrl = 'https://test.supabase.co';
  const mockKey = 'test-anon-key';
  let client;

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    // Create client with caching disabled for most tests
    client = new SupabaseClient(mockUrl, mockKey, false);
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with valid url and key', () => {
      expect(client).toBeInstanceOf(SupabaseClient);
      expect(client.supabaseUrl).toBe(mockUrl);
      expect(client.anonKey).toBe(mockKey);
      expect(client.baseUrl).toBe(`${mockUrl}/rest/v1`);
    });

    it('should throw error when url is missing', () => {
      expect(() => new SupabaseClient(null, mockKey)).toThrow(
        'SupabaseClient requires both supabaseUrl and anonKey'
      );
    });

    it('should throw error when anonKey is missing', () => {
      expect(() => new SupabaseClient(mockUrl, null)).toThrow(
        'SupabaseClient requires both supabaseUrl and anonKey'
      );
    });

    it('should throw error when both parameters are missing', () => {
      expect(() => new SupabaseClient()).toThrow(
        'SupabaseClient requires both supabaseUrl and anonKey'
      );
    });
  });

  describe('fetchCollections', () => {
    it('should fetch collections successfully', async () => {
      const mockCollections = [
        { id: '1', name: 'Collection A', description: 'Desc A' },
        { id: '2', name: 'Collection B', description: 'Desc B' }
      ];

      // Mock the global fetch function
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCollections
      });

      const result = await client.fetchCollections();

      expect(result).toEqual(mockCollections);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/collections?select=*`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': mockKey,
            'Authorization': `Bearer ${mockKey}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(client.fetchCollections()).rejects.toThrow('Network error');
    });

    it('should handle non-ok response status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Table not found' })
      });

      await expect(client.fetchCollections()).rejects.toThrow(
        'Supabase API error: 404 Not Found'
      );
    });
  });

  describe('fetchJewelry', () => {
    it('should fetch jewelry items successfully', async () => {
      const mockJewelry = [
        { 
          id: '1', 
          name: 'Bracelet A', 
          description: 'Beautiful bracelet',
          image_url: 'https://example.com/image1.jpg',
          collection_id: 'col1'
        },
        { 
          id: '2', 
          name: 'Necklace B', 
          description: 'Elegant necklace',
          image_url: 'https://example.com/image2.jpg',
          collection_id: 'col1'
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJewelry
      });

      const result = await client.fetchJewelry();

      expect(result).toEqual(mockJewelry);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/jewelry?select=*`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': mockKey,
            'Authorization': `Bearer ${mockKey}`
          })
        })
      );
    });

    it('should handle empty jewelry array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      });

      const result = await client.fetchJewelry();

      expect(result).toEqual([]);
    });
  });

  describe('fetchSalesPoints', () => {
    it('should fetch sales points successfully', async () => {
      const mockSalesPoints = [
        { 
          id: '1', 
          name: 'Boutique Paris', 
          latitude: 48.8566,
          longitude: 2.3522,
          address: '123 Rue de Paris'
        },
        { 
          id: '2', 
          name: 'Boutique Lyon', 
          latitude: 45.7640,
          longitude: 4.8357,
          address: '456 Rue de Lyon'
        }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSalesPoints
      });

      const result = await client.fetchSalesPoints();

      expect(result).toEqual(mockSalesPoints);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/sales_points?select=*`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': mockKey,
            'Authorization': `Bearer ${mockKey}`
          })
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should rethrow errors from fetch', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(client.fetchCollections()).rejects.toThrow('Test error');
    });

    it('should handle response with invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(client.fetchCollections()).rejects.toThrow(
        'Supabase API error: 500 Internal Server Error'
      );
    });

    it('should include error message from response when available', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Access denied' })
      });

      await expect(client.fetchCollections()).rejects.toThrow(
        'Supabase API error: 403 Forbidden. Access denied'
      );
    });
  });

  describe('Custom fetch options', () => {
    it('should merge custom headers with default headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      });

      await client.fetch('/test', {
        headers: {
          'Custom-Header': 'custom-value'
        }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'apikey': mockKey,
            'Authorization': `Bearer ${mockKey}`,
            'Content-Type': 'application/json',
            'Custom-Header': 'custom-value'
          })
        })
      );
    });
  });

  describe('Caching functionality', () => {
    beforeEach(() => {
      sessionStorage.clear();
      // Create client with caching enabled
      client = new SupabaseClient(mockUrl, mockKey, true);
    });

    it('should cache collections data', async () => {
      const mockCollections = [
        { id: '1', name: 'Collection A', description: 'Desc A' }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCollections
      });

      // First call should fetch from API
      const result1 = await client.fetchCollections();
      expect(result1).toEqual(mockCollections);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await client.fetchCollections();
      expect(result2).toEqual(mockCollections);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should cache jewelry data', async () => {
      const mockJewelry = [
        { id: '1', name: 'Bracelet A', collection_id: 'col1' }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJewelry
      });

      // First call should fetch from API
      await client.fetchJewelry();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await client.fetchJewelry();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should cache sales points data', async () => {
      const mockSalesPoints = [
        { id: '1', name: 'Boutique Paris', latitude: 48.8566, longitude: 2.3522 }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSalesPoints
      });

      // First call should fetch from API
      await client.fetchSalesPoints();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await client.fetchSalesPoints();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear all cached data', async () => {
      const mockCollections = [{ id: '1', name: 'Collection A' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCollections
      });

      // Fetch and cache data
      await client.fetchCollections();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      client.clearCache();

      // Next fetch should call API again
      await client.fetchCollections();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not cache when caching is disabled', async () => {
      // Create client with caching disabled
      const noCacheClient = new SupabaseClient(mockUrl, mockKey, false);
      const mockCollections = [{ id: '1', name: 'Collection A' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCollections
      });

      // Both calls should fetch from API
      await noCacheClient.fetchCollections();
      await noCacheClient.fetchCollections();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
