/**
 * @author Bhavesh Venugopal
 * Migration: Create User Company Context Table
 * Creates the user_company_context table for mapping Keycloak session_state to company
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create user_company_context table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Creating user_company_context table...');

    await queryInterface.createTable('user_company_context', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        allowNull: false
      },
      keycloak_session_id: {
        type: 'UUID',
        allowNull: false,
        unique: true
      },
      company_id: {
        type: 'UUID',
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        }
      }
    });

    // Create indexes
    await queryInterface.addIndex('user_company_context', ['keycloak_session_id'], {
      unique: true,
      name: 'user_company_context_keycloak_session_id_unique'
    });

    await queryInterface.addIndex('user_company_context', ['company_id'], {
      name: 'user_company_context_company_id_idx'
    });

    logger.info('User company context table created successfully');
  } catch (error) {
    logger.error('Error creating user_company_context table', { error });
    throw error;
  }
};

/**
 * Drop user_company_context table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Dropping user_company_context table...');

    await queryInterface.dropTable('user_company_context');

    logger.info('User company context table dropped successfully');
  } catch (error) {
    logger.error('Error dropping user_company_context table', { error });
    throw error;
  }
};

