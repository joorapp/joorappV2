/**
 * @author Bhavesh Venugopal
 * Migration: Create Users Table
 * Creates the users table as the reference table for audit foreign keys
 * This table does NOT have audit fields to avoid circular dependency
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create users table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Creating users table...');

    // Note: PostgreSQL 13+ has gen_random_uuid() built-in
    // For older versions, uncomment the extension creation below
    // await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('users', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        allowNull: false
      },
      keycloak_id: {
        type: 'UUID',
        allowNull: false,
        unique: true
      },
      email: {
        type: 'VARCHAR(255)',
        allowNull: false,
        unique: true
      },
      first_name: {
        type: 'VARCHAR(100)',
        allowNull: true
      },
      last_name: {
        type: 'VARCHAR(100)',
        allowNull: true
      },
      roles: {
        type: 'TEXT[]',
        allowNull: false,
        defaultValue: '{}'
      },
      is_active: {
        type: 'BOOLEAN',
        allowNull: false,
        defaultValue: true
      },
      last_login_at: {
        type: 'TIMESTAMP',
        allowNull: true
      }
    });

    // Create indexes
    await queryInterface.addIndex('users', ['keycloak_id'], {
      unique: true,
      name: 'users_keycloak_id_unique'
    });

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'users_is_active_idx'
    });

    logger.info('Users table created successfully');
  } catch (error) {
    logger.error('Error creating users table', { error });
    throw error;
  }
};

/**
 * Drop users table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Dropping users table...');

    await queryInterface.dropTable('users');

    logger.info('Users table dropped successfully');
  } catch (error) {
    logger.error('Error dropping users table', { error });
    throw error;
  }
};

