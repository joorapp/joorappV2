/**
 * @author Bhavesh Venugopal
 * Migration: Create Company Roles Table
 * Creates the company_roles master table and seeds initial roles
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create company_roles table and seed initial data
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Creating company_roles table...');

    await queryInterface.createTable('company_roles', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        allowNull: false
      },
      name: {
        type: 'VARCHAR(100)',
        allowNull: false,
        unique: true
      },
      code: {
        type: 'VARCHAR(50)',
        allowNull: false,
        unique: true
      },
      description: {
        type: 'TEXT',
        allowNull: true
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

    // Create indexes (with error handling for existing indexes)
    try {
      await queryInterface.addIndex('company_roles', ['name'], {
        unique: true,
        name: 'company_roles_name_unique'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index company_roles_name_unique already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('company_roles', ['code'], {
        unique: true,
        name: 'company_roles_code_unique'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index company_roles_code_unique already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('company_roles', ['is_active'], {
        name: 'company_roles_is_active_idx'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index company_roles_is_active_idx already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('company_roles', ['is_deleted'], {
        name: 'company_roles_is_deleted_idx'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index company_roles_is_deleted_idx already exists, skipping...');
      } else {
        throw error;
      }
    }

    logger.info('Company roles table created successfully');
  } catch (error) {
    logger.error('Error creating company_roles table', { error });
    throw error;
  }
};

/**
 * Drop company_roles table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Dropping company_roles table...');

    await queryInterface.dropTable('company_roles');

    logger.info('Company roles table dropped successfully');
  } catch (error) {
    logger.error('Error dropping company_roles table', { error });
    throw error;
  }
};

