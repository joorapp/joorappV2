/**
 * @author Bhavesh Venugopal
 * Migration Runner Utility
 * Helper function to run migrations manually
 */

import { createModuleLogger, logError, logInfo } from './logger.js';

const logger = createModuleLogger('migration');

/**
 * Run a migration
 * @param {Object} migration - Migration object with up and down methods
 * @param {string} direction - 'up' or 'down'
 * @returns {Promise<void>}
 */
export const runMigration = async (migration, direction = 'up') => {
  try {
    logger.info(`Running migration ${direction}...`);

    if (direction === 'up') {
      await migration.up();
      logger.info('Migration completed successfully');
    } else if (direction === 'down') {
      await migration.down();
      logger.info('Migration rolled back successfully');
    } else {
      throw new Error(`Invalid migration direction: ${direction}. Use 'up' or 'down'`);
    }
  } catch (error) {
    logError('Migration failed', error, { direction });
    throw error;
  }
};

