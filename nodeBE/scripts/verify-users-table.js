/**
 * @author Bhavesh Venugopal
 * Verify Users Table Script
 * Checks that the users table was created correctly with all columns and indexes
 */

// IMPORTANT: Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, sequelize } from '../src/config/database.js';
import { createModuleLogger, logInfo, logError } from '../src/utils/logger.js';

const logger = createModuleLogger('verify-table');

/**
 * Verify users table structure
 * @returns {Promise<void>}
 */
const verifyUsersTable = async () => {
  try {
    logger.info('Verifying users table...');

    // Initialize database connection
    await initializeDatabase();
    logger.info('Database connection initialized');

    const queryInterface = sequelize.getQueryInterface();

    // Check if table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('users')) {
      throw new Error('Users table does not exist');
    }
    logger.info('✅ Users table exists');

    // Get table structure
    const tableDescription = await queryInterface.describeTable('users');
    
    // Expected columns
    const expectedColumns = [
      'id',
      'keycloak_id',
      'email',
      'first_name',
      'last_name',
      'roles',
      'is_active',
      'last_login_at'
    ];

    logger.info('Checking columns...');
    for (const column of expectedColumns) {
      if (!tableDescription[column]) {
        throw new Error(`Missing column: ${column}`);
      }
      logger.info(`  ✅ Column ${column} exists (type: ${tableDescription[column].type})`);
    }

    // Verify column types (case-insensitive check)
    if (tableDescription.id.type.toUpperCase() !== 'UUID') {
      throw new Error(`Column 'id' should be UUID, got: ${tableDescription.id.type}`);
    }
    if (tableDescription.keycloak_id.type.toUpperCase() !== 'UUID') {
      throw new Error(`Column 'keycloak_id' should be UUID, got: ${tableDescription.keycloak_id.type}`);
    }
    if (!tableDescription.id.primaryKey) {
      throw new Error('Column "id" should be primary key');
    }
    
    // Note: Uniqueness is verified via indexes below, not via column properties

    // Check indexes
    logger.info('Checking indexes...');
    const indexes = await queryInterface.showIndex('users');
    
    const indexNames = indexes.map(idx => idx.name);
    const expectedIndexes = [
      'users_keycloak_id_unique',
      'users_email_unique',
      'users_is_active_idx'
    ];

    for (const indexName of expectedIndexes) {
      const index = indexes.find(idx => idx.name === indexName);
      if (!index) {
        throw new Error(`Missing index: ${indexName}`);
      }
      
      // Verify unique indexes are actually unique
      if (indexName.includes('unique') && !index.unique) {
        throw new Error(`Index ${indexName} should be unique but is not`);
      }
      
      logger.info(`  ✅ Index ${indexName} exists${index.unique ? ' (unique)' : ''}`);
    }

    logger.info('✅ Users table verification completed successfully');
    logger.info('Table structure:', {
      columns: Object.keys(tableDescription),
      indexes: indexNames
    });

    process.exit(0);
  } catch (error) {
    logError('Table verification failed', error);
    process.exit(1);
  }
};

// Run verification
verifyUsersTable();

