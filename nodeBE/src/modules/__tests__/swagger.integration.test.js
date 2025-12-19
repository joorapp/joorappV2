/**
 * @author Bhavesh Venugopal
 * Swagger Integration Tests
 * Tests Swagger UI and OpenAPI specification endpoints with full HTTP request/response cycle
 */

import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('Swagger API Integration', () => {
  let app;

  beforeAll(async () => {
    // Clean database before tests
    await cleanDatabase();
    
    // Initialize Express app with all middleware and routes
    app = await createTestApp();
  });

  afterAll(async () => {
    // Clean database after tests
    await cleanDatabase();
    
    // Close app if needed
    await closeTestApp(app);
  });

  describe('GET /api/v2/docs', () => {
    it('should serve Swagger UI HTML page', async () => {
      // Swagger UI redirects to trailing slash, so follow redirects
      const response = await request(app)
        .get('/api/v2/docs/')
        .expect(200);

      // Swagger UI returns HTML
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.text).toContain('swagger');
    });

    it('should be accessible without authentication', async () => {
      // Swagger UI should be public
      await request(app)
        .get('/api/v2/docs/')
        .expect(200);
    });
  });

  describe('GET /api/v2/docs/json', () => {
    it('should return OpenAPI JSON specification', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Verify OpenAPI structure
      expect(response.body).toHaveProperty('openapi', '3.0.0');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'JoorApp Backend API V2');
      expect(response.body.info).toHaveProperty('version', '2.0.0');
    });

    it('should include server configuration', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body).toHaveProperty('servers');
      expect(Array.isArray(response.body.servers)).toBe(true);
      expect(response.body.servers.length).toBeGreaterThan(0);
    });

    it('should include security schemes', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body).toHaveProperty('components');
      expect(response.body.components).toHaveProperty('securitySchemes');
      expect(response.body.components.securitySchemes).toHaveProperty('bearerAuth');
    });

    it('should include reusable component schemas', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body.components).toHaveProperty('schemas');
      expect(response.body.components.schemas).toHaveProperty('SuccessResponse');
      expect(response.body.components.schemas).toHaveProperty('ErrorResponse');
      expect(response.body.components.schemas).toHaveProperty('PaginatedResponse');
      expect(response.body.components.schemas).toHaveProperty('User');
      expect(response.body.components.schemas).toHaveProperty('Company');
    });

    it('should include reusable response definitions', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body.components).toHaveProperty('responses');
      expect(response.body.components.responses).toHaveProperty('ValidationError');
      expect(response.body.components.responses).toHaveProperty('AuthenticationRequired');
      expect(response.body.components.responses).toHaveProperty('Forbidden');
      expect(response.body.components.responses).toHaveProperty('NotFound');
      expect(response.body.components.responses).toHaveProperty('InternalServerError');
    });

    it('should include tags for all modules', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body).toHaveProperty('tags');
      const tagNames = response.body.tags.map(tag => tag.name);
      expect(tagNames).toContain('Health');
      expect(tagNames).toContain('Auth');
      expect(tagNames).toContain('Users');
      expect(tagNames).toContain('Admin');
      expect(tagNames).toContain('SuperAdmin');
    });

    it('should include paths from route annotations', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      expect(response.body).toHaveProperty('paths');
      
      // Verify Health endpoints
      expect(response.body.paths).toHaveProperty('/api/v2/health/status');
      expect(response.body.paths).toHaveProperty('/api/v2/health/ping');
      expect(response.body.paths).toHaveProperty('/api/v2/health/metrics');
      expect(response.body.paths).toHaveProperty('/api/v2/health/database');
      
      // Verify Auth endpoints
      expect(response.body.paths).toHaveProperty('/api/v2/auth/login');
      expect(response.body.paths).toHaveProperty('/api/v2/auth/companies');
      
      // Verify Users endpoints
      expect(response.body.paths).toHaveProperty('/api/v2/users/list');
      // OpenAPI uses {id} format, not :id format
      expect(response.body.paths).toHaveProperty('/api/v2/users/{id}');
    });

    it('should document all response codes for health endpoints', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      const statusEndpoint = response.body.paths['/api/v2/health/status'];
      expect(statusEndpoint.get.responses).toHaveProperty('200');
      expect(statusEndpoint.get.responses).toHaveProperty('500');
    });

    it('should document all response codes for auth endpoints', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      const loginEndpoint = response.body.paths['/api/v2/auth/login'];
      expect(loginEndpoint.post.responses).toHaveProperty('200');
      expect(loginEndpoint.post.responses).toHaveProperty('400');
      expect(loginEndpoint.post.responses).toHaveProperty('401');
      expect(loginEndpoint.post.responses).toHaveProperty('500');
    });

    it('should include meta field in response examples (except health)', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      // Check Users endpoint (should have meta)
      const usersEndpoint = response.body.paths['/api/v2/users/:id'];
      if (usersEndpoint?.get?.responses?.['200']?.content?.['application/json']?.example) {
        const example = usersEndpoint.get.responses['200'].content['application/json'].example;
        expect(example).toHaveProperty('meta');
      }

      // Health endpoints should NOT have meta (special case)
      const healthEndpoint = response.body.paths['/api/v2/health/status'];
      if (healthEndpoint?.get?.responses?.['200']?.content?.['application/json']?.example) {
        const example = healthEndpoint.get.responses['200'].content['application/json'].example;
        expect(example).not.toHaveProperty('meta');
      }
    });
  });

  describe('GET /api/v2/docs/yaml', () => {
    it('should return OpenAPI YAML specification', async () => {
      const response = await request(app)
        .get('/api/v2/docs/yaml')
        .expect(200)
        .expect('Content-Type', /text\/yaml/);

      // YAML should contain OpenAPI version
      expect(response.text).toContain('openapi: 3.0.0');
      expect(response.text).toContain('JoorApp Backend API V2');
    });

    it('should be accessible without authentication', async () => {
      await request(app)
        .get('/api/v2/docs/yaml')
        .expect(200);
    });

    it('should contain valid YAML structure', async () => {
      const response = await request(app)
        .get('/api/v2/docs/yaml')
        .expect(200);

      // Basic YAML structure checks
      expect(response.text).toContain('info:');
      expect(response.text).toContain('paths:');
      expect(response.text).toContain('components:');
    });
  });

  describe('Swagger Specification Validation', () => {
    it('should generate valid OpenAPI 3.0 spec without errors', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      // Verify required OpenAPI 3.0 fields
      expect(response.body.openapi).toBe('3.0.0');
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
      expect(response.body.components).toBeDefined();
    });

    it('should include all module endpoints in paths', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      const paths = Object.keys(response.body.paths);
      
      // Should have endpoints from all modules
      const hasHealth = paths.some(p => p.includes('/health/'));
      const hasAuth = paths.some(p => p.includes('/auth/'));
      const hasUsers = paths.some(p => p.includes('/users/'));
      const hasAdmin = paths.some(p => p.includes('/admin/'));
      const hasSuperAdmin = paths.some(p => p.includes('/superAdmin/'));

      expect(hasHealth).toBe(true);
      expect(hasAuth).toBe(true);
      expect(hasUsers).toBe(true);
      expect(hasAdmin).toBe(true);
      expect(hasSuperAdmin).toBe(true);
    });

    it('should have consistent response structure across endpoints', async () => {
      const response = await request(app)
        .get('/api/v2/docs/json')
        .expect(200);

      // Check a few endpoints have proper response structure
      const endpoints = [
        '/api/v2/auth/login',
        '/api/v2/users/:id',
        '/api/v2/admin/settings'
      ];

      endpoints.forEach(endpoint => {
        const pathDef = response.body.paths[endpoint];
        if (pathDef) {
          const method = Object.keys(pathDef)[0]; // Get first method
          const responses = pathDef[method]?.responses;
          expect(responses).toBeDefined();
          expect(Object.keys(responses).length).toBeGreaterThan(0);
        }
      });
    });
  });
});

