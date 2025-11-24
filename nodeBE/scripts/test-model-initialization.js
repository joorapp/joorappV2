/**
 * @author Bhavesh Venugopal
 * Test script to verify model initialization
 * Tests that models are properly initialized and associations are set up
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

// Verify .env file exists and load it
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error.message);
    process.exit(1);
  }
} else {
  console.error(`❌ Error: .env file not found at: ${envPath}`);
  console.error('   Please create a .env file in the nodeBE directory');
  process.exit(1);
}

// Now import other modules (after dotenv.config())
import { initializeDatabase } from '../src/config/database.js';
import { logInfo, logError } from '../src/utils/logger.js';
// Note: Models will be imported dynamically after database initialization

/**
 * Test model initialization
 * @returns {Promise<void>}
 */
const testModelInitialization = async () => {
  let testPassed = true;
  const errors = [];

  try {
    logInfo('🧪 Starting model initialization tests...\n');

    // Initialize database first
    logInfo('Step 0: Initializing database connection...');
    try {
      await initializeDatabase();
      logInfo('✅ Database connection initialized successfully\n');
    } catch (error) {
      logError('❌ Database initialization failed', error);
      process.exit(1);
    }

    // Dynamically import models after database is ready
    logInfo('Step 1: Loading models (dynamic import)...');
    const { initializeModels, User, DemoAuditableModel } = await import('../src/models/index.js');
    logInfo('✅ Models loaded successfully\n');

    // Test 1: Verify models are imported
    logInfo('Test 1: Verifying models are imported...');
    if (!User) {
      errors.push('❌ User model is not imported');
      testPassed = false;
    } else {
      logInfo('✅ User model imported successfully');
    }

    if (!DemoAuditableModel) {
      errors.push('❌ DemoAuditableModel is not imported');
      testPassed = false;
    } else {
      logInfo('✅ DemoAuditableModel imported successfully');
    }

    // Test 2: Verify initializeModels function exists
    logInfo('\nTest 2: Verifying initializeModels function...');
    if (typeof initializeModels !== 'function') {
      errors.push('❌ initializeModels is not a function');
      testPassed = false;
    } else {
      logInfo('✅ initializeModels function exists');
    }

    // Test 3: Call initializeModels and verify no errors
    logInfo('\nTest 3: Calling initializeModels()...');
    try {
      initializeModels();
      logInfo('✅ initializeModels() executed without errors');
    } catch (error) {
      errors.push(`❌ initializeModels() failed: ${error.message}`);
      testPassed = false;
      logError('initializeModels() error', error);
    }

    // Test 4: Verify associations are set up
    logInfo('\nTest 4: Verifying model associations...');
    
    // Check User -> DemoAuditableModel associations
    const userAssociations = User.associations;
    const createdAssoc = userAssociations.createdDemoAuditableModels;
    const updatedAssoc = userAssociations.updatedDemoAuditableModels;
    const deletedAssoc = userAssociations.deletedDemoAuditableModels;

    if (!createdAssoc) {
      errors.push('❌ User.createdDemoAuditableModels association not found');
      testPassed = false;
    } else {
      logInfo('✅ User.createdDemoAuditableModels association exists');
      if (createdAssoc.foreignKey !== 'createdUserId') {
        errors.push(`❌ Expected foreignKey 'createdUserId', got '${createdAssoc.foreignKey}'`);
        testPassed = false;
      } else {
        logInfo('   - Foreign key: createdUserId ✓');
      }
    }

    if (!updatedAssoc) {
      errors.push('❌ User.updatedDemoAuditableModels association not found');
      testPassed = false;
    } else {
      logInfo('✅ User.updatedDemoAuditableModels association exists');
      if (updatedAssoc.foreignKey !== 'updatedUserId') {
        errors.push(`❌ Expected foreignKey 'updatedUserId', got '${updatedAssoc.foreignKey}'`);
        testPassed = false;
      } else {
        logInfo('   - Foreign key: updatedUserId ✓');
      }
    }

    if (!deletedAssoc) {
      errors.push('❌ User.deletedDemoAuditableModels association not found');
      testPassed = false;
    } else {
      logInfo('✅ User.deletedDemoAuditableModels association exists');
      if (deletedAssoc.foreignKey !== 'deletedUserId') {
        errors.push(`❌ Expected foreignKey 'deletedUserId', got '${deletedAssoc.foreignKey}'`);
        testPassed = false;
      } else {
        logInfo('   - Foreign key: deletedUserId ✓');
      }
    }

    // Test 5: Verify models can access sequelize instance
    logInfo('\nTest 5: Verifying models have sequelize instance...');
    if (!User.sequelize) {
      errors.push('❌ User model does not have sequelize instance');
      testPassed = false;
    } else {
      logInfo('✅ User model has sequelize instance');
    }

    if (!DemoAuditableModel.sequelize) {
      errors.push('❌ DemoAuditableModel does not have sequelize instance');
      testPassed = false;
    } else {
      logInfo('✅ DemoAuditableModel has sequelize instance');
    }

    // Test 6: Verify models have correct table names
    logInfo('\nTest 6: Verifying model table names...');
    if (User.tableName !== 'users') {
      errors.push(`❌ Expected User tableName 'users', got '${User.tableName}'`);
      testPassed = false;
    } else {
      logInfo('✅ User tableName is correct: users');
    }

    if (DemoAuditableModel.tableName !== 'demo_auditable_models') {
      errors.push(`❌ Expected DemoAuditableModel tableName 'demo_auditable_models', got '${DemoAuditableModel.tableName}'`);
      testPassed = false;
    } else {
      logInfo('✅ DemoAuditableModel tableName is correct: demo_auditable_models');
    }

    // Summary
    logInfo('\n' + '='.repeat(60));
    if (testPassed) {
      logInfo('✅ All model initialization tests passed!');
      logInfo('✅ Models are properly initialized and ready to use');
    } else {
      logError('❌ Some tests failed:');
      errors.forEach(error => logError(error));
    }
    logInfo('='.repeat(60) + '\n');

    process.exit(testPassed ? 0 : 1);
  } catch (error) {
    logError('❌ Test script error', error);
    process.exit(1);
  }
};

// Run tests
testModelInitialization();

