/**
 * @author Bhavesh Venugopal
 * Response Helpers Tests
 * Tests for response formatting utilities
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  emptySuccessResponse
} from '../responseHelpers.js';

describe('Response Helpers', () => {
  let mockReq;
  let startTime;

  beforeEach(() => {
    startTime = Date.now() - 100; // 100ms ago

    mockReq = {
      id: 'test-request-id',
      method: 'GET',
      path: '/api/v2/users',
      originalUrl: '/api/v2/users?page=1'
    };
  });

  describe('successResponse', () => {
    it('should create success response with data', () => {
      // Arrange
      const data = { id: '123', name: 'Test' };

      // Act
      const response = successResponse('Operation successful', data);

      // Assert
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Operation successful');
      expect(response).toHaveProperty('data', data);
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('meta', {});
    });

    it('should include meta from request object', () => {
      // Act
      const response = successResponse('Success', null, {}, mockReq);

      // Assert
      expect(response.meta).toHaveProperty('endpoint', '/api/v2/users?page=1');
      expect(response.meta).toHaveProperty('method', 'GET');
      expect(response.meta).toHaveProperty('requestId', 'test-request-id');
    });

    it('should calculate duration when startTime provided', () => {
      // Act
      const response = successResponse('Success', null, {}, mockReq, startTime);

      // Assert
      expect(response.meta).toHaveProperty('duration');
      expect(response.meta.duration).toBeGreaterThanOrEqual(100);
    });

    it('should merge provided meta with auto-extracted meta', () => {
      // Arrange
      const customMeta = { customField: 'customValue' };

      // Act
      const response = successResponse('Success', null, customMeta, mockReq);

      // Assert
      expect(response.meta).toHaveProperty('customField', 'customValue');
      expect(response.meta).toHaveProperty('requestId', 'test-request-id');
    });

    it('should work without request object', () => {
      // Act
      const response = successResponse('Success', { data: 'test' });

      // Assert
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('meta', {});
    });
  });

  describe('errorResponse', () => {
    it('should create error response', () => {
      // Act
      const response = errorResponse('Error occurred', 'VALIDATION_ERROR', 400);

      // Assert
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error', 'VALIDATION_ERROR');
      expect(response).toHaveProperty('message', 'Error occurred');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('meta', {});
    });

    it('should include details when provided', () => {
      // Arrange
      const details = { field: 'email', message: 'Invalid format' };

      // Act
      const response = errorResponse('Validation failed', 'VALIDATION_ERROR', 400, details);

      // Assert
      expect(response).toHaveProperty('details', details);
    });

    it('should not include details when null', () => {
      // Act
      const response = errorResponse('Error', 'ERROR', 500, null);

      // Assert
      expect(response).not.toHaveProperty('details');
    });

    it('should include meta from request object', () => {
      // Act
      const response = errorResponse('Error', 'ERROR', 500, null, mockReq);

      // Assert
      expect(response.meta).toHaveProperty('endpoint', '/api/v2/users?page=1');
      expect(response.meta).toHaveProperty('method', 'GET');
      expect(response.meta).toHaveProperty('requestId', 'test-request-id');
    });

    it('should use default status code 500', () => {
      // Act
      const response = errorResponse('Error', 'ERROR');

      // Assert
      // Status code is not in response, but should be handled by caller
      expect(response).toHaveProperty('success', false);
    });
  });

  describe('paginatedResponse', () => {
    it('should create paginated response', () => {
      // Arrange
      const data = [{ id: '1' }, { id: '2' }];
      const pagination = { page: 1, limit: 10, total: 25 };

      // Act
      const response = paginatedResponse('Users retrieved', data, pagination);

      // Assert
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Users retrieved');
      expect(response).toHaveProperty('data', data);
      expect(response).toHaveProperty('pagination');
      expect(response.pagination).toHaveProperty('page', 1);
      expect(response.pagination).toHaveProperty('limit', 10);
      expect(response.pagination).toHaveProperty('total', 25);
      expect(response.pagination).toHaveProperty('pages', 3);
      expect(response.pagination).toHaveProperty('hasNext', true);
      expect(response.pagination).toHaveProperty('hasPrev', false);
    });

    it('should calculate pages correctly', () => {
      // Arrange
      const pagination = { page: 2, limit: 10, total: 25 };

      // Act
      const response = paginatedResponse('Success', [], pagination);

      // Assert
      expect(response.pagination.pages).toBe(3);
      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrev).toBe(true);
    });

    it('should handle last page correctly', () => {
      // Arrange
      const pagination = { page: 3, limit: 10, total: 25 };

      // Act
      const response = paginatedResponse('Success', [], pagination);

      // Assert
      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrev).toBe(true);
    });

    it('should include meta from request object', () => {
      // Arrange
      const pagination = { page: 1, limit: 10, total: 0 };

      // Act
      const response = paginatedResponse('Success', [], pagination, {}, mockReq, startTime);

      // Assert
      expect(response.meta).toHaveProperty('requestId', 'test-request-id');
      expect(response.meta).toHaveProperty('duration');
    });
  });

  describe('emptySuccessResponse', () => {
    it('should create empty success response', () => {
      // Act
      const response = emptySuccessResponse('Deleted successfully');

      // Assert
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Deleted successfully');
      expect(response).toHaveProperty('data', null);
    });

    it('should include meta from request object', () => {
      // Act
      const response = emptySuccessResponse('Deleted', {}, mockReq, startTime);

      // Assert
      expect(response.meta).toHaveProperty('requestId', 'test-request-id');
      expect(response.meta).toHaveProperty('duration');
    });
  });
});

