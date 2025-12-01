/**
 * @author Bhavesh Venugopal
 * Jest Test Setup
 * Sets up database for all tests
 * Note: Environment variables are loaded by run-tests.js BEFORE this file
 * Note: Run migrations manually using `npm run migrate:test` before running tests
 */

import { sequelize } from '../src/config/database.js';
import { initializeModels } from '../src/models/index.js';
import { registerCustomMatchers } from './helpers/matchers.js';

// Register custom Jest matchers
registerCustomMatchers();

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Connecting to test database...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to:', process.env.DB_NAME);
    
    // Initialize model associations
    initializeModels();
    console.log('✅ Model associations initialized');
    
    // Note: Migrations should be run manually using `npm run migrate:test`
    // before running tests for the first time
    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error(error);
    throw error;
  }
}, 30000);

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log('🔌 Closing test database connection...');
  await sequelize.close();
  console.log('✅ Connection closed');
});

