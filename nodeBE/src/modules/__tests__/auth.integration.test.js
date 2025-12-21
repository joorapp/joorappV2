/**
 * @author Bhavesh Venugopal
 * Auth Integration Tests
 * Tests authentication endpoints with full HTTP request/response cycle and real Keycloak
 * 
 * Prerequisites:
 * - Keycloak must be running and accessible
 * - Test users must exist in Keycloak
 * - Run: npm run setup:test-users (before running integration tests)
 * - Test user credentials should be set in environment variables or use defaults
 */

import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { getAuthToken, getAuthTokens } from '../../../__tests__/helpers/auth.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { User, Company, CompanyUser, CompanyRole, UserCompanyContext } from '../../../src/models/index.js';
import { createUserData, createCompanyData, createRoleData, createCompanyUserData, createContextData } from '../../../__tests__/helpers/factories.js';

describe('Auth API Integration', () => {
  let app;
  let testCompany;
  let testRole;
  
  // Test user credentials - these should exist in Keycloak
  // If not, create them before running tests or set via environment variables
  const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test.user@example.com';
  const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'testPassword123';

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

  describe('POST /api/v2/auth/login', () => {
    it('should login successfully with valid credentials and return tokens, role, and companies', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.data.expires_in).toBeDefined();
      expect(response.body.data.keycloak_global_role).toBeDefined();
      expect(['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER']).toContain(response.body.data.keycloak_global_role);
      expect(Array.isArray(response.body.data.companies)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.requestId).toBeDefined();
      expect(response.body.meta.endpoint).toBe('/api/v2/auth/login');
      expect(response.body.meta.method).toBe('POST');
      
      // Verify user was synced to database
      if (response.body.data.access_token) {
        // User should exist in database after login (synced during login)
        const user = await User.findOne({ where: { email: TEST_USER_EMAIL } });
        expect(user).toBeDefined();
        expect(user.keycloakGlobalRole).toBe(response.body.data.keycloak_global_role);
      }
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          password: TEST_USER_PASSWORD
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('required');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: TEST_USER_EMAIL
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('required');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'invalid-email',
          password: TEST_USER_PASSWORD
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('email');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: TEST_USER_EMAIL,
          password: 'wrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('AUTHENTICATION_FAILED');
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('POST /api/v2/auth/refresh', () => {
    let refreshToken;

    beforeAll(async () => {
      // Get tokens from login for refresh test
      // This MUST succeed - if it fails, run: npm run setup:test-users
      const tokens = await getAuthTokens(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      refreshToken = tokens.refreshToken;
    });

    it('should refresh token successfully with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v2/auth/refresh')
        .send({
          refresh_token: refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when refresh_token is missing', async () => {
      const response = await request(app)
        .post('/api/v2/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('refresh_token');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/v2/auth/refresh')
        .send({
          refresh_token: 'invalid-refresh-token'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });


  describe('POST /api/v2/auth/companies/:companyId/select', () => {
    let authToken;
    let tokens;

    beforeAll(async () => {
      // Get auth token and tokens for company selection
      // This MUST succeed - if it fails, run: npm run setup:test-users
      tokens = await getAuthTokens(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      authToken = tokens.accessToken;
      
      // Create test company and role for company selection test
      // Use a valid user ID from the logged-in user
      const user = await User.findOne({ where: { email: TEST_USER_EMAIL } });
      if (!user) {
        throw new Error(`Test user ${TEST_USER_EMAIL} not found in database. User should be synced from Keycloak after login. Run: npm run setup:test-users`);
      }
      
      const userId = user.id;
      
      // Create test company
      testCompany = await Company.create(createCompanyData(), { context: { userId } });
      
      // Create test role
      testRole = await CompanyRole.create(createRoleData(), { context: { userId } });
      
      // Assign user to company
      const existingAssignment = await CompanyUser.findOne({
        where: {
          userId: user.id,
          companyId: testCompany.id
        }
      });
      
      if (!existingAssignment) {
        await CompanyUser.create(
          createCompanyUserData(user.id, testCompany.id, testRole.id),
          { context: { userId } }
        );
      }
    });

    it('should select company successfully when authenticated', async () => {
      const response = await request(app)
        .post(`/api/v2/auth/companies/${testCompany.id}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          refresh_token: tokens.refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/api/v2/auth/companies/${testCompany.id}/select`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('POST /api/v2/auth/logout', () => {
    let authToken;
    let refreshToken;

    beforeAll(async () => {
      // Get tokens for logout test
      // This MUST succeed - if it fails, run: npm run setup:test-users
      const tokens = await getAuthTokens(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      authToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    });

    it('should logout successfully with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v2/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          refresh_token: refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when refresh_token is missing', async () => {
      // Need to get a fresh token since logout invalidated the previous one
      const freshTokens = await getAuthTokens(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
      
      const response = await request(app)
        .post('/api/v2/auth/logout')
        .set('Authorization', `Bearer ${freshTokens.accessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('refresh_token');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/auth/logout')
        .send({
          refresh_token: 'some-refresh-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });
  });
});

