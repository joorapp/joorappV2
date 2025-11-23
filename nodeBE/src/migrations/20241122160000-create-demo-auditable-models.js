/**
 * @author Bhavesh Venugopal
 * Migration: Create demo_auditable_models table
 * Creates a table to demonstrate the AuditableEntity pattern
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('migration');

/**
 * Create demo_auditable_models table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    logger.info('Creating demo_auditable_models table...');
    
    // Ensure uuid-ossp extension is available
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Create table with all audit fields
    await queryInterface.createTable('demo_auditable_models', {
      id: {
        type: 'UUID',
        primaryKey: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false
      },
      name: {
        type: 'VARCHAR(255)',
        allowNull: false
      },
      description: {
        type: 'TEXT',
        allowNull: true
      },
      status: {
        type: 'VARCHAR(50)',
        allowNull: false,
        defaultValue: 'active'
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
        defaultValue: 1
      }
    });
    
    // Add indexes
    await queryInterface.addIndex('demo_auditable_models', ['name'], {
      name: 'demo_auditable_models_name_idx'
    });
    
    await queryInterface.addIndex('demo_auditable_models', ['status'], {
      name: 'demo_auditable_models_status_idx'
    });
    
    await queryInterface.addIndex('demo_auditable_models', ['is_deleted'], {
      name: 'demo_auditable_models_is_deleted_idx'
    });
    
    // Add foreign key constraints
    await queryInterface.addConstraint('demo_auditable_models', {
      fields: ['created_user_id'],
      type: 'foreign key',
      name: 'demo_auditable_models_created_user_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    await queryInterface.addConstraint('demo_auditable_models', {
      fields: ['updated_user_id'],
      type: 'foreign key',
      name: 'demo_auditable_models_updated_user_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    await queryInterface.addConstraint('demo_auditable_models', {
      fields: ['deleted_user_id'],
      type: 'foreign key',
      name: 'demo_auditable_models_deleted_user_id_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    logger.info('✅ demo_auditable_models table created successfully');
  } catch (error) {
    logger.error('Error creating demo_auditable_models table', { error });
    throw error;
  }
};

/**
 * Drop demo_auditable_models table
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    logger.info('Dropping demo_auditable_models table...');
    await queryInterface.dropTable('demo_auditable_models');
    logger.info('✅ demo_auditable_models table dropped successfully');
  } catch (error) {
    logger.error('Error dropping demo_auditable_models table', { error });
    throw error;
  }
};

