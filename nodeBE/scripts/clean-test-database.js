/**
 * @author Bhavesh Venugopal
 * Clean Test Database Script
 * Truncates all tables in test database before running tests
 * 
 * Usage: node scripts/clean-test-database.js
 * Prerequisites: Test database must exist and be accessible
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.test.local');

// Verify .env.test.local file exists and load it
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error('❌ Error loading .env.test.local file:', result.error.message);
    process.exit(1);
  }
} else {
  console.error(`❌ Error: .env.test.local file not found at: ${envPath}`);
  console.error('   Please create a .env.test.local file in the nodeBE directory');
  process.exit(1);
}

import { sequelize } from '../src/config/database.js';
import { logInfo, logError } from '../src/utils/logger.js';

/**
 * Truncate all tables in test database
 * Tables are truncated in order to respect foreign key constraints
 * CASCADE is used to handle dependencies automatically
 * @returns {Promise<void>}
 */
const cleanTestDatabase = async () => {
  try {
    logInfo('🧹 Cleaning test database...');
    logInfo(`📊 Database: ${process.env.DB_NAME}`);
    
    // Connect to database
    await sequelize.authenticate();
    logInfo('✅ Connected to test database');
    
    // Disable foreign key checks temporarily (PostgreSQL doesn't support this directly,
    // but we can use CASCADE in TRUNCATE which handles dependencies)
    // Truncate tables in reverse dependency order with CASCADE
    // CASCADE will automatically truncate dependent tables
    //
    // ⚠️ IMPORTANT: When creating a new model, you MUST add its table to this array!
    // See: nodeBE/.cursor/rules/testing/database-cleanup-maintenance.mdc for guidelines
    // Rules:
    // 1. Add table name in correct dependency order (child tables before parent tables)
    // 2. Place tables that depend on others BEFORE their dependencies
    // 3. Base/reference tables (like 'users') go LAST
    // 4. Always use CASCADE in TRUNCATE (handled automatically)
    //
    const tables = [
      'user_company_context',      // No dependencies
      'company_users',             // Depends on users, companies, company_roles
      'company_roles',             // Depends on users
      'companies',                 // Depends on users
      'demo_auditable_models',     // Depends on users
      // ADD NEW MODEL TABLES HERE (in correct dependency order)
      'users'                      // Base table, referenced by others
    ];
    
    // Truncate each table with CASCADE to handle foreign key dependencies
    for (const table of tables) {
      try {
        await sequelize.query(`TRUNCATE TABLE ${table} CASCADE`);
        logInfo(`  ✅ Truncated: ${table}`);
      } catch (error) {
        // If table doesn't exist, log warning but continue
        if (error.message.includes('does not exist')) {
          logInfo(`  ⚠️  Table ${table} does not exist (skipping)`);
        } else {
          throw error;
        }
      }
    }
    
    logInfo('✅ Test database cleaned successfully');
    logInfo('');
    
  } catch (error) {
    logError('Failed to clean test database', error);
    console.error('❌ Error details:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run cleanup
cleanTestDatabase();

