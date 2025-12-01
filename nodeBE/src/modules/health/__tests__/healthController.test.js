/**
 * @author Bhavesh Venugopal
 * Health Controller Tests
 * Tests for healthController endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockCreateModuleLogger = jest.fn(() => mockLogger);
const mockLogPerformance = jest.fn();

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  createModuleLogger: mockCreateModuleLogger,
  logPerformance: mockLogPerformance
}));

// Mock database
const mockTestDatabaseConnection = jest.fn();

jest.unstable_mockModule('../../../config/database.js', () => ({
  testDatabaseConnection: mockTestDatabaseConnection
}));

let healthController;
let loggerUtils;
let databaseConfig;

beforeAll(async () => {
  healthController = await import('../healthController.js');
  loggerUtils = await import('../../../utils/logger.js');
  databaseConfig = await import('../../../config/database.js');
});

describe('Health Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      logger: mockLogger
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getHealthStatus', () => {
    it('should return health status with system information', () => {
      // Act
      healthController.getHealthStatus(req, res);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('Health check requested', {
        requestId: 'test-request-id',
        ip: '127.0.0.1'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'API is running',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        version: '2.0.0',
        memory: {
          used: expect.stringMatching(/\d+ MB/),
          total: expect.stringMatching(/\d+ MB/)
        }
      });
    });

    it('should log performance for slow health checks', () => {
      // Arrange
      const startTime = Date.now();
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 150); // 150ms

      // Act
      healthController.getHealthStatus(req, res);

      // Assert
      expect(mockLogPerformance).toHaveBeenCalledWith('Health check', 150, {
        requestId: 'test-request-id',
        module: 'health'
      });

      Date.now.mockRestore();
    });

    it('should handle errors and return 500', () => {
      // Arrange
      const error = new Error('Health check failed');
      mockLogger.info.mockImplementationOnce(() => {
        throw error;
      });

      // Act
      healthController.getHealthStatus(req, res);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Health check failed', {
        requestId: 'test-request-id',
        error: {
          message: 'Health check failed',
          stack: expect.any(String)
        },
        duration: expect.any(String)
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Health check failed',
        error: 'Health check failed',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getPing', () => {
    it('should return ping response', () => {
      // Act
      healthController.getPing(req, res);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith('Ping requested', {
        requestId: 'test-request-id',
        ip: '127.0.0.1'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pong!',
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/\d+ms/)
      });
    });

    it('should handle errors and return 500', () => {
      // Arrange
      const error = new Error('Ping failed');
      mockLogger.debug.mockImplementationOnce(() => {
        throw error;
      });

      // Act
      healthController.getPing(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Ping failed',
        error: 'Ping failed',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics', () => {
      // Act
      healthController.getSystemMetrics(req, res);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('System metrics requested', {
        requestId: 'test-request-id',
        ip: '127.0.0.1'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'System metrics retrieved successfully',
        timestamp: expect.any(String),
        metrics: {
          system: {
            platform: expect.any(String),
            arch: expect.any(String),
            nodeVersion: expect.any(String),
            uptime: expect.any(Number)
          },
          memory: expect.any(Object),
          cpu: expect.any(Object),
          environment: {
            nodeEnv: expect.any(String),
            port: expect.any(String),
            corsOrigin: expect.any(String)
          }
        }
      });
    });

    it('should log performance for slow system metrics requests', () => {
      // Arrange
      const startTime = Date.now();
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 250); // 250ms

      // Act
      healthController.getSystemMetrics(req, res);

      // Assert
      expect(mockLogPerformance).toHaveBeenCalledWith('System metrics', 250, {
        requestId: 'test-request-id',
        module: 'health'
      });

      Date.now.mockRestore();
    });

    it('should handle errors and return 500', () => {
      // Arrange
      const error = new Error('Metrics failed');
      mockLogger.info.mockImplementationOnce(() => {
        throw error;
      });

      // Act
      healthController.getSystemMetrics(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve system metrics',
        error: 'Metrics failed',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getDatabaseHealth', () => {
    it('should return healthy database status when connection succeeds', async () => {
      // Arrange
      mockTestDatabaseConnection.mockResolvedValue({
        success: true,
        database: 'test_db',
        host: 'localhost',
        port: 3306,
        sequelizeVersion: '6.0.0'
      });

      // Act
      await healthController.getDatabaseHealth(req, res);

      // Assert
      expect(mockTestDatabaseConnection).toHaveBeenCalled();
      expect(req.logger.info).toHaveBeenCalledWith('Database health check requested', {
        requestId: 'test-request-id',
        ip: '127.0.0.1'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Database connection is healthy',
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/\d+ms/),
        database: {
          connected: true,
          database: 'test_db',
          host: 'localhost',
          port: 3306,
          sequelizeVersion: '6.0.0'
        }
      });
    });

    it('should return unhealthy database status when connection fails', async () => {
      // Arrange
      mockTestDatabaseConnection.mockResolvedValue({
        success: false,
        error: 'Connection timeout',
        database: 'test_db',
        host: 'localhost',
        port: 3306
      });

      // Act
      await healthController.getDatabaseHealth(req, res);

      // Assert
      expect(req.logger.warn).toHaveBeenCalledWith('Database health check failed', {
        requestId: 'test-request-id',
        duration: expect.any(String),
        error: 'Connection timeout',
        database: 'test_db'
      });
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection is unhealthy',
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/\d+ms/),
        database: {
          connected: false,
          database: 'test_db',
          host: 'localhost',
          port: 3306,
          error: 'Connection timeout'
        }
      });
    });

    it('should handle errors and return 500', async () => {
      // Arrange
      const error = new Error('Database check failed');
      mockTestDatabaseConnection.mockRejectedValue(error);

      // Act
      await healthController.getDatabaseHealth(req, res);

      // Assert
      expect(req.logger.error).toHaveBeenCalledWith('Database health check failed with exception', {
        requestId: 'test-request-id',
        error: {
          message: 'Database check failed',
          stack: expect.any(String)
        },
        duration: expect.any(String)
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database health check failed',
        error: 'Database check failed',
        timestamp: expect.any(String),
        responseTime: expect.stringMatching(/\d+ms/)
      });
    });

    it('should log performance for slow database health checks', async () => {
      // Arrange
      const startTime = Date.now();
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 600); // 600ms

      mockTestDatabaseConnection.mockResolvedValue({
        success: true,
        database: 'test_db',
        host: 'localhost',
        port: 3306
      });

      // Act
      await healthController.getDatabaseHealth(req, res);

      // Assert
      expect(mockLogPerformance).toHaveBeenCalledWith('Database health check', 600, {
        requestId: 'test-request-id',
        module: 'health'
      });

      Date.now.mockRestore();
    });
  });
});

