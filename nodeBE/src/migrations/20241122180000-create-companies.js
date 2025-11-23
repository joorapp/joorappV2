/**
 * @author Bhavesh Venugopal
 * Migration: Create Companies Table
 * Creates the companies table with audit fields
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create companies table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Creating companies table...');

    await queryInterface.createTable('companies', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        allowNull: false
      },
      name: {
        type: 'VARCHAR(255)',
        allowNull: false
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
      await queryInterface.addIndex('companies', ['is_active'], {
        name: 'companies_is_active_idx'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index companies_is_active_idx already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('companies', ['is_deleted'], {
        name: 'companies_is_deleted_idx'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42P07') {
        logger.info('Index companies_is_deleted_idx already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Add foreign key constraint for created_company_id (self-referential)
    // Note: The foreign key may already be created by the CREATE TABLE statement
    // Check if constraint exists before adding to avoid duplicate constraint error
    try {
      await queryInterface.addConstraint('companies', {
        fields: ['created_company_id'],
        type: 'foreign key',
        name: 'companies_created_company_id_fkey',
        references: {
          table: 'companies',
          field: 'id'
        }
      });
    } catch (error) {
      // If constraint already exists, that's fine - it was created by CREATE TABLE
      if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42710') {
        logger.info('Foreign key constraint companies_created_company_id_fkey already exists, skipping...');
      } else {
        throw error;
      }
    }

    logger.info('Companies table created successfully');
  } catch (error) {
    logger.error('Error creating companies table', { error });
    throw error;
  }
};

/**
 * Drop companies table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Dropping companies table...');

    await queryInterface.dropTable('companies');

    logger.info('Companies table dropped successfully');
  } catch (error) {
    logger.error('Error dropping companies table', { error });
    throw error;
  }
};

