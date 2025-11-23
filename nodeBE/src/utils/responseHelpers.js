/**
 * @author Bhavesh Venugopal
 * API Response Helpers
 * Standardized response utilities for consistent API responses
 * All standard responses include meta field with requestId, endpoint, method, and optional duration
 * 
 * Special Cases (NO meta field):
 * - Health endpoints: Keep current structure (uptime, memory at root level)
 * - Documentation endpoints: Keep current structure (no meta)
 */

/**
 * Create standardized success response
 * @param {string} message - Success message
 * @param {any} data - Response data (object, array, or null)
 * @param {Object} meta - Optional additional metadata (will be merged with auto-extracted meta)
 * @param {Object} req - Express request object (for auto-extracting endpoint, method, requestId)
 * @param {number} startTime - Optional: Start time in milliseconds for calculating duration
 * @returns {Object} Standardized success response
 */
export const successResponse = (message, data = null, meta = {}, req = null, startTime = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  // Auto-extract meta from req if provided
  const autoMeta = {};
  if (req) {
    autoMeta.endpoint = req.originalUrl || req.path;
    autoMeta.method = req.method;
    if (req.id) {
      autoMeta.requestId = req.id;
    }
    if (startTime !== null) {
      autoMeta.duration = Date.now() - startTime;
    }
  }

  // Merge auto-extracted meta with provided meta
  const mergedMeta = { ...autoMeta, ...meta };
  
  // Always include meta (even if empty) for standard responses
  response.meta = mergedMeta;

  return response;
};

/**
 * Create standardized error response
 * @param {string} message - Human-readable error message
 * @param {string} error - Error type/code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND', 'FORBIDDEN')
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Optional error details
 * @param {Object} req - Express request object (for auto-extracting endpoint, method, requestId)
 * @returns {Object} Standardized error response
 */
export const errorResponse = (message, error, statusCode = 500, details = null, req = null) => {
  const response = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString()
  };

  // Add details if provided
  if (details !== null) {
    response.details = details;
  }

  // Auto-extract meta from req if provided
  const autoMeta = {};
  if (req) {
    autoMeta.endpoint = req.originalUrl || req.path;
    autoMeta.method = req.method;
    if (req.id) {
      autoMeta.requestId = req.id;
    }
  }

  // Always include meta for error responses
  response.meta = autoMeta;

  return response;
};

/**
 * Create standardized paginated response
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info { page, limit, total }
 * @param {Object} meta - Optional additional metadata (will be merged with auto-extracted meta)
 * @param {Object} req - Express request object (for auto-extracting endpoint, method, requestId)
 * @param {number} startTime - Optional: Start time in milliseconds for calculating duration
 * @returns {Object} Standardized paginated response
 */
export const paginatedResponse = (message, data, pagination, meta = {}, req = null, startTime = null) => {
  const { page, limit, total } = pagination;
  const pages = Math.ceil(total / limit);

  const response = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  };

  // Auto-extract meta from req if provided
  const autoMeta = {};
  if (req) {
    autoMeta.endpoint = req.originalUrl || req.path;
    autoMeta.method = req.method;
    if (req.id) {
      autoMeta.requestId = req.id;
    }
    if (startTime !== null) {
      autoMeta.duration = Date.now() - startTime;
    }
  }

  // Merge auto-extracted meta with provided meta
  const mergedMeta = { ...autoMeta, ...meta };
  
  // Always include meta for paginated responses
  response.meta = mergedMeta;

  return response;
};

/**
 * Create empty success response (for DELETE operations, etc.)
 * @param {string} message - Success message
 * @param {Object} meta - Optional additional metadata (will be merged with auto-extracted meta)
 * @param {Object} req - Express request object (for auto-extracting endpoint, method, requestId)
 * @param {number} startTime - Optional: Start time in milliseconds for calculating duration
 * @returns {Object} Standardized empty success response
 */
export const emptySuccessResponse = (message, meta = {}, req = null, startTime = null) => {
  return successResponse(message, null, meta, req, startTime);
};

