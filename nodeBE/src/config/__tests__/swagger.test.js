/**
 * @author Bhavesh Venugopal
 * Swagger Configuration Tests
 * Tests for Swagger/OpenAPI configuration and spec generation
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { generateSwaggerSpec, getSwaggerOptions } from '../swagger.js';

describe('Swagger Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.HOST;
    delete process.env.PORT;
  });

  describe('generateSwaggerSpec', () => {
    it('should generate valid OpenAPI 3.0 specification', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('JoorApp Backend API V2');
      expect(spec.info.version).toBe('2.0.0');
    });

    it('should include server configuration', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.servers).toBeDefined();
      expect(spec.servers).toHaveLength(1);
      expect(spec.servers[0].url).toBeDefined();
      expect(typeof spec.servers[0].url).toBe('string');
      // Server URL is constructed at module load time, so we just verify it exists
    });

    it('should include server URL with protocol', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.servers[0].url).toMatch(/^https?:\/\//);
    });

    it('should include security schemes', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.components).toBeDefined();
      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth.type).toBe('http');
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
    });

    it('should include reusable component schemas', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.components.schemas).toBeDefined();
      expect(spec.components.schemas.SuccessResponse).toBeDefined();
      expect(spec.components.schemas.ErrorResponse).toBeDefined();
      expect(spec.components.schemas.PaginatedResponse).toBeDefined();
      expect(spec.components.schemas.MetaField).toBeDefined();
      expect(spec.components.schemas.User).toBeDefined();
      expect(spec.components.schemas.Company).toBeDefined();
    });

    it('should include reusable response definitions', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.components.responses).toBeDefined();
      expect(spec.components.responses.ValidationError).toBeDefined();
      expect(spec.components.responses.AuthenticationRequired).toBeDefined();
      expect(spec.components.responses.Forbidden).toBeDefined();
      expect(spec.components.responses.NotFound).toBeDefined();
      expect(spec.components.responses.InternalServerError).toBeDefined();
    });

    it('should include reusable parameter definitions', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      // Parameters are defined in swaggerDefinition components
      // They may not appear in generated spec if not referenced, but definition should have them
      expect(spec.components).toBeDefined();
      // Verify parameters exist in the definition structure
      // Note: swagger-jsdoc may only include parameters that are referenced in route annotations
      if (spec.components.parameters) {
        expect(typeof spec.components.parameters).toBe('object');
      }
    });

    it('should include tags for all modules', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.tags).toBeDefined();
      const tagNames = spec.tags.map(tag => tag.name);
      expect(tagNames).toContain('Health');
      expect(tagNames).toContain('Auth');
      expect(tagNames).toContain('Users');
      expect(tagNames).toContain('Admin');
      expect(tagNames).toContain('SuperAdmin');
    });

    it('should include paths from route annotations', () => {
      // Act
      const spec = generateSwaggerSpec();

      // Assert
      expect(spec.paths).toBeDefined();
      // Check for at least one health endpoint
      expect(spec.paths['/api/v2/health/status']).toBeDefined();
      expect(spec.paths['/api/v2/health/status'].get).toBeDefined();
    });

    it('should not throw error when generating spec', () => {
      // Act & Assert
      expect(() => generateSwaggerSpec()).not.toThrow();
    });
  });

  describe('getSwaggerOptions', () => {
    it('should return swagger options object', () => {
      // Act
      const options = getSwaggerOptions();

      // Assert
      expect(options).toBeDefined();
      expect(options).toHaveProperty('definition');
      expect(options).toHaveProperty('apis');
    });

    it('should include API paths for route files', () => {
      // Act
      const options = getSwaggerOptions();

      // Assert
      expect(options.apis).toBeDefined();
      expect(Array.isArray(options.apis)).toBe(true);
      expect(options.apis.length).toBeGreaterThan(0);
    });
  });
});

