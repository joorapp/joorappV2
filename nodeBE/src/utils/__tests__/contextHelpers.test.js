/**
 * @author Bhavesh Venugopal
 * Context Helpers Tests
 * Tests for context validation helper functions
 */

import { describe, it, expect } from '@jest/globals';
import { validateContext } from '../contextHelpers.js';

describe('Context Helpers', () => {
  describe('validateContext', () => {
    it('should validate context with userId', () => {
      // Arrange
      const context = { userId: 'user-123' };

      // Act
      const result = validateContext(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should validate context with userId and companyId', () => {
      // Arrange
      const context = { userId: 'user-123', companyId: 'company-456' };

      // Act
      const result = validateContext(context, ['userId', 'companyId']);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw Error for null context', () => {
      // Act & Assert
      expect(() => validateContext(null)).toThrow('Context is required for audit operations');
    });

    it('should throw Error for undefined context', () => {
      // Act & Assert
      expect(() => validateContext(undefined)).toThrow('Context is required for audit operations');
    });

    it('should throw Error for non-object context', () => {
      // Act & Assert
      expect(() => validateContext('not-an-object')).toThrow('Context must be an object');
      expect(() => validateContext(123)).toThrow('Context must be an object');
    });

    it('should throw Error for missing userId', () => {
      // Arrange
      const context = { companyId: 'company-456' };

      // Act & Assert
      expect(() => validateContext(context)).toThrow('userId is required in context');
    });

    it('should throw Error for missing companyId when required', () => {
      // Arrange
      const context = { userId: 'user-123' };

      // Act & Assert
      expect(() => validateContext(context, ['userId', 'companyId'])).toThrow('companyId is required in context');
    });

    it('should throw Error for empty userId', () => {
      // Arrange
      const context = { userId: '' };

      // Act & Assert
      expect(() => validateContext(context)).toThrow('userId is required in context');
    });

    it('should throw Error for null userId', () => {
      // Arrange
      const context = { userId: null };

      // Act & Assert
      expect(() => validateContext(context)).toThrow('userId is required in context');
    });
  });
});

