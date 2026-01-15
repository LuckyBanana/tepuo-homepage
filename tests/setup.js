/**
 * Test setup file for Vitest
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import { beforeEach, afterEach } from 'vitest';

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Set up any global test utilities or mocks here
beforeEach(() => {
  // Reset any global state if needed
});
