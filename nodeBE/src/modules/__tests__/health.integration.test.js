/**
 * @author Bhavesh Venugopal
 * Health Integration Tests
 * Tests health check endpoints with full HTTP request/response cycle
 */

import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('Health API Integration', () => {
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

  describe('GET /api/v2/health/status', () => {
    it('should return health status with system information', async () => {
      const response = await request(app)
        .get('/api/v2/health/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is running');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.version).toBe('2.0.0');
      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.used).toBeDefined();
      expect(response.body.memory.total).toBeDefined();
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/api/v2/health/status')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return uptime as a number', async () => {
      const response = await request(app)
        .get('/api/v2/health/status')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v2/health/ping', () => {
    it('should return pong response', async () => {
      const response = await request(app)
        .get('/api/v2/health/ping')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pong!');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
      expect(response.body.responseTime).toMatch(/\d+ms/);
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/api/v2/health/ping')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v2/health/database', () => {
    it('should return database health status', async () => {
      const response = await request(app)
        .get('/api/v2/health/database')
        .expect(200);

      expect(response.body.success).toBeDefined();
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.database).toBeDefined();
    });

    it('should return healthy database status when connection succeeds', async () => {
      const response = await request(app)
        .get('/api/v2/health/database')
        .expect(200);

      // Database should be healthy in test environment
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('healthy');
      expect(response.body.database).toBeDefined();
    });
  });

  describe('GET /api/v2/health/metrics', () => {
    it('should return system metrics', async () => {
      const response = await request(app)
        .get('/api/v2/health/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.metrics).toBeDefined();
    });

    it('should include memory metrics', async () => {
      const response = await request(app)
        .get('/api/v2/health/metrics')
        .expect(200);

      expect(response.body.metrics.memory).toBeDefined();
      expect(response.body.metrics.memory.heapUsed).toBeDefined();
      expect(response.body.metrics.memory.heapTotal).toBeDefined();
      expect(response.body.metrics.memory.rss).toBeDefined();
    });

    it('should include system information', async () => {
      const response = await request(app)
        .get('/api/v2/health/metrics')
        .expect(200);

      expect(response.body.metrics.system).toBeDefined();
      expect(response.body.metrics.system.platform).toBeDefined();
      expect(response.body.metrics.system.nodeVersion).toBeDefined();
      expect(response.body.metrics.system.uptime).toBeDefined();
    });
  });

  describe('Health endpoints - No authentication required', () => {
    it('should allow access to health endpoints without authentication', async () => {
      const endpoints = [
        '/api/v2/health/status',
        '/api/v2/health/ping',
        '/api/v2/health/database',
        '/api/v2/health/metrics'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });
});

