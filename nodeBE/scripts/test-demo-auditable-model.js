/**
 * @author Bhavesh Venugopal
 * Test Demo Auditable Model Script
 * Tests the AuditableEntity mixin functionality:
 * - Audit field auto-population (createdDate, updatedDate, createdUserId, updatedUserId)
 * - Soft delete functionality (isDeleted flag)
 * - Version tracking for optimistic locking
 * - Default scope (excludes deleted records)
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
import { initializeDatabase, closeDatabase } from '../src/config/database.js';
import { createModuleLogger, logInfo, logError } from '../src/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Import models AFTER database is initialized (using dynamic import)
let User, DemoAuditableModel;

const logger = createModuleLogger('test-demo-auditable-model');

/**
 * Test DemoAuditableModel with audit fields
 * @returns {Promise<void>}
 */
const testDemoAuditableModel = async () => {
  try {
    logger.info('Starting DemoAuditableModel tests...');

    // Initialize database connection FIRST
    await initializeDatabase();
    logger.info('Database connection initialized');

    // Import models AFTER database is initialized
    const modelsModule = await import('../src/models/index.js');
    User = modelsModule.User;
    DemoAuditableModel = modelsModule.DemoAuditableModel;
    logger.info('Models imported');

    // Cleanup: Remove any existing test records from previous runs
    logger.info('Cleaning up any existing test records...');
    // Use raw query to hard delete all records (bypasses soft delete)
    await DemoAuditableModel.sequelize.query('DELETE FROM demo_auditable_models');
    logger.info('Cleanup completed');

    // Create a test user for audit fields
    logger.info('Creating test user for audit fields...');
    const testUser = await User.create({
      keycloakId: uuidv4(),
      email: `test-audit-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      roles: ['user'],
      isActive: true
    });
    logger.info('✅ Test user created', { userId: testUser.id });

    const testUserId = testUser.id;
    const testContext = { userId: testUserId };

    // Test 1: Create record with audit fields
    logger.info('Test 1: Creating record with audit fields...');
    const testRecord = await DemoAuditableModel.create({
      name: 'Test Record',
      description: 'This is a test record',
      status: 'active'
    }, {
      context: testContext
    });

    // Verify audit fields were populated
    if (!testRecord.createdDate) {
      throw new Error('createdDate was not populated');
    }
    if (!testRecord.updatedDate) {
      throw new Error('updatedDate was not populated');
    }
    if (testRecord.createdUserId !== testUserId) {
      throw new Error('createdUserId was not set correctly');
    }
    if (testRecord.updatedUserId !== testUserId) {
      throw new Error('updatedUserId was not set correctly');
    }
    if (testRecord.version !== 1) {
      throw new Error('version should be 1 on creation');
    }
    if (testRecord.isDeleted !== false) {
      throw new Error('isDeleted should be false on creation');
    }

    logger.info('✅ Record created with audit fields', {
      id: testRecord.id,
      createdDate: testRecord.createdDate,
      createdUserId: testRecord.createdUserId,
      version: testRecord.version
    });

    // Test 2: Update record - verify updatedDate and version increment
    logger.info('Test 2: Updating record (verify updatedDate and version increment)...');
    const originalUpdatedDate = testRecord.updatedDate;
    const originalVersion = testRecord.version;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));

    await testRecord.update({
      name: 'Updated Test Record',
      description: 'This is an updated test record'
    }, {
      context: testContext
    });

    // Reload to get updated values
    await testRecord.reload();

    if (testRecord.updatedDate <= originalUpdatedDate) {
      throw new Error('updatedDate was not updated');
    }
    if (testRecord.version !== originalVersion + 1) {
      throw new Error(`version should increment from ${originalVersion} to ${originalVersion + 1}, got ${testRecord.version}`);
    }
    if (testRecord.updatedUserId !== testUserId) {
      throw new Error('updatedUserId was not set correctly');
    }

    logger.info('✅ Record updated successfully', {
      updatedDate: testRecord.updatedDate,
      version: testRecord.version,
      updatedUserId: testRecord.updatedUserId
    });

    // Test 3: Verify default scope excludes deleted records
    logger.info('Test 3: Verifying default scope (should exclude deleted records)...');
    const allRecords = await DemoAuditableModel.findAll();
    const recordCountBeforeDelete = allRecords.length;
    logger.info(`Found ${recordCountBeforeDelete} record(s) (should be 1)`);

    // Test 4: Soft delete - verify isDeleted flag
    logger.info('Test 4: Testing soft delete...');
    await testRecord.destroy({
      context: testContext
    });

    // Verify record still exists but is marked as deleted
    // Use withDeleted scope to include deleted records
    const deletedRecord = await DemoAuditableModel.scope('withDeleted').findByPk(testRecord.id);

    if (!deletedRecord) {
      throw new Error('Record should still exist after soft delete');
    }
    if (deletedRecord.isDeleted !== true) {
      throw new Error('isDeleted should be true after soft delete');
    }
    if (deletedRecord.deletedUserId !== testUserId) {
      throw new Error('deletedUserId was not set correctly');
    }

    logger.info('✅ Soft delete successful', {
      isDeleted: deletedRecord.isDeleted,
      deletedUserId: deletedRecord.deletedUserId
    });

    // Test 5: Verify default scope excludes deleted record
    logger.info('Test 5: Verifying default scope excludes deleted record...');
    const recordsAfterDelete = await DemoAuditableModel.findAll();
    if (recordsAfterDelete.length !== 0) {
      throw new Error(`Default scope should exclude deleted records, found ${recordsAfterDelete.length}`);
    }
    logger.info('✅ Default scope correctly excludes deleted records');

    // Test 6: Query with withDeleted scope
    logger.info('Test 6: Querying with withDeleted scope...');
    const recordsWithDeleted = await DemoAuditableModel.scope('withDeleted').findAll();
    if (recordsWithDeleted.length !== 1) {
      throw new Error(`withDeleted scope should return 1 record, found ${recordsWithDeleted.length}`);
    }
    logger.info('✅ withDeleted scope works correctly');

    // Test 7: Query with onlyDeleted scope
    logger.info('Test 7: Querying with onlyDeleted scope...');
    const onlyDeletedRecords = await DemoAuditableModel.scope('onlyDeleted').findAll();
    if (onlyDeletedRecords.length !== 1) {
      throw new Error(`onlyDeleted scope should return 1 record, found ${onlyDeletedRecords.length}`);
    }
    logger.info('✅ onlyDeleted scope works correctly');

    // Test 8: Optimistic locking - version conflict
    logger.info('Test 8: Testing optimistic locking (version conflict)...');
    
    // Create a new record
    const record1 = await DemoAuditableModel.create({
      name: 'Optimistic Lock Test',
      description: 'Testing version conflict',
      status: 'active'
    }, {
      context: testContext
    });

    const lockTestOriginalVersion = record1.version;
    logger.info(`Created record with version: ${lockTestOriginalVersion}`);

    // Test 8a: Normal update should succeed (version matches)
    logger.info('Test 8a: Normal update (version should match)...');
    record1.name = 'Updated Name';
    await record1.save({ context: testContext });
    const lockTestUpdatedVersion = record1.version;
    if (lockTestUpdatedVersion !== lockTestOriginalVersion + 1) {
      throw new Error(`Version should increment from ${lockTestOriginalVersion} to ${lockTestOriginalVersion + 1}, got ${lockTestUpdatedVersion}`);
    }
    logger.info(`✅ Normal update succeeded, version incremented to: ${lockTestUpdatedVersion}`);

    // Test 8b: Simulate concurrent update with stale version (OPTIMISTIC LOCK FAILURE)
    logger.info('Test 8b: Simulating concurrent update with stale version (should FAIL)...');
    
    // Simulate two different processes/users loading the same record
    // Process 1: Loads the record
    const recordProcess1 = await DemoAuditableModel.findByPk(record1.id);
    const staleVersion = recordProcess1.version;
    logger.info(`Process 1 loaded record with version: ${staleVersion}`);
    
    // Process 2: Also loads the same record (simulating concurrent access)
    const recordProcess2 = await DemoAuditableModel.findByPk(record1.id);
    logger.info(`Process 2 loaded record with version: ${recordProcess2.version}`);
    
    // Process 1: Updates the record successfully (this increments version in DB)
    logger.info('Process 1: Updating record (should succeed)...');
    recordProcess1.name = 'Updated by Process 1';
    await recordProcess1.save({ context: testContext });
    const newVersion = recordProcess1.version;
    logger.info(`Process 1 update succeeded, version is now: ${newVersion}`);
    
    // Verify version was incremented
    if (newVersion !== staleVersion + 1) {
      throw new Error(`Version should be ${staleVersion + 1}, got ${newVersion}`);
    }
    
    // Process 2: Tries to update with stale version (should FAIL with OptimisticLockError)
    logger.info('Process 2: Attempting update with stale version (should FAIL)...');
    recordProcess2.name = 'Should Fail - Stale Version';
    
    try {
      await recordProcess2.save({ context: testContext });
      // If we get here, optimistic locking FAILED - this is a critical error
      throw new Error(
        '❌ CRITICAL: Optimistic locking FAILED! ' +
        `Update succeeded with stale version ${staleVersion} when current version is ${newVersion}. ` +
        'This means concurrent updates are not being prevented!'
      );
    } catch (error) {
      if (error.message && error.message.includes('OptimisticLockError')) {
        logger.info('✅ Optimistic locking works correctly: Version conflict detected and prevented', { 
          error: error.message,
          expectedVersion: staleVersion,
          actualVersion: newVersion
        });
      } else if (error.message && error.message.includes('CRITICAL')) {
        // Re-throw critical errors
        throw error;
      } else {
        // Unexpected error
        logger.error('Unexpected error during optimistic lock test', { error: error.message });
        throw error;
      }
    }

    // Cleanup
    logger.info('Cleanup: Deleting test records...');
    await DemoAuditableModel.unscoped().destroy({
      where: {},
      force: true, // Hard delete for cleanup
      context: testContext
    });
    await testUser.destroy();
    logger.info('✅ Cleanup completed');

    logger.info('✅ All DemoAuditableModel tests passed successfully');
    process.exit(0);
  } catch (error) {
    logError('DemoAuditableModel test failed', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

// Run tests
testDemoAuditableModel();

