/**
 * @author Bhavesh Venugopal
 * Database Test Utilities
 * Provides utilities for cleaning and seeding test database
 */

import { sequelize } from '../../src/config/database.js';

/**
 * Clean all test tables
 * Truncates all tables in the correct order to avoid foreign key constraint violations
 * @returns {Promise<void>}
 */
export const cleanDatabase = async () => {
  try {
    await sequelize.query(`
      TRUNCATE TABLE 
        user_company_context,
        company_users,
        company_roles,
        companies,
        users,
        demo_auditable_models
      CASCADE
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

