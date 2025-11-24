/**
 * @author Bhavesh Venugopal
 * Migration Runner Script
 * Run this script to execute migrations manually
 * Usage: node scripts/run-migration.js [migration-name] [up|down]
 */

// IMPORTANT: Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase } from '../src/config/database.js';
import { createModuleLogger, logInfo, logError } from '../src/utils/logger.js';

const logger = createModuleLogger('migration-runner');

/**
 * Migration name to file mapping
 * Maps migration names to their file paths
 */
const migrationMap = {
  'create-users': '../src/migrations/20241122150000-create-users.js',
  'create-demo-auditable-models': '../src/migrations/20241122160000-create-demo-auditable-models.js',
  'update-users-role-enum': '../src/migrations/20241122170000-update-users-role-enum.js',
  'create-companies': '../src/migrations/20241122180000-create-companies.js',
  'create-company-roles': '../src/migrations/20241122190000-create-company-roles.js',
  'create-company-users': '../src/migrations/20241122200000-create-company-users.js',
  'create-user-company-context': '../src/migrations/20241122210000-create-user-company-context.js'
};

/**
 * Run migration
 * @param {string} migrationName - Name of the migration
 * @param {string} direction - 'up' or 'down'
 * @returns {Promise<void>}
 */
const runMigration = async (migrationName, direction = 'up') => {
  try {
    logger.info(`Starting migration: ${migrationName} (${direction})`);

    // Initialize database connection
    await initializeDatabase();
    logger.info('Database connection initialized');

    // Get migration file path
    const migrationPath = migrationMap[migrationName];
    if (!migrationPath) {
      throw new Error(`Unknown migration: ${migrationName}. Available migrations: ${Object.keys(migrationMap).join(', ')}`);
    }

    // Dynamically import migration
    const migration = await import(migrationPath);

    // Run migration
    if (direction === 'up') {
      await migration.up();
      logger.info(`✅ Migration ${migrationName} completed successfully`);
    } else if (direction === 'down') {
      await migration.down();
      logger.info(`✅ Migration ${migrationName} rolled back successfully`);
    } else {
      throw new Error(`Invalid direction: ${direction}. Use 'up' or 'down'`);
    }

    process.exit(0);
  } catch (error) {
    logError('Migration failed', error, { migrationName, direction });
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);

// If no arguments provided, show usage
if (args.length === 0) {
  console.error('❌ Error: Migration name is required');
  console.error('\nUsage: npm run migrate:up -- <migration-name> [up|down]');
  console.error('\nAvailable migrations:');
  Object.keys(migrationMap).forEach(name => {
    console.error(`  - ${name}`);
  });
  process.exit(1);
}

const migrationName = args[0];
const direction = args[1] || 'up'; // Default to 'up' if direction not specified

// Run migration
runMigration(migrationName, direction);

