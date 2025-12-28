/**
 * @author Bhavesh Venugopal
 * Company Status Constants
 * Centralized definitions for company status enum values
 */

/**
 * Company Status Values
 * @type {readonly string[]}
 */
export const COMPANY_STATUSES = Object.freeze([
  'NEW',
  'ACTIVE',
  'LICENSE_EXPIRED'
]);

/**
 * Company Status Values (for Sequelize ENUM)
 * Use this array when defining Sequelize ENUM types
 * @type {string[]}
 */
export const COMPANY_STATUS_VALUES = [...COMPANY_STATUSES];

/**
 * Company Status Default Value
 * Default status assigned to new companies
 * @type {string}
 */
export const COMPANY_STATUS_DEFAULT = 'NEW';

/**
 * Company Status Type (for JSDoc/TypeScript-like documentation)
 * @typedef {'NEW' | 'ACTIVE' | 'LICENSE_EXPIRED'} CompanyStatus
 */

/**
 * Check if a status is a valid company status
 * @param {string} status - Status to validate
 * @returns {boolean} True if status is valid
 */
export const isValidCompanyStatus = (status) => {
  return COMPANY_STATUSES.includes(status);
};

/**
 * Check if status is NEW
 * @param {string} status - Status to check
 * @returns {boolean} True if status is NEW
 */
export const isNewStatus = (status) => {
  return status === 'NEW';
};

/**
 * Check if status is ACTIVE
 * @param {string} status - Status to check
 * @returns {boolean} True if status is ACTIVE
 */
export const isActiveStatus = (status) => {
  return status === 'ACTIVE';
};

/**
 * Check if status is LICENSE_EXPIRED
 * @param {string} status - Status to check
 * @returns {boolean} True if status is LICENSE_EXPIRED
 */
export const isLicenseExpiredStatus = (status) => {
  return status === 'LICENSE_EXPIRED';
};

