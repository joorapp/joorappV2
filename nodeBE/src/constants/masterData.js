/**
 * @author Bhavesh Venugopal
 * Master Data Constants
 * Centralized definitions for system-required master data
 * These are seeded automatically on application startup
 */

/**
 * BASIC Plan Master Data
 * Default plan assigned to all new companies
 * This is system-required master data that cannot be deleted
 */
export const BASIC_PLAN_MASTER_DATA = Object.freeze({
  name: 'Basic',
  code: 'BASIC',
  description: 'Basic subscription plan - default plan for new companies',
  price: 0.00,
  isActive: true,
  isSystemPlan: true, // Flag to prevent soft deletion
  isDeletable: false  // Flag to prevent deletion
});

/**
 * Master Data Types
 * Enum of all master data types that need seeding
 */
export const MASTER_DATA_TYPES = Object.freeze([
  'BASIC_PLAN',
  // Future: Add other master data types here
  // 'DEFAULT_ROLES',
  // 'SYSTEM_SETTINGS',
]);

/**
 * Master Data Configuration
 * Maps master data types to their configuration objects
 */
export const MASTER_DATA_CONFIG = Object.freeze({
  BASIC_PLAN: {
    type: 'BASIC_PLAN',
    entityType: 'Plan',
    checkMethod: 'findByCode',
    checkValue: BASIC_PLAN_MASTER_DATA.code,
    createData: BASIC_PLAN_MASTER_DATA,
    isDeletable: false,
    isSystemData: true
  }
  // Future: Add other master data configs
  // DEFAULT_ROLES: {
  //   type: 'DEFAULT_ROLES',
  //   entityType: 'CompanyRole',
  //   checkMethod: 'findByCode',
  //   checkValue: ['ADMIN', 'USER'],
  //   createData: DEFAULT_ROLES_MASTER_DATA,
  //   isDeletable: false,
  //   isSystemData: true
  // }
});

