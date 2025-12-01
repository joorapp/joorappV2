/**
 * @author Bhavesh Venugopal
 * Company Context Middleware Tests
 * Tests for companyContextMiddleware functionality
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// Mock logger
const mockCreateRequestLogger = jest.fn();
const mockLogError = jest.fn();
const mockLogInfo = jest.fn();
const mockLogDebug = jest.fn();

jest.unstable_mockModule('../../utils/logger.js', () => ({
  createRequestLogger: mockCreateRequestLogger,
  logError: mockLogError,
  logInfo: mockLogInfo,
  logDebug: mockLogDebug
}));

// Mock models
const mockUserCompanyContext = {
  findOne: jest.fn()
};

const mockCompany = {
  findOne: jest.fn()
};

jest.unstable_mockModule('../../models/index.js', () => ({
  UserCompanyContext: mockUserCompanyContext,
  Company: mockCompany
}));

let companyContextMiddleware;
let models;

beforeAll(async () => {
  companyContextMiddleware = await import('../companyContextMiddleware.js');
  models = await import('../../models/index.js');
});

describe('Company Context Middleware', () => {
  let req, res, next;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockCreateRequestLogger.mockReturnValue(mockLogger);

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/v2/users',
      user: null
    };

    res = {};
    next = jest.fn();
  });

  describe('companyContextMiddleware', () => {
    it('should set req.company to null when user is not authenticated', async () => {
      // Arrange
      req.user = null;

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(req.company).toBeNull();
      expect(next).toHaveBeenCalledWith();
      expect(mockUserCompanyContext.findOne).not.toHaveBeenCalled();
    });

    it('should set req.company to null when sessionState is not present', async () => {
      // Arrange
      req.user = { id: uuidv4() };
      req.user.sessionState = null;

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(req.company).toBeNull();
      expect(mockLogDebug).toHaveBeenCalledWith('No session state found, skipping company context', {
        requestId: 'test-request-id',
        userId: req.user.id
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should load company context when user and sessionState are present', async () => {
      // Arrange
      const userId = uuidv4();
      const companyId = uuidv4();
      const sessionState = 'session-123';
      const mockCompanyData = {
        id: companyId,
        name: 'Test Company',
        isActive: true
      };

      req.user = {
        id: userId,
        sessionState: sessionState
      };

      const mockContext = {
        keycloakSessionId: sessionState,
        company: mockCompanyData
      };

      mockUserCompanyContext.findOne.mockResolvedValue(mockContext);

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(mockUserCompanyContext.findOne).toHaveBeenCalledWith({
        where: { keycloakSessionId: sessionState },
        include: [
          {
            model: mockCompany,
            as: 'company',
            required: false
          }
        ]
      });
      expect(req.company).toEqual({
        id: companyId,
        name: 'Test Company',
        isActive: true
      });
      expect(mockLogDebug).toHaveBeenCalledWith('Company context loaded', {
        requestId: 'test-request-id',
        userId: userId,
        companyId: companyId,
        companyName: 'Test Company'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should set req.company to null when context not found', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: 'session-123'
      };

      mockUserCompanyContext.findOne.mockResolvedValue(null);

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(req.company).toBeNull();
      expect(mockLogDebug).toHaveBeenCalledWith('No company context found for session', {
        requestId: 'test-request-id',
        userId: req.user.id,
        sessionState: 'session-123'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should set req.company to null when context found but company is null', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: 'session-123'
      };

      const mockContext = {
        keycloakSessionId: 'session-123',
        company: null
      };

      mockUserCompanyContext.findOne.mockResolvedValue(mockContext);

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(req.company).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle errors gracefully and continue', async () => {
      // Arrange
      req.user = {
        id: uuidv4(),
        sessionState: 'session-123'
      };

      const error = new Error('Database error');
      mockUserCompanyContext.findOne.mockRejectedValue(error);

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(req.company).toBeNull();
      expect(mockLogError).toHaveBeenCalledWith('Company context middleware error', error, {
        requestId: 'test-request-id',
        userId: req.user.id,
        path: '/api/v2/users'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should use socket remoteAddress as fallback for IP', async () => {
      // Arrange
      req.ip = undefined;
      req.socket = { remoteAddress: '192.168.1.1' };
      req.user = null;

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        'anonymous',
        '192.168.1.1'
      );
    });

    it('should create request logger with user ID when authenticated', async () => {
      // Arrange
      const userId = uuidv4();
      req.user = {
        id: userId,
        sessionState: 'session-123'
      };
      mockUserCompanyContext.findOne.mockResolvedValue(null);

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      expect(mockCreateRequestLogger).toHaveBeenCalledWith(
        'test-request-id',
        userId,
        '127.0.0.1'
      );
    });

    it('should use generated request ID for logging when not present', async () => {
      // Arrange
      req.id = undefined;
      req.user = null;

      // Act
      await companyContextMiddleware.companyContextMiddleware(req, res, next);

      // Assert
      // The middleware uses req.id || `req-${Date.now()}` for logging, but doesn't set req.id
      // So we just verify it doesn't crash and continues
      expect(next).toHaveBeenCalledWith();
      expect(mockCreateRequestLogger).toHaveBeenCalled();
    });
  });
});

