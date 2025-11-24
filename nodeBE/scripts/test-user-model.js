/**
 * @author Bhavesh Venugopal
 * Test User Model Script
 * Tests User model creation, querying, and basic operations
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Now import other modules (after dotenv.config())
import { initializeDatabase } from '../src/config/database.js';
import { createModuleLogger, logInfo, logError } from '../src/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Import models AFTER database is initialized (using dynamic import)
let User;

const logger = createModuleLogger('test-user-model');

/**
 * Test User model operations
 * @returns {Promise<void>}
 */
const testUserModel = async () => {
  try {
    logger.info('Starting User model tests...');

    // Initialize database connection FIRST
    await initializeDatabase();
    logger.info('Database connection initialized');

    // Import User model AFTER database is initialized
    const userModule = await import('../src/models/index.js');
    User = userModule.User;
    logger.info('User model imported');

    // Test 1: Create a test user
    logger.info('Test 1: Creating test user...');
    const testKeycloakId = uuidv4();
    const testEmail = `test-${Date.now()}@example.com`;

    const testUser = await User.create({
      keycloakId: testKeycloakId,
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      roles: ['user'],
      isActive: true
    });

    logger.info('✅ Test user created successfully', {
      id: testUser.id,
      email: testUser.email,
      keycloakId: testUser.keycloakId
    });

    // Test 2: Query user by ID
    logger.info('Test 2: Querying user by ID...');
    const foundUser = await User.findByPk(testUser.id);
    
    if (!foundUser) {
      throw new Error('User not found by ID');
    }
    
    logger.info('✅ User found by ID', {
      id: foundUser.id,
      email: foundUser.email
    });

    // Test 3: Query user by email
    logger.info('Test 3: Querying user by email...');
    const userByEmail = await User.findOne({
      where: { email: testEmail }
    });
    
    if (!userByEmail) {
      throw new Error('User not found by email');
    }
    
    logger.info('✅ User found by email', {
      id: userByEmail.id,
      email: userByEmail.email
    });

    // Test 4: Query user by keycloakId
    logger.info('Test 4: Querying user by keycloakId...');
    const userByKeycloakId = await User.findOne({
      where: { keycloakId: testKeycloakId }
    });
    
    if (!userByKeycloakId) {
      throw new Error('User not found by keycloakId');
    }
    
    logger.info('✅ User found by keycloakId', {
      id: userByKeycloakId.id,
      keycloakId: userByKeycloakId.keycloakId
    });

    // Test 5: Update user
    logger.info('Test 5: Updating user...');
    await testUser.update({
      firstName: 'Updated',
      lastName: 'Name',
      lastLoginAt: new Date()
    });
    
    const updatedUser = await User.findByPk(testUser.id);
    if (updatedUser.firstName !== 'Updated') {
      throw new Error('User update failed');
    }
    
    logger.info('✅ User updated successfully', {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName
    });

    // Test 6: Query all users
    logger.info('Test 6: Querying all users...');
    const allUsers = await User.findAll();
    logger.info(`✅ Found ${allUsers.length} user(s) in database`);

    // Test 7: Query active users only
    logger.info('Test 7: Querying active users only...');
    const activeUsers = await User.findAll({
      where: { isActive: true }
    });
    logger.info(`✅ Found ${activeUsers.length} active user(s)`);

    // Cleanup: Delete test user
    logger.info('Cleanup: Deleting test user...');
    await testUser.destroy();
    logger.info('✅ Test user deleted');

    logger.info('✅ All User model tests passed successfully');
    process.exit(0);
  } catch (error) {
    logError('User model test failed', error);
    process.exit(1);
  }
};

// Run tests
testUserModel();

