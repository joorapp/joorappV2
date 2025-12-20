/**
 * @author Bhavesh Venugopal
 * Docs Controller Tests
 * Tests for Swagger documentation controller endpoints
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';

// Mock swagger config
jest.unstable_mockModule('../../../config/swagger.js', () => ({
  generateSwaggerSpec: jest.fn(() => ({
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0'
    },
    paths: {}
  }))
}));

// Mock js-yaml
jest.unstable_mockModule('js-yaml', () => ({
  default: {
    dump: jest.fn((spec) => `yaml: ${JSON.stringify(spec)}`)
  }
}));

// Mock logger
jest.unstable_mockModule('../../../utils/logger.js', () => ({
  createModuleLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn()
  }))
}));

describe('Docs Controller', () => {
  let getSwaggerJson, getSwaggerYaml;
  let generateSwaggerSpec;
  let yaml;
  let mockReq, mockRes;

  beforeAll(async () => {
    const controllerModule = await import('../docsController.js');
    getSwaggerJson = controllerModule.getSwaggerJson;
    getSwaggerYaml = controllerModule.getSwaggerYaml;

    const swaggerModule = await import('../../../config/swagger.js');
    generateSwaggerSpec = swaggerModule.generateSwaggerSpec;

    const yamlModule = await import('js-yaml');
    yaml = yamlModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      id: 'test-request-id',
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1'
      }
    };

    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  describe('getSwaggerJson', () => {
    it('should return OpenAPI JSON specification with 200 status', () => {
      // Arrange
      const mockSpec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' }
      };
      generateSwaggerSpec.mockReturnValue(mockSpec);

      // Act
      getSwaggerJson(mockReq, mockRes);

      // Assert
      expect(generateSwaggerSpec).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSpec);
    });

    it('should handle errors and return 500 status', () => {
      // Arrange
      const error = new Error('Generation failed');
      generateSwaggerSpec.mockImplementation(() => {
        throw error;
      });

      // Act
      getSwaggerJson(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate Swagger specification',
        timestamp: expect.any(String)
      });
    });

    it('should use req.socket.remoteAddress if req.ip is not available', () => {
      // Arrange
      delete mockReq.ip;
      const mockSpec = { openapi: '3.0.0', info: {} };
      generateSwaggerSpec.mockReturnValue(mockSpec);

      // Act
      getSwaggerJson(mockReq, mockRes);

      // Assert
      expect(generateSwaggerSpec).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getSwaggerYaml', () => {
    it('should return OpenAPI YAML specification with 200 status', () => {
      // Arrange
      const mockSpec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' }
      };
      generateSwaggerSpec.mockReturnValue(mockSpec);
      yaml.dump.mockReturnValue('openapi: 3.0.0\ninfo:\n  title: Test API');

      // Act
      getSwaggerYaml(mockReq, mockRes);

      // Assert
      expect(generateSwaggerSpec).toHaveBeenCalled();
      expect(yaml.dump).toHaveBeenCalledWith(mockSpec, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/yaml');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle errors and return 500 status', () => {
      // Arrange
      const error = new Error('Generation failed');
      generateSwaggerSpec.mockImplementation(() => {
        throw error;
      });

      // Act
      getSwaggerYaml(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate Swagger specification',
        timestamp: expect.any(String)
      });
    });

    it('should use correct YAML dump options', () => {
      // Arrange
      const mockSpec = { openapi: '3.0.0' };
      generateSwaggerSpec.mockReturnValue(mockSpec);
      yaml.dump.mockReturnValue('yaml content');

      // Act
      getSwaggerYaml(mockReq, mockRes);

      // Assert
      expect(yaml.dump).toHaveBeenCalledWith(mockSpec, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
    });
  });
});

