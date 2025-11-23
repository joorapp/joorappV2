/**
 * @author Bhavesh Venugopal
 * Migration: Create Company Users Table
 * Creates the company_users junction table linking users to companies with roles
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create company_users table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Creating company_users table...');

    await queryInterface.createTable('company_users', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        allowNull: false
      },
      user_id: {
        type: 'UUID',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      company_id: {
        type: 'UUID',
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      company_role_id: {
        type: 'UUID',
        allowNull: false,
        references: {
          model: 'company_roles',
          key: 'id'
        }
      },
      is_active: {
        type: 'BOOLEAN',
        allowNull: false,
        defaultValue: true
      },
      // Audit fields
      created_date: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      updated_date: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      created_user_id: {
        type: 'UUID',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_company_id: {
        type: 'UUID',
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      updated_user_id: {
        type: 'UUID',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      is_deleted: {
        type: 'BOOLEAN',
        allowNull: false,
        defaultValue: false
      },
      deleted_user_id: {
        type: 'UUID',
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      version: {
        type: 'INTEGER',
        allowNull: false,
        defaultValue: 0
      }
    });

    // Create indexes
    await queryInterface.addIndex('company_users', ['user_id', 'company_id'], {
      unique: true,
      name: 'company_users_user_company_unique'
    });

    await queryInterface.addIndex('company_users', ['user_id'], {
      name: 'company_users_user_id_idx'
    });

    await queryInterface.addIndex('company_users', ['company_id'], {
      name: 'company_users_company_id_idx'
    });

    await queryInterface.addIndex('company_users', ['company_role_id'], {
      name: 'company_users_company_role_id_idx'
    });

    await queryInterface.addIndex('company_users', ['is_deleted'], {
      name: 'company_users_is_deleted_idx'
    });

    logger.info('Company users table created successfully');
  } catch (error) {
    logger.error('Error creating company_users table', { error });
    throw error;
  }
};

/**
 * Drop company_users table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Dropping company_users table...');

    await queryInterface.dropTable('company_users');

    logger.info('Company users table dropped successfully');
  } catch (error) {
    logger.error('Error dropping company_users table', { error });
    throw error;
  }
};

