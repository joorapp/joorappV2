/**
 * @author Bhavesh Venugopal
 * Database Test Utilities
 * Provides utilities for cleaning and seeding test database
 */

import { sequelize } from '../../src/config/database.js';

/**
 * Clean all test tables
 * Truncates all tables in the correct order to avoid foreign key constraint violations
 * Preserves test users (users with emails matching test user pattern)
 * @returns {Promise<void>}
 */
export const cleanDatabase = async () => {
  try {
    // First, delete all non-test users and related data
    // Test users are identified by their email pattern (test.*@example.com)
    
    // Delete company_users for non-test users (uses user_id column)
    await sequelize.query(`
      DELETE FROM company_users 
      WHERE user_id NOT IN (
        SELECT id FROM users WHERE email LIKE 'test.%@example.com'
      )
    `);
    
    // Delete user_company_context - no user_id column, so delete all (test users will recreate as needed)
    await sequelize.query(`
      TRUNCATE TABLE user_company_context CASCADE
    `);
    
    // Delete company_roles created by non-test users (uses created_user_id column)
    await sequelize.query(`
      DELETE FROM company_roles 
      WHERE created_user_id NOT IN (
        SELECT id FROM users WHERE email LIKE 'test.%@example.com'
      )
    `);
    
    // Delete companies created by non-test users (uses created_user_id column)
    // Must delete companies before plans because companies reference plans (plan_id FK)
    await sequelize.query(`
      DELETE FROM companies 
      WHERE created_user_id NOT IN (
        SELECT id FROM users WHERE email LIKE 'test.%@example.com'
      )
    `);
    
    // Delete all plans except BASIC (master data - no user FK constraints)
    // Plans are master data and don't have created_user_id or updated_user_id
    await sequelize.query(`
      DELETE FROM plans 
      WHERE code != 'BASIC'
    `);
    
    // Restore BASIC plan if it's soft-deleted (master data requirement)
    await sequelize.query(`
      UPDATE plans 
      SET is_deleted = false,
          deleted_user_id = NULL,
          updated_date = CURRENT_TIMESTAMP
      WHERE code = 'BASIC'
      AND is_deleted = true
    `);
    
    // Recreate BASIC plan if it doesn't exist (system requirement)
    // Master data - no user dependency required
    await sequelize.query(`
      INSERT INTO plans (
        id, name, code, description, price, is_active,
        created_date, updated_date, is_deleted, version
      )
      SELECT 
        gen_random_uuid(),
        'Basic',
        'BASIC',
        'Basic subscription plan - default plan for new companies',
        0.00,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        false,
        1
      WHERE NOT EXISTS (
        SELECT 1 FROM plans WHERE code = 'BASIC'
      )
    `);
    
    // Now safe to delete non-test users (no FK constraints from plans)
    await sequelize.query(`
      DELETE FROM users 
      WHERE email NOT LIKE 'test.%@example.com'
    `);
    
    // Truncate demo tables (no test data to preserve)
    await sequelize.query(`
      TRUNCATE TABLE demo_auditable_models CASCADE
    `);
  } catch (error) {
    console.error('Failed to clean database:', error.message);
    throw error;
  }
};

/**
 * Clean specific tables
 * @param {string[]} tableNames - Array of table names to truncate
 * @returns {Promise<void>}
 */
export const cleanTables = async (tableNames) => {
  try {
    const tableList = tableNames.join(', ');
    await sequelize.query(`TRUNCATE TABLE ${tableList} CASCADE`);
  } catch (error) {
    console.error(`Failed to clean tables [${tableNames.join(', ')}]:`, error.message);
    throw error;
  }
};

/**
 * Clean only the users table
 * @returns {Promise<void>}
 */
export const cleanUsers = async () => {
  await cleanTables(['users']);
};

/**
 * Clean only the companies table
 * @returns {Promise<void>}
 */
export const cleanCompanies = async () => {
  await cleanTables(['company_users', 'company_roles', 'companies']);
};

/**
 * Clean all auditable model tables (companies, roles, etc)
 * @returns {Promise<void>}
 */
export const cleanAuditableTables = async () => {
  await cleanTables([
    'user_company_context',
    'company_users',
    'company_roles',
    'companies',
    'demo_auditable_models'
  ]);
};

/**
 * Get count of records in a table
 * Useful for debugging tests
 * @param {string} tableName - Table name
 * @returns {Promise<number>} Count of records
 */
export const getTableCount = async (tableName) => {
  const result = await sequelize.query(
    `SELECT COUNT(*) as count FROM ${tableName}`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return parseInt(result[0].count, 10);
};

/**
 * Check if database is clean (all test tables are empty)
 * @returns {Promise<boolean>} True if all tables are empty
 */
export const isDatabaseClean = async () => {
  const tables = [
    'user_company_context',
    'company_users',
    'company_roles',
    'companies',
    'plans',
    'users',
    'demo_auditable_models'
  ];
  
  for (const table of tables) {
    const count = await getTableCount(table);
    if (count > 0) {
      console.log(`Table ${table} has ${count} records`);
      return false;
    }
  }
  
  return true;
};

/**
 * Reset all sequences for test tables
 * Not needed for UUID primary keys, but useful if you have integer IDs
 * @returns {Promise<void>}
 */
export const resetSequences = async () => {
  // Most tables use UUID, so no sequences to reset
  // Add here if you have any tables with serial/int primary keys
};

