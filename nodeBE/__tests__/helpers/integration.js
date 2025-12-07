/**
 * @author Bhavesh Venugopal
 * Integration Test Helpers
 * Provides utilities for setting up Express app for integration testing
 */

import { createApp } from '../../src/app.js';

/**
 * Create Express app for integration testing
 * Creates app with all middleware and routes
 * Note: Database and models are already initialized in __tests__/setup.js
 * @returns {Promise<Express.Application>} Configured Express app ready for testing
 */
export const createTestApp = async () => {
  // Create and return Express app
  // Database and models are already initialized in global test setup
  const app = await createApp();
  
  return app;
};

/**
 * Close test app (if needed for cleanup)
 * Currently no cleanup needed, but kept for future use
 * @param {Express.Application} app - Express app instance
 * @returns {Promise<void>}
 */
export const closeTestApp = async (app) => {
  // Future: Add any cleanup logic here if needed
  // Currently app doesn't need explicit cleanup
};

