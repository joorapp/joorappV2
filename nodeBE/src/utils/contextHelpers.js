/**
 * @author Bhavesh Venugopal
 * Context Validation Helper
 * Validates context objects for audit operations
 */

/**
 * Validate context object for audit operations
 * Ensures context contains required fields for audit tracking
 * @param {Object} context - Context object containing userId and optionally companyId
 * @param {Array<string>} requiredFields - Required field names (default: ['userId'])
 * @returns {boolean} True if context is valid
 * @throws {Error} If context is invalid or missing required fields
 * 
 * @example
 * // Validate context with only userId required
 * validateContext({ userId: 'user-uuid' });
 * 
 * @example
 * // Validate context with userId and companyId required
 * validateContext({ userId: 'user-uuid', companyId: 'company-uuid' }, ['userId', 'companyId']);
 */
export const validateContext = (context, requiredFields = ['userId']) => {
  if (!context) {
    throw new Error('Context is required for audit operations');
  }

  if (typeof context !== 'object') {
    throw new Error('Context must be an object');
  }

  requiredFields.forEach(field => {
    if (!context[field]) {
      throw new Error(`${field} is required in context`);
    }
  });

  return true;
};

