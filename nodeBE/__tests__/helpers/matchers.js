/**
 * @author Bhavesh Venugopal
 * Custom Jest Matchers
 * Provides custom matchers for testing
 */

/**
 * Check if a value is a valid UUID (version 4)
 * @param {string} received - Value to check
 * @returns {Object} Jest matcher result
 */
const toBeValidUUID = (received) => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const pass = typeof received === 'string' && uuidV4Regex.test(received);
  
  return {
    pass,
    message: () => {
      if (pass) {
        return `expected ${received} NOT to be a valid UUID`;
      }
      return `expected ${received} to be a valid UUID (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)`;
    }
  };
};

/**
 * Check if an object has all required audit fields
 * @param {Object} received - Object to check
 * @returns {Object} Jest matcher result
 */
const toHaveAuditFields = (received) => {
  const requiredFields = [
    'createdDate',
    'createdUserId',
    'createdCompanyId',
    'updatedDate',
    'updatedUserId',
    'isDeleted',
    'version'
  ];
  
  const missingFields = requiredFields.filter(field => !(field in received));
  const pass = missingFields.length === 0;
  
  return {
    pass,
    message: () => {
      if (pass) {
        return 'expected object NOT to have all audit fields';
      }
      return `expected object to have audit fields, missing: ${missingFields.join(', ')}`;
    }
  };
};

/**
 * Check if an object has valid audit field values
 * @param {Object} received - Object to check
 * @param {string} expectedUserId - Expected user ID who created/updated
 * @returns {Object} Jest matcher result
 */
const toHaveValidAuditValues = (received, expectedUserId) => {
  const checks = [];
  
  // Check createdDate is a Date
  if (!(received.createdDate instanceof Date)) {
    checks.push('createdDate is not a Date');
  }
  
  // Check createdUserId matches
  if (expectedUserId && received.createdUserId !== expectedUserId) {
    checks.push(`createdUserId is ${received.createdUserId}, expected ${expectedUserId}`);
  }
  
  // Check version is a number
  if (typeof received.version !== 'number') {
    checks.push('version is not a number');
  }
  
  // Check isDeleted is boolean
  if (typeof received.isDeleted !== 'boolean') {
    checks.push('isDeleted is not a boolean');
  }
  
  const pass = checks.length === 0;
  
  return {
    pass,
    message: () => {
      if (pass) {
        return 'expected audit values NOT to be valid';
      }
      return `expected valid audit values, but: ${checks.join(', ')}`;
    }
  };
};

/**
 * Check if a date is recent (within last N seconds)
 * @param {Date|string} received - Date to check
 * @param {number} seconds - Number of seconds (default: 5)
 * @returns {Object} Jest matcher result
 */
const toBeRecentDate = (received, seconds = 5) => {
  const date = received instanceof Date ? received : new Date(received);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = diffMs / 1000;
  
  const pass = diffSec >= 0 && diffSec <= seconds;
  
  return {
    pass,
    message: () => {
      if (pass) {
        return `expected ${date.toISOString()} NOT to be within last ${seconds} seconds`;
      }
      return `expected ${date.toISOString()} to be within last ${seconds} seconds (diff: ${diffSec.toFixed(2)}s)`;
    }
  };
};

/**
 * Check if API response matches standard format
 * @param {Object} received - Response object
 * @returns {Object} Jest matcher result
 */
const toMatchAPIResponse = (received) => {
  const requiredFields = ['success', 'message', 'timestamp'];
  const missingFields = requiredFields.filter(field => !(field in received));
  
  // Check meta field (except for health/docs endpoints)
  const hasData = 'data' in received;
  const hasMeta = 'meta' in received;
  
  let pass = missingFields.length === 0;
  let issues = [...missingFields];
  
  // If has data and success=true, should have meta
  if (hasData && received.success && !hasMeta) {
    pass = false;
    issues.push('missing meta field (required for standard responses)');
  }
  
  return {
    pass,
    message: () => {
      if (pass) {
        return 'expected NOT to match API response format';
      }
      return `expected to match API response format, issues: ${issues.join(', ')}`;
    }
  };
};

/**
 * Register all custom matchers with Jest
 * Call this in setup.js or individual test files
 */
export const registerCustomMatchers = () => {
  expect.extend({
    toBeValidUUID,
    toHaveAuditFields,
    toHaveValidAuditValues,
    toBeRecentDate,
    toMatchAPIResponse
  });
};

// Export individual matchers for direct use
export {
  toBeValidUUID,
  toHaveAuditFields,
  toHaveValidAuditValues,
  toBeRecentDate,
  toMatchAPIResponse
};

