/**
 * @author Bhavesh Venugopal
 * Mock Context Objects
 * Provides reusable mock audit context objects for service tests
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock audit context
 * @param {string} userId - User UUID (optional, generates new if not provided)
 * @param {string} companyId - Company UUID (optional)
 * @returns {Object} Mock audit context { userId, companyId? }
 */
export const createMockContext = (userId = null, companyId = null) => {
  const context = {
    userId: userId || uuidv4()
  };
  
  if (companyId) {
    context.companyId = companyId;
  }
  
  return context;
};

