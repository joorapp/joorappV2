/**
 * @author Bhavesh Venugopal
 * Validation Middleware Tests
 * Tests for validationMiddleware request validation logic
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { ValidationError } from '../../utils/errors.js';

// Mock express-validator before importing the middleware
const mockValidationResult = jest.fn();

jest.unstable_mockModule('express-validator', () => ({
  validationResult: mockValidationResult,
  body: jest.fn(() => ({
    isEmail: jest.fn(() => ({
      withMessage: jest.fn(() => ({}))
    })),
    isLength: jest.fn(() => ({
      withMessage: jest.fn(() => ({}))
    }))
  })),
  param: jest.fn(() => ({})),
  query: jest.fn(() => ({}))
}));

// Import after mocking
let validationMiddleware;

beforeAll(async () => {
  validationMiddleware = await import('../validationMiddleware.js');
});

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express request/response/next
    req = {
      id: 'test-request-id',
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('validateRequest', () => {
    it('should call next() when validation passes', () => {
      // Arrange
      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      // Act
      validationMiddleware.validateRequest(req, res, next);

      // Assert
      expect(mockValidationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when validation fails with single error', () => {
      // Arrange
      const mockErrors = [
        {
          param: 'email',
          value: 'invalid-email',
          msg: 'Invalid email format',
          location: 'body'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act & Assert
      expect(() => {
        validationMiddleware.validateRequest(req, res, next);
      }).toThrow(ValidationError);

      expect(mockValidationResult).toHaveBeenCalledWith(req);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw ValidationError with correct message for single error', () => {
      // Arrange
      const mockErrors = [
        {
          param: 'email',
          value: 'invalid-email',
          msg: 'Invalid email format',
          location: 'body'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act & Assert
      try {
        validationMiddleware.validateRequest(req, res, next);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Invalid email format');
        expect(error.details).toEqual({
          field: 'email',
          value: 'invalid-email',
          errors: [
            {
              field: 'email',
              value: 'invalid-email',
              message: 'Invalid email format'
            }
          ]
        });
        expect(error.context.requestId).toBe('test-request-id');
      }
    });

    it('should throw ValidationError with combined message for multiple errors', () => {
      // Arrange
      const mockErrors = [
        {
          param: 'email',
          value: 'invalid-email',
          msg: 'Invalid email format',
          location: 'body'
        },
        {
          param: 'password',
          value: '123',
          msg: 'Password must be at least 8 characters',
          location: 'body'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act & Assert
      try {
        validationMiddleware.validateRequest(req, res, next);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Validation failed: Invalid email format; Password must be at least 8 characters');
        expect(error.details.errors).toHaveLength(2);
      }
    });

    it('should handle errors without param field', () => {
      // Arrange
      const mockErrors = [
        {
          path: 'email',
          value: 'invalid-email',
          msg: 'Invalid email format',
          location: 'body'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act & Assert
      try {
        validationMiddleware.validateRequest(req, res, next);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.field).toBe('email');
        expect(error.details.errors[0].field).toBe('email');
      }
    });

    it('should handle errors with location as field fallback', () => {
      // Arrange
      const mockErrors = [
        {
          path: 'query',
          value: 'invalid-value',
          msg: 'Invalid value',
          location: 'query'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      });

      // Act & Assert
      try {
        validationMiddleware.validateRequest(req, res, next);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.field).toBe('query');
        expect(error.details.errors[0].field).toBe('query');
      }
    });
  });

  describe('createValidationChain', () => {
    it('should return array with validations and validateRequest', () => {
      // Arrange
      const validation1 = jest.fn();
      const validation2 = jest.fn();

      // Act
      const chain = validationMiddleware.createValidationChain(validation1, validation2);

      // Assert
      expect(Array.isArray(chain)).toBe(true);
      expect(chain).toHaveLength(3);
      expect(chain[0]).toBe(validation1);
      expect(chain[1]).toBe(validation2);
      expect(chain[2]).toBe(validationMiddleware.validateRequest);
    });

    it('should return array with only validateRequest when no validations provided', () => {
      // Act
      const chain = validationMiddleware.createValidationChain();

      // Assert
      expect(Array.isArray(chain)).toBe(true);
      expect(chain).toHaveLength(1);
      expect(chain[0]).toBe(validationMiddleware.validateRequest);
    });
  });
});

