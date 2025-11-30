/**
 * @author Bhavesh Venugopal
 * Error Classes Tests
 * Tests for custom error classes
 */

import { jest, describe, it, expect } from '@jest/globals';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  UnauthorizedError,
  AuthenticationFailedError,
  ConflictError,
  BadRequestError,
  SessionError,
  InternalServerError
} from '../errors.js';

describe('Error Classes', () => {

  describe('NotFoundError', () => {
    it('should create NotFoundError with entity name and id', () => {
      // Act
      const error = new NotFoundError('User', 'user-123');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found: user-123');
      expect(error.entityType).toBe('User');
      expect(error.entityId).toBe('user-123');
      expect(error.errorCode).toBe('USER_NOT_FOUND');
    });

    it('should create NotFoundError with context', () => {
      // Arrange
      const context = { requestId: 'test-123' };

      // Act
      const error = new NotFoundError('User', 'user-123', context);

      // Assert
      expect(error.context).toMatchObject(context);
      expect(error.context).toHaveProperty('entityType', 'User');
      expect(error.context).toHaveProperty('entityId', 'user-123');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with message', () => {
      // Act
      const error = new ValidationError('Invalid email format');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid email format');
    });

    it('should create ValidationError with details and context', () => {
      // Arrange
      const details = { field: 'email', value: 'invalid' };
      const context = { requestId: 'test-123' };

      // Act
      const error = new ValidationError('Invalid email', details, context);

      // Assert
      expect(error.context).toMatchObject({ requestId: 'test-123' });
    });
  });

  describe('ForbiddenError', () => {
    it('should create ForbiddenError with message', () => {
      // Act
      const error = new ForbiddenError('Access denied');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ForbiddenError');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should create ForbiddenError with context', () => {
      // Arrange
      const context = { requestId: 'test-123', userId: 'user-123' };

      // Act
      const error = new ForbiddenError('Access denied', context);

      // Assert
      expect(error.context).toEqual(context);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError with message', () => {
      // Act
      const error = new UnauthorizedError('Authentication required');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('UnauthorizedError');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('AuthenticationFailedError', () => {
    it('should create AuthenticationFailedError with message', () => {
      // Act
      const error = new AuthenticationFailedError('Invalid credentials');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthenticationFailedError');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with message', () => {
      // Act
      const error = new ConflictError('Resource already exists');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ConflictError');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('BadRequestError', () => {
    it('should create BadRequestError with message', () => {
      // Act
      const error = new BadRequestError('Invalid request');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('BadRequestError');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid request');
    });

    it('should create BadRequestError with details and context', () => {
      // Arrange
      const details = { field: 'email' };
      const context = { requestId: 'test-123' };

      // Act
      const error = new BadRequestError('Invalid request', details, context);

      // Assert
      expect(error.details).toEqual(details);
      expect(error.context).toMatchObject(context);
      expect(error.context).toHaveProperty('details', details);
    });
  });

  describe('SessionError', () => {
    it('should create SessionError with message', () => {
      // Act
      const error = new SessionError('Session expired');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SessionError');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Session expired');
    });
  });

  describe('InternalServerError', () => {
    it('should create InternalServerError with message', () => {
      // Act
      const error = new InternalServerError('Internal server error');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('InternalServerError');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });
});

