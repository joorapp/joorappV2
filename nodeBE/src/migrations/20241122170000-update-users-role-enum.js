/**
 * @author Bhavesh Venugopal
 * Migration: Update Users Table - Change roles array to keycloak_global_role enum
 * Drops the roles array column and adds keycloak_global_role enum column
 */

import { sequelize } from '../config/database.js';
import { createModuleLogger } from '../utils/logger.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES, KEYCLOAK_GLOBAL_ROLE_DEFAULT } from '../constants/keycloakRoles.js';

const logger = createModuleLogger('migration');

/**
 * Update users table
 * @returns {Promise<void>}
 */
export const up = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Updating users table: changing roles array to keycloak_global_role enum...');

    // Create enum type using constants
    const enumValues = KEYCLOAK_GLOBAL_ROLE_VALUES.map(val => `'${val}'`).join(', ');
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE keycloak_global_roles AS ENUM (${enumValues});
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Drop the old roles column
    await queryInterface.removeColumn('users', 'roles');

    // Add the new keycloak_global_role column
    await queryInterface.addColumn('users', 'keycloak_global_role', {
      type: 'keycloak_global_roles',
      allowNull: false,
      defaultValue: KEYCLOAK_GLOBAL_ROLE_DEFAULT
    });

    // Add index on keycloak_global_role
    await queryInterface.addIndex('users', ['keycloak_global_role'], {
      name: 'users_keycloak_global_role_idx'
    });

    logger.info('Users table updated successfully');
  } catch (error) {
    logger.error('Error updating users table', { error });
    throw error;
  }
};

/**
 * Revert users table changes
 * @returns {Promise<void>}
 */
export const down = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Reverting users table changes...');

    // Remove index
    await queryInterface.removeIndex('users', 'users_keycloak_global_role_idx');

    // Remove keycloak_global_role column
    await queryInterface.removeColumn('users', 'keycloak_global_role');

    // Add back roles array column
    await queryInterface.addColumn('users', 'roles', {
      type: 'TEXT[]',
      allowNull: false,
      defaultValue: '{}'
    });

    // Drop enum type (only if no other tables use it)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS keycloak_global_roles;
    `);

    logger.info('Users table reverted successfully');
  } catch (error) {
    logger.error('Error reverting users table changes', { error });
    throw error;
  }
};

