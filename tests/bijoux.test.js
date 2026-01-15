/**
 * Unit tests for bijoux.js module
 * 
 * Tests the core functionality of the jewelry page including:
 * - Grouping jewelry by collection
 * - Rendering collections
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { groupJewelryByCollection, renderCollections } from '../scripts/bijoux.js';

describe('Bijoux Page - groupJewelryByCollection', () => {
  it('should correctly group jewelry items by their collection', () => {
    const collections = [
      { id: 'col-1', name: 'Collection A', description: 'Description A' },
      { id: 'col-2', name: 'Collection B', description: 'Description B' }
    ];
    
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', collection_id: 'col-1', image_url: 'url1' },
      { id: 'jew-2', name: 'Item 2', collection_id: 'col-1', image_url: 'url2' },
      { id: 'jew-3', name: 'Item 3', collection_id: 'col-2', image_url: 'url3' }
    ];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(2);
    expect(result.get(collections[0])).toHaveLength(2);
    expect(result.get(collections[1])).toHaveLength(1);
    expect(result.get(collections[0])[0].name).toBe('Item 1');
    expect(result.get(collections[0])[1].name).toBe('Item 2');
    expect(result.get(collections[1])[0].name).toBe('Item 3');
  });
  
  it('should exclude collections with no jewelry items', () => {
    const collections = [
      { id: 'col-1', name: 'Collection A', description: 'Description A' },
      { id: 'col-2', name: 'Collection B', description: 'Description B' },
      { id: 'col-3', name: 'Collection C', description: 'Description C' }
    ];
    
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', collection_id: 'col-1', image_url: 'url1' },
      { id: 'jew-2', name: 'Item 2', collection_id: 'col-2', image_url: 'url2' }
    ];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(2);
    expect(result.has(collections[2])).toBe(false);
  });
  
  it('should handle jewelry items without collection_id', () => {
    const collections = [
      { id: 'col-1', name: 'Collection A', description: 'Description A' }
    ];
    
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', collection_id: 'col-1', image_url: 'url1' },
      { id: 'jew-2', name: 'Item 2', collection_id: null, image_url: 'url2' },
      { id: 'jew-3', name: 'Item 3', image_url: 'url3' } // No collection_id
    ];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(1);
    expect(result.get(collections[0])).toHaveLength(1);
    expect(result.get(collections[0])[0].name).toBe('Item 1');
  });
  
  it('should handle jewelry items with non-existent collection_id', () => {
    const collections = [
      { id: 'col-1', name: 'Collection A', description: 'Description A' }
    ];
    
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', collection_id: 'col-1', image_url: 'url1' },
      { id: 'jew-2', name: 'Item 2', collection_id: 'col-999', image_url: 'url2' }
    ];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(1);
    expect(result.get(collections[0])).toHaveLength(1);
  });
  
  it('should return empty Map when no jewelry items exist', () => {
    const collections = [
      { id: 'col-1', name: 'Collection A', description: 'Description A' }
    ];
    
    const jewelry = [];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(0);
  });
  
  it('should return empty Map when no collections exist', () => {
    const collections = [];
    
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', collection_id: 'col-1', image_url: 'url1' }
    ];
    
    const result = groupJewelryByCollection(jewelry, collections);
    
    expect(result.size).toBe(0);
  });
});

describe('Bijoux Page - renderCollections', () => {
  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <div id="collections-container"></div>
    `;
  });
  
  it('should render collections with their jewelry items', () => {
    const collection = { id: 'col-1', name: 'Collection A', description: 'Description A' };
    const jewelry = [
      { id: 'jew-1', name: 'Item 1', description: 'Desc 1', image_url: 'url1' },
      { id: 'jew-2', name: 'Item 2', description: 'Desc 2', image_url: 'url2' }
    ];
    
    const groupedData = new Map();
    groupedData.set(collection, jewelry);
    
    renderCollections(groupedData);
    
    const container = document.getElementById('collections-container');
    expect(container.children.length).toBe(1);
    
    const collectionSection = container.querySelector('[data-collection-id="col-1"]');
    expect(collectionSection).toBeTruthy();
    
    const collectionTitle = collectionSection.querySelector('.collection-title');
    expect(collectionTitle.textContent).toBe('Collection A');
    
    const jewelryCards = collectionSection.querySelectorAll('.jewelry-card');
    expect(jewelryCards.length).toBe(2);
  });
  
  it('should display empty state when no collections exist', () => {
    const groupedData = new Map();
    
    renderCollections(groupedData);
    
    const container = document.getElementById('collections-container');
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Aucune collection disponible');
  });
  
  it('should render jewelry cards with correct attributes', () => {
    const collection = { id: 'col-1', name: 'Collection A', description: 'Description A' };
    const jewelry = [
      { id: 'jew-1', name: 'Test Jewelry', description: 'Test Description', image_url: 'test.jpg' }
    ];
    
    const groupedData = new Map();
    groupedData.set(collection, jewelry);
    
    renderCollections(groupedData);
    
    const jewelryCard = document.querySelector('[data-jewelry-id="jew-1"]');
    expect(jewelryCard).toBeTruthy();
    
    const image = jewelryCard.querySelector('.jewelry-image');
    expect(image.src).toContain('test.jpg');
    expect(image.alt).toBe('Test Jewelry');
    expect(image.loading).toBe('lazy');
    
    const name = jewelryCard.querySelector('.jewelry-name');
    expect(name.textContent).toBe('Test Jewelry');
    
    const description = jewelryCard.querySelector('.jewelry-description');
    expect(description.textContent).toBe('Test Description');
  });
  
  it('should handle jewelry without description', () => {
    const collection = { id: 'col-1', name: 'Collection A' };
    const jewelry = [
      { id: 'jew-1', name: 'Test Jewelry', image_url: 'test.jpg' }
    ];
    
    const groupedData = new Map();
    groupedData.set(collection, jewelry);
    
    renderCollections(groupedData);
    
    const jewelryCard = document.querySelector('[data-jewelry-id="jew-1"]');
    const description = jewelryCard.querySelector('.jewelry-description');
    expect(description).toBeFalsy();
  });
  
  it('should handle collection without description', () => {
    const collection = { id: 'col-1', name: 'Collection A' };
    const jewelry = [
      { id: 'jew-1', name: 'Test Jewelry', image_url: 'test.jpg' }
    ];
    
    const groupedData = new Map();
    groupedData.set(collection, jewelry);
    
    renderCollections(groupedData);
    
    const collectionSection = document.querySelector('[data-collection-id="col-1"]');
    const description = collectionSection.querySelector('.collection-description');
    expect(description).toBeFalsy();
  });
  
  it('should render multiple collections', () => {
    const collection1 = { id: 'col-1', name: 'Collection A', description: 'Desc A' };
    const collection2 = { id: 'col-2', name: 'Collection B', description: 'Desc B' };
    
    const jewelry1 = [
      { id: 'jew-1', name: 'Item 1', image_url: 'url1' }
    ];
    const jewelry2 = [
      { id: 'jew-2', name: 'Item 2', image_url: 'url2' }
    ];
    
    const groupedData = new Map();
    groupedData.set(collection1, jewelry1);
    groupedData.set(collection2, jewelry2);
    
    renderCollections(groupedData);
    
    const container = document.getElementById('collections-container');
    expect(container.children.length).toBe(2);
    
    expect(document.querySelector('[data-collection-id="col-1"]')).toBeTruthy();
    expect(document.querySelector('[data-collection-id="col-2"]')).toBeTruthy();
  });
});
