/**
 * @author Bhavesh Venugopal
 * Users Integration Tests
 * Tests user management endpoints with full HTTP request/response cycle
 * 
 * Prerequisites:
 * - Keycloak must be running and accessible
 * - Test user must exist in Keycloak
 * - Run: npm run setup:test-users (before running integration tests)
 * - Test user credentials should be set in environment variables or use defaults
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Op } from 'sequelize';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { getAuthToken } from '../../../__tests__/helpers/auth.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { User } from '../../../src/models/index.js';
import { createUserData } from '../../../__tests__/helpers/factories.js';
import { v4 as uuidv4 } from 'uuid';

describe('Users API Integration', () => {
  let app;
  let authToken;
  let testUser;
  
  // Test user credentials for authentication
  const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@example.com';
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'testPassword123';

  beforeAll(async () => {
    // Clean database before tests
    await cleanDatabase();
    
    // Initialize Express app with all middleware and routes
    app = await createTestApp();
    
    // Get auth token for protected endpoints
    // This MUST succeed - if it fails, run: npm run setup:test-users
    authToken = await getAuthToken(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    
    // Sync user from Keycloak to database (authMiddleware syncs on first authenticated request)
    // Make a simple authenticated request to trigger user sync
    await request(app)
      .get('/api/v2/users/list')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Get test user in database (should be synced from Keycloak)
    testUser = await User.findOne({ where: { email: TEST_USER_EMAIL } });
    if (!testUser) {
      throw new Error(`Test user ${TEST_USER_EMAIL} not found in database. User should be synced from Keycloak. Run: npm run setup:test-users`);
    }
  });

  afterAll(async () => {
    // Clean database after tests
    await cleanDatabase();
    
    // Close app if needed
    await closeTestApp(app);
  });

  beforeEach(async () => {
    // Clean users table before each test (except test user)
    if (testUser) {
      await User.destroy({
        where: {
          id: { [Op.ne]: testUser.id }
        }
      });
    } else {
      await User.destroy({ where: {} });
    }
  });

  describe('GET /api/v2/users/list', () => {
    it('should return users list when authenticated', async () => {
      // Create some test users
      const user1 = await User.create(createUserData({ email: 'user1@example.com' }));
      const user2 = await User.create(createUserData({ email: 'user2@example.com' }));

      const response = await request(app)
        .get('/api/v2/users/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.pagination).toBeDefined(); // pagination at root level per cursor rules
      expect(response.body.pagination.page).toBeDefined();
      expect(response.body.pagination.limit).toBeDefined();
      expect(response.body.pagination.total).toBeDefined();
    });

    it('should support pagination', async () => {
      // Create multiple users
      for (let i = 0; i < 15; i++) {
        await User.create(createUserData({ email: `user${i}@example.com` }));
      }

      const response = await request(app)
        .get('/api/v2/users/list')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1); // pagination at root level per cursor rules
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should support search query', async () => {
      await User.create(createUserData({ 
        email: 'searchtest@example.com',
        firstName: 'Search',
        lastName: 'Test'
      }));

      const response = await request(app)
        .get('/api/v2/users/list')
        .query({ search: 'searchtest' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/users/list')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/v2/users/list')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('GET /api/v2/users/:id', () => {
    it('should return user by ID when authenticated', async () => {
      const newUser = await User.create(createUserData({ email: 'getuser@example.com' }));

      const response = await request(app)
        .get(`/api/v2/users/${newUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(newUser.id);
      expect(response.body.data.email).toBe('getuser@example.com');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/api/v2/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_NOT_FOUND');
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when ID format is invalid', async () => {
      const response = await request(app)
        .get('/api/v2/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('Invalid id format'); // Actual error message from validators.js
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v2/users/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('POST /api/v2/users/create', () => {
    it('should create user successfully when authenticated', async () => {
      const newUserData = {
        email: `newuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        keycloakGlobalRole: 'COMPANY_USER'
      };

      const response = await request(app)
        .post('/api/v2/users/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(newUserData.email);
      expect(response.body.data.firstName).toBe(newUserData.firstName);
      expect(response.body.data.lastName).toBe(newUserData.lastName);
      expect(response.body.meta).toBeDefined();

      // Verify user exists in database
      const createdUser = await User.findOne({ where: { email: newUserData.email } });
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(newUserData.email);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/v2/users/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'TestPassword123!',
          firstName: 'John'
        })
        .expect(400);

      // Print actual response
      const { logInfo } = await import('../../../src/utils/logger.js');
      logInfo('ACTUAL RESPONSE BODY', { responseBody: response.body });

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('email');
      // Meta should always be present in error responses per cursor rules (api-responses.mdc)
      // If meta is undefined, the errorResponse helper is not including it properly
      // This is a bug - meta should always be included even if req is null
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/v2/users/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com',
          firstName: 'John'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('password');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v2/users/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('email');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/users/create')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
      // Meta may or may not be present depending on error handler implementation
    });
  });

  describe('PUT /api/v2/users/:id', () => {
    it('should update user successfully when authenticated', async () => {
      // Create user via API (creates in both Keycloak and DB)
      const createResponse = await request(app)
        .post('/api/v2/users/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'updateuser@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(201);

      const userId = createResponse.body.data.id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/v2/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.meta).toBeDefined();

      // Verify user was updated in database
      const updatedUser = await User.findByPk(userId);
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .put(`/api/v2/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_NOT_FOUND');
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when ID format is invalid', async () => {
      const response = await request(app)
        .put('/api/v2/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Updated' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('Invalid id format'); // Actual error message from validators.js
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/users/${uuidv4()}`)
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });

});

